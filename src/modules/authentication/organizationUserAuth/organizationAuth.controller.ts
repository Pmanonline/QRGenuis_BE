import { Request, Response, NextFunction } from "express";
import OrganizationModel from "./organizationAuth.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import catchAsync from "../../../utilities/catchAsync";
import AppError from "../../../utilities/appError";
import { sendVerificationEmail } from "../../../utilities/email.utils";
import IndividualUser from "../individualUserAuth/individualUserAuth.model";

interface TokenPayload {
  id: string;
}

const signToken = (id: string): string => {
  const payload: TokenPayload = { id };
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const organizationUserSignup = async (req: Request, res: Response) => {
  try {
    const {
      organization_name,
      organization_email,
      contact_email,
      contact_number,
      password,
      password_confirmation,
    } = req.body;

    if (!organization_name) {
      res.status(400).json({
        status: "fail",
        message: "Organization name is required",
      });
    } else if (!organization_email) {
      res.status(400).json({
        status: "fail",
        message: "Organization email is required",
      });
    } else if (!contact_email) {
      res.status(400).json({
        status: "fail",
        message: "Contact email is required",
      });
    } else if (!contact_number) {
      res.status(400).json({
        status: "fail",
        message: "Contact number is required",
      });
    } else if (!password) {
      res.status(400).json({
        status: "fail",
        message: "Password is required",
      });
    } else if (!password_confirmation) {
      res.status(400).json({
        status: "fail",
        message: "Password confirmation  is required",
      });
    }

    if (password !== password_confirmation) {
      res.status(401).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    const individualEmailAlreadyExist = await IndividualUser.findOne({
      email: organization_email,
    });
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      organization_email,
    });

    if (organizationEmailAlreadyExist || individualEmailAlreadyExist) {
      res.status(409).json({
        status: "failed",
        message: "User with email already exist",
      });
    }

    // Create a new user
    const newUser = new OrganizationModel({
      organization_name,
      organization_email,
      contact_email,
      contact_number,
      password,
      role: "org",
    });

    // Save the user to the database
    await newUser.save();

    const verificationToken = jwt.sign(
      {
        email: newUser.organization_email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: 60 * 60,
      }
    );

    await sendVerificationEmail(organization_email, verificationToken);

    res.status(201).json({
      status: "true",
      message:
        "Account is unverified! Verification email sent. Verify account to continue. Please note that token expires in an hour",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error registering the user:", error);
    res.status(500).json({ message: "Error registering the user", error });
  }
};

export const organizationUserResetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const org = await OrganizationModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is org, set the new password
    if (!org) {
      next(new AppError("Token is invalid or has expired", 400));
      return;
    }
    org.password = req.body.password;
    org.passwordResetToken = undefined;
    org.passwordResetExpires = undefined;
    await org.save();

    // 3) Update changedPasswordAt property for the org
    // 4) Log the org in, send JWT
    createSendToken(org, 200, res);
  }
);
