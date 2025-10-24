"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendVerificationEmail = exports.sendURLEmail = exports.sendPasswordResetEmail = exports.sendOTPEmail = exports.generateMailTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateMailTransporter = () => {
    const transport = nodemailer_1.default.createTransport({
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
exports.generateMailTransporter = generateMailTransporter;
const sendOTPEmail = (otp, email) => __awaiter(void 0, void 0, void 0, function* () {
    const transport = (0, exports.generateMailTransporter)();
    // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
    const emailMessage = `Hi, we just received a request that you forgot your password. Here is your OTP to create a new password: ${otp}`;
    transport.sendMail({
        to: email,
        from: process.env.VERIFICATION_EMAIL,
        subject: "Reset Password Token",
        html: emailMessage, // Assign the HTML string directly to the html property
    });
});
exports.sendOTPEmail = sendOTPEmail;
const sendPasswordResetEmail = (resetUrl, email) => __awaiter(void 0, void 0, void 0, function* () {
    const transport = (0, exports.generateMailTransporter)();
    const emailMessage = `Hi, we just received a request that you forgot your password. Here is your OTP to create a new password: ${resetUrl}`;
    transport.sendMail({
        to: email,
        from: process.env.VERIFICATION_EMAIL,
        subject: "Reset Password link",
        html: emailMessage, // Assign the HTML string directly to the html property
    });
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendURLEmail = (email, resetURL) => __awaiter(void 0, void 0, void 0, function* () {
    // const validEmails = email.filter(Boolean) as string[];
    const transport = (0, exports.generateMailTransporter)();
    // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
    const emailMessage = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    transport.sendMail({
        to: email,
        from: process.env.VERIFICATION_EMAIL,
        subject: "Reset Password Token",
        html: emailMessage, // Assign the HTML string directly to the html property
    });
});
exports.sendURLEmail = sendURLEmail;
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, exports.generateMailTransporter)();
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
        const info = yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Verify Your Email Address",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendWelcomeEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, exports.generateMailTransporter)();
        const firstName = name || email.split("@")[0];
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Doshbox!</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
        <tr>
          <td align="center" style="padding: 20px;">
            <h1 style="color: #007bff; margin-bottom: 20px;">Welcome to Doshbox!</h1>
            <p style="font-size: 16px;">Hi <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px;">Your email has been successfully verified, and your Doshbox account is now active.</p>
            <p style="font-size: 15px;">We’re excited to have you onboard! 🎉</p>
            <p style="font-size: 15px;">Explore your dashboard, manage transactions, and enjoy a seamless experience.</p>
            <p style="font-size: 15px;">If you have any questions or need help, feel free to reach out to 
              <a href="mailto:${supportEmail}" style="color: #007bff;">${supportEmail}</a>.
            </p>
            <p style="margin-top: 30px; font-size: 14px; color: #555;">Best regards,<br><strong>The Doshbox Team</strong></p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
        yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Welcome to Doshbox!",
            html: emailMessage,
        });
        console.log(`✅ Welcome email sent to ${email}`);
    }
    catch (err) {
        console.error("❌ Error sending welcome email:", err);
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
