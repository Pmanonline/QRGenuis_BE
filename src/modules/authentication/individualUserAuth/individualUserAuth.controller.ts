import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import IndividualUser from "./individualUserAuth.model";
import PasswordToken from "./individualAuthPasswordToken";
import {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../../../utilities/email.utils";

import OrganizationModel from "../organizationUserAuth/organizationAuth.model";
import bcrypt from "bcrypt";
import { signJwt } from "../../../utilities/signAndVerifyToken.util";
import { OAuth2Client } from "google-auth-library";
import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";
import { ErrorResponse } from "../../../utilities/errorHandler.util"; // Import the interface

export const individualUserRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone_number, password, confirm_password } = req.body;

    if (!email || !phone_number || !password || !confirm_password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message:
          "All fields (email, phone_number, password, confirm_password) are required",
      };
      return next(error);
    }

    if (password !== confirm_password) {
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Password do not match",
      };
      return next(error);
    }

    const individualEmailAlreadyExist = await IndividualUser.findOne({ email });
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      email,
    });

    if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "User already exists, please proceed to login",
      };
      return next(error);
    }

    const newUser = new IndividualUser({
      email,
      phone_number,
      password,
      role: "user",
    });

    await newUser.save();

    const verificationToken = jwt.sign(
      { email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" }
    );

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      status: "true",
      message:
        "Account is unverified! Verification email sent. Verify account to continue. Please note that token expires in 2 hours",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error registering the user",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const individualUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email and password are required",
      };
      return next(error);
    }

    const user = await IndividualUser.findOne({ email }).select("+password");
    if (!user || !user.password) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "User not found",
      };
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Invalid email or password",
      };
      return next(error);
    }

    if (!user.email_verified) {
      const error: ErrorResponse = {
        statusCode: 403,
        status: "fail",
        message: "Please verify your email first",
      };
      return next(error);
    }

    const userData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
    };

    // ADMIN: OTP
    if (user.role === "admin") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Extract username *once* – optional, only if you use it later
      const username = user.email.split("@")[0];

      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await user.save();

      // Correct call – only 2 arguments
      await sendOTPEmail(email, otp);

      return res.status(200).json({
        message: "OTP sent to your email",
        requireOTP: true,
        user: userData,
      });
    }

    // REGULAR USER: Tokens
    const tokens = await createSessionAndSendTokens({
      user: user.toObject(),
      userAgent: req.get("user-agent") || "unknown",
      role: user.role,
      message: "Login successful",
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userData,
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error logging in",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const resetIndividualPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Token and password are required",
      };
      return next(error);
    }

    // Hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid, non-expired token
    const passwordToken = await PasswordToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!passwordToken) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or expired reset token",
      };
      return next(error);
    }

    // Find user
    const user = await IndividualUser.findById(passwordToken.owner);
    if (!user) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "User not found",
      };
      return next(error);
    }

    // Update password (hashed by pre-save)
    user.password = password;
    await user.save();

    // Delete token
    await PasswordToken.findByIdAndDelete(passwordToken._id);

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error resetting password",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or missing token",
      };
      return next(error);
    }

    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or expired verification token",
      };
      return next(error);
    }

    const user = await IndividualUser.findOne({ email: decoded.email });
    if (!user) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "User not found",
      };
      return next(error);
    }

    if (user.email_verified) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email already verified",
      };
      return next(error);
    }

    user.email_verified = true;
    await user.save();

    // Send welcome email after successful verification
    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error verifying email",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email is required",
      };
      return next(error);
    }

    const user = await IndividualUser.findOne({ email });
    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Delete old tokens
    await PasswordToken.deleteMany({ owner: user._id });

    // Save new token
    await new PasswordToken({
      owner: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    }).save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    return res.status(200).json({
      status: "success",
      message: "Password reset link sent",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error sending reset email",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};
