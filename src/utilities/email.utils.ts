import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const generateMailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transport;
};

export const sendOTPEmail = async (otp: string, email: string) => {
  const transport = generateMailTransporter();

  // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
  const emailMessage = `Hi, we just received a request that you forgot your password. Here is your OTP to create a new password: ${otp}`;

  transport.sendMail({
    to: email,
    from: process.env.VERIFICATION_EMAIL,
    subject: "Reset Password Token",
    html: emailMessage, // Assign the HTML string directly to the html property
  });
};
export const sendPasswordResetEmail = async (
  resetUrl: string,
  email: string
) => {
  const transport = generateMailTransporter();

  const emailMessage = `Hi, we just received a request that you forgot your password. Here is your OTP to create a new password: ${resetUrl}`;

  transport.sendMail({
    to: email,
    from: process.env.VERIFICATION_EMAIL,
    subject: "Reset Password link",
    html: emailMessage, // Assign the HTML string directly to the html property
  });
};

export const sendURLEmail = async (email: string[], resetURL: string) => {
  // const validEmails = email.filter(Boolean) as string[];

  const transport = generateMailTransporter();

  // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
  const emailMessage = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  transport.sendMail({
    to: email,
    from: process.env.VERIFICATION_EMAIL,
    subject: "Reset Password Token",
    html: emailMessage, // Assign the HTML string directly to the html property
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const transport = generateMailTransporter();

    const verificationURL = `${process.env.DEPLOYED_FRONTEND_BASE_URL}/auth/verify-email?token=${token}`;
    console.log(verificationURL);

    const supportEmail = "mydoshbox@gmail.com";
    const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <h1 style="margin: 0;">Please Verify Your Email Address</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${email},</p>
          <p>Thank you for registering with Doshbox! We're thrilled to have you on board.</p>
          <p>To ensure the security and integrity of our platform, we require all users to verify their email addresses. This helps us confirm your identity and maintain a safe environment for all community members.</p>
          <p>Please click on the link below to verify your email address:</p>
          <p><a href="${verificationURL}" style="text-decoration: none; color: #007bff;">Verify Email Address</a></p>
          <p>If the link above doesn't work, you can copy and paste the following URL into your browser:</p>
          <p>${verificationURL}</p>
          <p>Once you've verified your email address, you'll have full access to all the features and benefits of Doshbox.</p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
          <p>Thank you for choosing Doshbox. We look forward to having you as an active member of our community!</p>
          <p>Best regards,<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
    // console.log("here");
    const info = await transport.sendMail({
      to: email,
      from: process.env.VERIFICATION_EMAIL,
      subject: "Verify Your Email Address",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (err) {
    console.log(err);
  }
};
