import { Request, NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  sendURLEmail,
  sendVerificationEmail,
} from "../../utilities/email.utils";
import { createSessionAndSendTokens } from "../../utilities/createSessionAndSendToken.util";
import AppError from "../../utilities/appError";
import catchAsync from "../../utilities/catchAsync";
import { BlacklistedToken } from "../blacklistedTokens/blacklistedToken.model";
import IndividualUser, {
  IndividualUserDocument,
} from "./individualUserAuth/individualUserAuth.model";
import OrganizationModel, {
  organizationalDoc,
} from "./organizationUserAuth/organizationAuth.model";
import * as crypto from "crypto";

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

interface VerifyEmailRequest {
  body: { token?: unknown };
  // query: {
  //   token?: unknown;
  // };
}
export const verifyUserEmail = async (
  req: VerifyEmailRequest,
  res: Response
) => {
  try {
    const { token } = req.body;

    const checkIfBlacklistedToken = await BlacklistedToken.findOne({
      token,
    });

    if (checkIfBlacklistedToken) {
      res.status(400).json({
        status: false,
        message:
          "Link has already been used. Kindly attempt login to regenerate confirm email link!",
      });
    }

    const { email } = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Check if the user exists and is verified
    const user = await checkIfUserExist(email);

    if (!user) {
      res.status(400).json({ message: "User with this email does not exist" });
      return;
    }
    if (user?.email_verified) {
      res.status(400).json({ message: "User is already verified." });
    }

    await BlacklistedToken.create({
      token,
    });

    // Update user's verification status
    user.email_verified = true;
    await user?.save();

    // Respond with success message
    res.status(200).json({
      message: "Email verified successfully. Kindly go ahead to login",
      status: "true",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error verifying email:", error);

    if (error.name === "TokenExpiredError") {
      res.status(400).json({
        status: false,
        message:
          "Your token has expired. Kindly attempt login to regenerate confirm email link!", //expired token
      });
    }

    if (error.name === "JsonWebTokenError") {
      res.status(400).json({
        status: false,
        message: "Invalid Token!!", // invalid token
      });
    }
    res.status(500).json({ message: "Error verifying email" });
  }
};

export const UserLogin = async (req: Request, res: Response) => {
  const { email, user_password } = req.body as {
    email: string;
    user_password: string;
  };

  if (!email || !user_password) {
    res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const individualUserToLogin = await IndividualUser.findOne({
      email,
    }).select("+password");

    const organizationUserToLogin = await OrganizationModel.findOne({
      organization_email: email,
    }).select("+password");

    // if (!individualUserToLogin) {
    //   return res.status(400).json({
    //     message:
    //       "You do not have an account, please proceed to the signup page to create an account.",
    //   });
    // }

    if (individualUserToLogin) {
      if (individualUserToLogin.role === "g-ind") {
        res.status(400).json({
          message: "Your account was created with Google. Kindly login Google.",
        });
      }

      if (!individualUserToLogin.email_verified) {
        const verificationToken = jwt.sign(
          { email },
          process.env.JWT_SECRET as string,
          { expiresIn: 60 * 60 }
        );
        await sendVerificationEmail(email, verificationToken);
        console.log(sendVerificationEmail(email, verificationToken));

        res.status(200).json({
          status: "false",
          message:
            "Account is unverified! Verfication email sent. verify account to continue",
        });
      }

      const passwordMatch = await individualUserToLogin.comparePassword(
        user_password
      );
      if (!passwordMatch) {
        res.status(422).json({
          error:
            "Incorrect Password, please enter the correct password or proceed to reset password",
        });
      }

      const { ...userWithoutPassword } = individualUserToLogin.toObject();
      const {
        status,
        message,
        user: userWithoutPasswordForSession,
        accessToken,
        refreshToken,
      } = await createSessionAndSendTokens({
        user: userWithoutPassword,
        userAgent: req.get("user-agent") || "",
        role: individualUserToLogin.role,
        message: "Individual user successfully logged in",
      });

      delete userWithoutPasswordForSession.password;

      res.status(200).json({
        status,
        message,
        user: userWithoutPasswordForSession,
        refreshToken,
        accessToken,
      });
    } else {
      if (!organizationUserToLogin) {
        res.status(400).json({
          message:
            "You do not have an account, please proceed to the signup page to create an account.",
        });
      }

      if (organizationUserToLogin) {
        if (organizationUserToLogin.role === "g-org") {
          res.status(400).json({
            message:
              "Your account was created with Google. Kindly login Google.",
          });
        }
        if (!organizationUserToLogin.email_verified) {
          const verificationToken = jwt.sign(
            { email: organizationUserToLogin.organization_email },
            process.env.JWT_SECRET as string,
            { expiresIn: 60 * 60 }
          );
          await sendVerificationEmail(
            organizationUserToLogin.organization_email,
            verificationToken
          );
          res.status(200).json({
            status: "true",
            message:
              "Account is unverified! Verification email sent. Verify account to continue. Please note that token expires in an hour",
          });
        }

        const passwordMatch = await organizationUserToLogin.comparePassword(
          user_password
        );

        if (!passwordMatch) {
          res.status(422).json({ error: "Incorrect Password" });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } =
          organizationUserToLogin.toObject();
        const {
          status,
          message,
          user: userWithoutPasswordForSession,
          accessToken,
          refreshToken,
        } = await createSessionAndSendTokens({
          user: userWithoutPassword,
          userAgent: req.get("user-agent") || "",
          role: organizationUserToLogin.role,
          message: "Organization user successfully logged in",
        });

        delete userWithoutPasswordForSession.password;

        res.status(200).json({
          status,
          message,
          user: userWithoutPasswordForSession,
          refreshToken,
          accessToken,
        });
      }
    }
  } catch (error) {
    // console.log("Error Logging in user:", error);
    res.status(500).json({ message: "Error Logging in user", error });
  }
};

// export const UserLogin = async (req: Request, res: Response) => {
//   const { email, user_password } = req.body as {
//     email: string;
//     user_password: string;
//   };

//   if (!email || !user_password) {
//     return res.status(400).json({
//       message: "All fields are required",
//     });
//   }

//   try {
//     // Find user with password for authentication purposes
//     const individualUserToLogin = await IndividualUser.findOne({
//       email,
//     }).select("+password");

//     if (!individualUserToLogin) {
//       return res.status(400).json({
//         message:
//           "You do not have an account, please proceed to the signup page to create an account.",
//       });
//     }

//     // Additional checks based on user role and email verification
//     if (individualUserToLogin.role === "g-ind") {
//       return res.status(400).json({
//         message:
//           "Your account was created with Google. Kindly login using Google.",
//       });
//     }

//     if (!individualUserToLogin.email_verified) {
//       const verificationToken = jwt.sign(
//         { email },
//         process.env.JWT_SECRET as string,
//         { expiresIn: 60 * 60 } // 1 hour
//       );
//       await sendVerificationEmail(email, verificationToken);
//       return res.status(200).json({
//         status: "false",
//         message:
//           "Account is unverified! Verification email sent. Verify account to continue",
//       });
//     }

//     // Password match check
//     const passwordMatch = await individualUserToLogin.comparePassword(
//       user_password
//     );
//     if (!passwordMatch) {
//       return res.status(422).json({ error: "Incorrect Password" });
//     }

//     // Remove the password from the user object before sending it to the frontend
//     const { ...userWithoutPassword } = individualUserToLogin.toObject();

//     const {
//       status,
//       message,
//       user: userWithoutPasswordForSession,
//       accessToken,
//       refreshToken,
//     } = await createSessionAndSendTokens({
//       user: userWithoutPassword,
//       userAgent: req.get("user-agent") || "",
//       role: individualUserToLogin.role,
//       message: "Individual user successfully logged in",
//     });

//     // Explicitly remove the password field from the session user
//     delete userWithoutPasswordForSession.password;

//     return res.status(200).json({
//       status,
//       message,
//       user: userWithoutPasswordForSession,
//       refreshToken,
//       accessToken,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Error Logging in user", error });
//   }
// };

export const OrganizationUserForgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on POSTed email
    const { email } = req.body;

    try {
      // Check if the user exists in the organization model
      const org = await OrganizationModel.findOne({
        organization_email: email,
      });

      // Check if the user exists in the individual model
      const user = await IndividualUser.findOne({
        email,
      });

      // If neither organization nor individual user is found, throw an error
      if (!org && !user) {
        throw new AppError("There is no user with this email address.", 404);
      }

      // Generate the random reset token based on whether org or user is defined
      const resetToken = org
        ? org.createPasswordResetToken()
        : user!.createPasswordResetToken();

      // Save the organization or user based on which one is found
      await (org
        ? org.save({ validateBeforeSave: false })
        : user!.save({ validateBeforeSave: false }));

      // Send reset email to the user's email
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/auth/organization/resetPassword/${resetToken}`;
      // sendURLEmail([org?.organization_email, user?.email].filter(Boolean), resetURL);
      const validEmails = [org?.organization_email, user?.email].filter(
        (email) => typeof email === "string"
      ) as string[];

      sendURLEmail(validEmails, resetURL);

      res.status(200).json({ message: "success" });
    } catch (error) {
      return next(
        new AppError("There is an error processing the request.", 500)
      );
    }
  }
);

export const organizationUserResetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on the token

    // const token = req.params.token;

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const org = await OrganizationModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    const user = await IndividualUser.findOne({
      passwordResetToken: hashedToken,
      // passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is a user, set the new password
    if (!org && !user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    if (org) {
      org.password = req.body.password;
      org.passwordResetToken = undefined;
      org.passwordResetExpires = undefined;
      await org.save();
    }

    if (user) {
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }

    // 3) Update changedPasswordAt property for the user/organization
    // [Update this part according to your implementation]

    // 4) Log the user/organization in and send JWT
    if (org) {
      createSendToken(org, 200, res);
    } else if (user) {
      createSendToken(user, 200, res);
    }
  }
);

export const organizationUserUpdatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password } = req.body;
    try {
      const org = await OrganizationModel.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() },
      });
      const user = await IndividualUser.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() },
      });
      if (!org && !user) {
        return next(new AppError("Token is invalid or has expired", 400));
      }
    } catch (error) {
      console.log(error);
    }
  }
);

const checkIfUserExist = async (
  email: string
): Promise<organizationalDoc | IndividualUserDocument | null> => {
  const individualUser = await IndividualUser.findOne({
    email,
  });

  if (individualUser) return individualUser;

  const organizationUser = await OrganizationModel.findOne({
    organization_email: email,
  });

  if (organizationUser) return organizationUser;

  return null;
};

// const logout = async () => {

// }
