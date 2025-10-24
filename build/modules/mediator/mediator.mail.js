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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResolutionMailToSeller = exports.sendResolutionMailToBuyer = exports.sendMediatorInvolvementMailToMediator = exports.sendMediatorLoginDetailsMail = void 0;
const email_utils_1 = require("../../utilities/email.utils");
const sendMediatorLoginDetailsMail = (first_name, mediator_email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const loginUrl = "https://mydoshbox.vercel.app/login";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome as Mediator - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Brand Color -->
            <tr>
              <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🎉 Welcome to MyDoshBox
                </h1>
                <p style="margin: 8px 0 0 0; color: #ede9fe; font-size: 14px;">
                  You've been added as a mediator
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Dear <strong>${first_name}</strong>,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  You have been successfully added as a mediator on the MyDoshBox platform. As a mediator, you'll help resolve disputes and ensure fair transactions between buyers and vendors.
                </p>

                <!-- Role Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 700;">
                        👤 Your Role as Mediator
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        You will have access to dispute resolution tools and the ability to review and mediate escrow transactions to ensure both parties are treated fairly.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Login Credentials Box -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  🔐 Your Login Details
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Email Address
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 0 16px 0; color: #111827; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace; word-break: break-all;">
                            ${mediator_email}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0 0 16px 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Temporary Password
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0 0 0; color: #111827; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace; background-color: #fff; padding: 12px; border-radius: 6px; border: 1px dashed #d1d5db; margin-top: 8px;">
                            ${password}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Security Notice -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 700;">
                        🔒 Important Security Notice
                      </p>
                      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                        Please change your password immediately after your first login. Keep your credentials secure and do not share them with anyone.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Next Steps -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Getting Started
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Step 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #ede9fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #6d28d9; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            Log in using the credentials above
                          </td>
                        </tr>
                      </table>

                      <!-- Step 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #ede9fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #6d28d9; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            Change your password immediately
                          </td>
                        </tr>
                      </table>

                      <!-- Step 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #ede9fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #6d28d9; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            Familiarize yourself with the mediator dashboard
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
                        Login to Your Account
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  If you have any questions or need assistance, feel free to reach out to our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Thank you for joining us as a mediator,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: mediator_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "🎉 Welcome Onboard as Mediator - MyDoshBox",
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (error) {
        console.error("Error sending mail", error);
    }
});
exports.sendMediatorLoginDetailsMail = sendMediatorLoginDetailsMail;
const sendMediatorInvolvementMailToMediator = (mediator_email, mediator_first_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mediator Involvement Alert</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${mediator_first_name},</p>
          <p>A new dispute has been assigned to you. Please review the details.</p>
    

          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
          <p>Thank you for coming onboard as a mediator</p>
          <p>Best regards,<br>
          <p>Doshbox<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        // console.log("here");
        const info = yield transport.sendMail({
            to: mediator_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "New Dispute",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (error) {
        console.error("Error sending mail", error);
    }
});
exports.sendMediatorInvolvementMailToMediator = sendMediatorInvolvementMailToMediator;
const sendResolutionMailToBuyer = (buyer_email, product_name, resolution_description_result, dispute_fault_result) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        let actionMessage = "";
        if (dispute_fault_result === "buyer") {
            actionMessage =
                "As the party at fault, you are required to keep the goods, and the payment will be released to the seller";
        }
        else if (dispute_fault_result === "seller") {
            actionMessage =
                "As the seller is at fault, please return the goods to receive a full refund.";
        }
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mediator Dispute Decision for ${product_name}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
              <p>Dear ${buyer_email},</p>
              <p>The dispute for the product <strong>${product_name}</strong> has been resolved by a mediator.</p>
              <p><strong>Mediator's Decision:</strong> Fault has been assigned to the ${dispute_fault_result}.</p>
              <p><strong>Resolution Details:</strong> ${resolution_description_result}</p>
              <p><strong>Action Required:</strong> ${actionMessage}</p>
    

          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
          <p>Thank you for coming onboard as a mediator</p>
          <p>Best regards,<br>
          <p>Doshbox<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        // console.log("here");
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "New Dispute",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (error) {
        console.error("Error sending mail", error);
    }
});
exports.sendResolutionMailToBuyer = sendResolutionMailToBuyer;
const sendResolutionMailToSeller = (vendor_email, product_name, resolution_description_result, dispute_fault_result) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        let actionMessage = "";
        if (dispute_fault_result === "buyer") {
            actionMessage =
                "As the buyer is at fault, the payment will be released to you.";
        }
        else if (dispute_fault_result === "seller") {
            actionMessage =
                "As you are at fault, the goods will be returned to you, and the payment will be refunded to the buyer.";
        }
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mediator Dispute Decision for ${product_name}</title>
  </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <p>Dear ${vendor_email},</p>
              <p>The dispute for the product <strong>${product_name}</strong> has been resolved by a mediator.</p>
              <p><strong>Mediator's Decision:</strong> Fault has been assigned to the ${dispute_fault_result}.</p>
              <p><strong>Resolution Details:</strong> ${resolution_description_result}</p>
              <p><strong>Action Required:</strong> ${actionMessage}</p>
              <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
              <p>Best regards,<br>Doshbox Team</p>
            </td>
          </tr>
        </table>
      </body>
  </html>
  `;
        // console.log("here");
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "New Dispute",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (error) {
        console.error("Error sending mail", error);
    }
});
exports.sendResolutionMailToSeller = sendResolutionMailToSeller;
