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
exports.sendTransactionCancellationMailToBuyer = exports.sendSuccessfulEscrowEmailToVendor = exports.sendSuccessfulEscrowEmailToInitiator = exports.sendShippingDetailsEmailToVendor = exports.sendShippingDetailsEmailToInitiator = exports.sendEscrowInitiationEmailToVendor = exports.sendEscrowInitiationEmailToInitiator = void 0;
const email_utils_1 = require("../../../utilities/email.utils");
const DEPLOYED_FRONTEND_BASE_URL = process.env.DEPLOYED_FRONTEND_BASE_URL;
const sendEscrowInitiationEmailToInitiator = (buyer_email, transaction_id, transaction_total, vendor_name, products, sum_total, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const loginUrl = "https://mydoshbox.vercel.app/login";
        const dashboardUrl = "https://mydoshbox.vercel.app/dashboard";
        // Generate product rows for the table
        const productRows = products
            .map((p, index) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 12px; text-align: center; color: #6b7280; font-size: 14px;">${index + 1}</td>
        <td style="padding: 16px 12px; color: #111827; font-size: 14px; font-weight: 500;">${p.name}</td>
        <td style="padding: 16px 12px; text-align: center; color: #374151; font-size: 14px;">${p.quantity}</td>
        <td style="padding: 16px 12px; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">₦${Number(p.price).toLocaleString()}</td>
        <td style="padding: 16px 12px; text-align: right; color: #059669; font-size: 14px; font-weight: 600;">₦${(p.price * p.quantity).toLocaleString()}</td>
      </tr>
      ${p.description
            ? `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td></td>
        <td colspan="4" style="padding: 0 12px 16px 12px; color: #6b7280; font-size: 13px; font-style: italic;">
          ${p.description}
        </td>
      </tr>
      `
            : ""}
    `)
            .join("");
        // Conditional content based on status
        const isAccepted = status === "accepted";
        const headerGradient = isAccepted
            ? "background: linear-gradient(135deg, #10b981 0%, #059669 100%);"
            : "background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);";
        const headerEmoji = isAccepted ? "✅" : "❌";
        const headerTitle = isAccepted
            ? "Transaction Accepted!"
            : "Transaction Declined";
        const headerSubtext = isAccepted
            ? "The vendor has confirmed your order"
            : "The vendor has declined your order";
        const headerSubtextColor = isAccepted ? "#d1fae5" : "#fecaca";
        const statusMessage = isAccepted
            ? `Great news! <strong>${vendor_name}</strong> has accepted your transaction. Please proceed to make payment to secure your order.`
            : `Unfortunately, <strong>${vendor_name}</strong> has declined your transaction request. This could be due to product availability or other reasons. You may contact the vendor directly or initiate a new transaction.`;
        const actionBoxGradient = isAccepted
            ? "background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);"
            : "background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);";
        const actionBoxBorder = isAccepted ? "#3b82f6" : "#ef4444";
        const actionBoxTitleColor = isAccepted ? "#1e40af" : "#991b1b";
        const actionBoxTextColor = isAccepted ? "#1e3a8a" : "#7f1d1d";
        const actionBoxTitle = isAccepted ? "⚡ Next Steps" : "ℹ️ What's Next";
        const actionBoxText = isAccepted
            ? "Please log in to your MyDoshBox account and proceed with payment. Once payment is confirmed, the vendor will prepare your order for shipment."
            : "You can review the transaction details below. Feel free to reach out to the vendor for more information or initiate a new transaction with different terms.";
        const ctaButtonUrl = isAccepted ? dashboardUrl : loginUrl;
        const ctaButtonColor = isAccepted ? "#10b981" : "#6b7280";
        const ctaButtonText = isAccepted
            ? "Proceed to Payment"
            : "View Transaction Details";
        const ctaButtonShadow = isAccepted
            ? "box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);"
            : "box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction ${isAccepted ? "Accepted" : "Declined"} - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Brand Color -->
            <tr>
              <td style="${headerGradient} padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ${headerEmoji} ${headerTitle}
                </h1>
                <p style="margin: 8px 0 0 0; color: ${headerSubtextColor}; font-size: 14px;">
                  ${headerSubtext}
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  ${statusMessage}
                </p>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 13px;">
                            Vendor Name
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                            ${vendor_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 2px solid #d1d5db;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #6b7280; font-size: 13px;">
                            Transaction Total (amount to pay)
                          </td>
                          <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 700; text-align: right;">
                            ₦${Number(transaction_total).toLocaleString()}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Products Table -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📦 Order Details
                </h2>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 24px;">
                  <!-- Table Header -->
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 14px 12px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">#</th>
                    <th style="padding: 14px 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 14px 12px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 14px 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 14px 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                  
                  <!-- Product Rows -->
                  ${productRows}
                </table>

                <!-- Action Required Section -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${actionBoxGradient} border-radius: 8px; border-left: 4px solid ${actionBoxBorder}; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: ${actionBoxTitleColor}; font-size: 14px; font-weight: 700;">
                        ${actionBoxTitle}
                      </p>
                      <p style="margin: 0; color: ${actionBoxTextColor}; font-size: 14px; line-height: 1.6;">
                        ${actionBoxText}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${ctaButtonUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${ctaButtonColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; ${ctaButtonShadow}">
                        ${ctaButtonText}
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
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
        const subjectLine = isAccepted
            ? "✅ Transaction Accepted - Please Proceed with Payment"
            : "❌ Transaction Declined by Vendor";
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: subjectLine,
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendEscrowInitiationEmailToInitiator = sendEscrowInitiationEmailToInitiator;
const sendEscrowInitiationEmailToVendor = (transaction_id, vendor_name, vendor_email, products, sum_total, transaction_total) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const signupUrl = "https://mydoshbox.vercel.app/signup";
        const loginUrl = "https://mydoshbox.vercel.app/login";
        // Generate product rows for the table
        const productRows = products
            .map((p, index) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 12px; text-align: center; color: #6b7280; font-size: 14px;">${index + 1}</td>
        <td style="padding: 16px 12px; color: #111827; font-size: 14px; font-weight: 500;">${p.name}</td>
        <td style="padding: 16px 12px; text-align: center; color: #374151; font-size: 14px;">${p.quantity}</td>
        <td style="padding: 16px 12px; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">₦${Number(p.price).toLocaleString()}</td>
        <td style="padding: 16px 12px; text-align: right; color: #059669; font-size: 14px; font-weight: 600;">₦${(p.price * p.quantity).toLocaleString()}</td>
      </tr>
      ${p.description
            ? `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td></td>
        <td colspan="4" style="padding: 0 12px 16px 12px; color: #6b7280; font-size: 13px; font-style: italic;">
          ${p.description}
        </td>
      </tr>
      `
            : ""}
    `)
            .join("");
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Escrow Transaction Initiated</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Brand Color -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🎉 New Transaction Request
                </h1>
                <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">
                  A buyer wants to purchase from you
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello <strong>${vendor_name}</strong>,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Great news! A buyer has initiated an escrow transaction for your products. Please review the details below and confirm the order in your dashboard.
                </p>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 13px;">
                            Product Sum Total
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #059669; font-size: 18px; font-weight: 700; text-align: right;">
                            ₦${Number(sum_total).toLocaleString()}
                          </td>
                        </tr>
                        <tr>                      
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 2px solid #d1d5db;"></td>
                        </tr>
                        <tr>
                         
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Products Table -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📦 Order Details
                </h2>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 24px;">
                  <!-- Table Header -->
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 14px 12px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">#</th>
                    <th style="padding: 14px 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 14px 12px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 14px 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 14px 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                  
                  <!-- Product Rows -->
                  ${productRows}
                </table>

                <!-- Action Required Section -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 700;">
                        ⚠️ Action Required
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        Please log in to your MyDoshBox account to review and confirm this transaction. Once confirmed, the buyer will proceed with payment, and you'll need to provide shipping details.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Buttons -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0 0 12px 0;">
                      <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction in Dashboard
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                        Don't have an account yet?
                      </p>
                      <a href="${signupUrl}" style="color: #059669; text-decoration: none; font-weight: 600; font-size: 14px;">
                        Create Account →
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
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
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "🎉 New Escrow Transaction - Action Required",
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendEscrowInitiationEmailToVendor = sendEscrowInitiationEmailToVendor;
// SHIPPING DETAILS MAIL TO INITIATOR (BUYER)
const sendShippingDetailsEmailToInitiator = (buyer_email, shipping_company, delivery_person_name, delivery_person_number, delivery_date, pick_up_address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const dashboardUrl = "https://mydoshbox.vercel.app/dashboard";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Details - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Brand Color -->
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🚚 Shipping Details Received
                </h1>
                <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
                  Your order is being prepared for delivery
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Great news! The vendor has confirmed your transaction and provided shipping details for your order. Your product is on its way!
                </p>

                <!-- Shipping Info Box -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📦 Shipping Information
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Shipping Company
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                            ${shipping_company || "Not specified"}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Delivery Person
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                            ${delivery_person_name || "Not specified"}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Contact Number
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${delivery_person_number || "Not specified"}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Expected Delivery
                          </td>
                          <td style="padding: 12px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">
                            ${delivery_date || "To be confirmed"}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 2px solid #d1d5db;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Pickup Address
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; color: #111827; font-size: 14px; line-height: 1.6;">
                            ${pick_up_address || "Not specified"}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Action Required Section -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        ⚠️ Important Reminder
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        Please confirm receipt of your order once it arrives. This will complete the transaction and release payment to the vendor.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        Track in Dashboard
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
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
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "🚚 Shipping Details Received - Your Order Is On The Way",
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendShippingDetailsEmailToInitiator = sendShippingDetailsEmailToInitiator;
// SHIPPING DETAILS MAIL TO VENDOR
const sendShippingDetailsEmailToVendor = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (transaction_id = "", vendor_name = "", vendor_email = "", product_name = "") {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const dashboardUrl = "https://mydoshbox.vercel.app/dashboard";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Details Confirmed - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Brand Color -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ✅ Shipping Details Confirmed
                </h1>
                <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">
                  Your shipping information has been sent to the buyer
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello <strong>${vendor_name}</strong>,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  You have successfully confirmed the escrow transaction and provided shipping details. The buyer has been notified and is awaiting delivery.
                </p>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 13px;">
                            Product Name
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                            ${product_name}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Next Steps Section -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 What Happens Next
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Step 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            The buyer receives your shipping details
                          </td>
                        </tr>
                      </table>

                      <!-- Step 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            Buyer confirms receipt of the product
                          </td>
                        </tr>
                      </table>

                      <!-- Step 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong style="color: #059669;">Payment is released to you within 24 hours</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 700;">
                        💡 Payment Release
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        Your funds are securely held in escrow. Once the buyer confirms receipt, payment will be released to your account within 24 hours.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction Status
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
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
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "✅ Shipping Details Confirmed Successfully",
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendShippingDetailsEmailToVendor = sendShippingDetailsEmailToVendor;
// SUCCESSFUL ESCROW COMPLETION EMAIL TO BUYER (INITIATOR)
const sendSuccessfulEscrowEmailToInitiator = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (transaction_id = "", vendor_name = "", buyer_email = "", product_name = "") {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const dashboardUrl = "https://mydoshbox.vercel.app/dashboard";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Completed Successfully - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Success Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 24px; text-align: center;">
                <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                  🎉
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                  Transaction Completed!
                </h1>
                <p style="margin: 12px 0 0 0; color: #d1fae5; font-size: 15px;">
                  Your escrow transaction has been successfully completed
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Great news! Your escrow transaction with <strong>${vendor_name}</strong> for <strong>${product_name}</strong> has been successfully completed. We hope you're satisfied with your purchase!
                </p>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border: 1px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #065f46; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid rgba(16, 185, 129, 0.3);"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #065f46; font-size: 13px;">
                            Product Name
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">
                            ${product_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 1px solid rgba(16, 185, 129, 0.3);"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #065f46; font-size: 13px;">
                            Vendor Name
                          </td>
                          <td style="padding: 12px 0 0 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">
                            ${vendor_name}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Success Message Box -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  ✅ What This Means
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Point 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 16px;">✓</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            Your transaction has been marked as complete
                          </td>
                        </tr>
                      </table>

                      <!-- Point 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 16px;">✓</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            Payment has been released to the vendor
                          </td>
                        </tr>
                      </table>

                      <!-- Point 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 16px;">✓</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            Your transaction receipt is available in your dashboard
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Feedback Section -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        💬 Share Your Experience
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        We'd love to hear about your experience! Your feedback helps us improve our service and build trust within the MyDoshBox community.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction History
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Thank You Message -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">
                        Thank You for Choosing MyDoshBox! 🙏
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        We're committed to making your transactions safe and secure
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
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
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "🎉 Transaction Completed Successfully - MyDoshBox",
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendSuccessfulEscrowEmailToInitiator = sendSuccessfulEscrowEmailToInitiator;
// SUCCESSFUL ESCROW COMPLETION EMAIL TO VENDOR
const sendSuccessfulEscrowEmailToVendor = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (transaction_id = "", vendor_name = "", vendor_email = "", product_name = "") {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const dashboardUrl = "https://mydoshbox.vercel.app/dashboard";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Completed! - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Success Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 24px; text-align: center;">
                <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                  💰
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                  Payment Released!
                </h1>
                <p style="margin: 12px 0 0 0; color: #d1fae5; font-size: 15px;">
                  Your funds are being processed
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello <strong>${vendor_name}</strong>,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Excellent news! The buyer has confirmed receipt of <strong>${product_name}</strong>, and your escrow transaction has been successfully completed. Your payment is now being released!
                </p>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border: 1px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #065f46; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid rgba(16, 185, 129, 0.3);"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #065f46; font-size: 13px;">
                            Product Name
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: right;">
                            ${product_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 1px solid rgba(16, 185, 129, 0.3);"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #065f46; font-size: 13px;">
                            Status
                          </td>
                          <td style="padding: 12px 0 0 0; color: #065f46; font-size: 14px; font-weight: 700; text-align: right;">
                            ✅ COMPLETED
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Payment Timeline -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  💳 Payment Timeline
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Step 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 16px;">✓</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Buyer confirmed delivery</strong> - Transaction marked as complete
                          </td>
                        </tr>
                      </table>

                      <!-- Step 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 16px;">✓</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Escrow released</strong> - Funds are being processed
                          </td>
                        </tr>
                      </table>

                      <!-- Step 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #92400e; font-weight: 700; font-size: 14px;">⏳</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong style="color: #f59e0b;">Payment arriving within 24 hours</strong> - Check your account
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Important Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 700;">
                        💡 Payment Information
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        Your payment will be credited to your registered account within the next 24 hours. You'll receive a notification once the transfer is complete.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction Details
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Thank You Message -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">
                        Thank You for Using MyDoshBox! 🎉
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        We appreciate your trust in our secure escrow service
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
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
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "💰Transaction Completed Successfully",
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendSuccessfulEscrowEmailToVendor = sendSuccessfulEscrowEmailToVendor;
// TRANSACTION CANCELLATION EMAIL TO BUYER
const sendTransactionCancellationMailToBuyer = (buyer_email, vendor_name, product_name, transaction_id, cancellation_reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const supportEmail = "mydoshbox@gmail.com";
        const dashboardUrl = "https://mydoshbox.vercel.app/dashboard";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Cancelled - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Warning Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ⚠️ Transaction Cancelled
                </h1>
                <p style="margin: 8px 0 0 0; color: #fecaca; font-size: 14px;">
                  This transaction has been cancelled
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  We're writing to inform you that your escrow transaction with <strong>${vendor_name}</strong> for <strong>${product_name}</strong> has been cancelled.
                </p>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 13px;">
                            Product Name
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                            ${product_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #6b7280; font-size: 13px;">
                            Vendor Name
                          </td>
                          <td style="padding: 12px 0 0 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                            ${vendor_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 2px solid #d1d5db;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #6b7280; font-size: 13px;">
                            Status
                          </td>
                          <td style="padding: 12px 0 0 0; color: #dc2626; font-size: 14px; font-weight: 700; text-align: right;">
                            ❌ CANCELLED
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                ${cancellation_reason
            ? `
                <!-- Cancellation Reason -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Cancellation Details
                </h2>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 700;">
                        Reason for Cancellation:
                      </p>
                      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                        ${cancellation_reason}
                      </p>
                    </td>
                  </tr>
                </table>
                `
            : ""}

                <!-- What This Means -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  ℹ️ What This Means
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Point 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #991b1b; font-weight: 700; font-size: 16px;">•</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            The transaction has been terminated and marked as cancelled
                          </td>
                        </tr>
                      </table>

                      <!-- Point 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #991b1b; font-weight: 700; font-size: 16px;">•</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            If payment was made, a refund will be processed within 5-7 business days
                          </td>
                        </tr>
                      </table>

                      <!-- Point 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #991b1b; font-weight: 700; font-size: 16px;">•</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            You can initiate a new transaction if you'd like to try again
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Support Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        💬 Need Assistance?
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        If you have questions about this cancellation or need help with a new transaction, our support team is here to assist you 24/7.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Buttons -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0 0 12px 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #6b7280; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);">
                        View Transaction History
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="mailto:${supportEmail}" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #3b82f6; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; border: 2px solid #3b82f6;">
                        Contact Support
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Questions or concerns? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
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
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "⚠️ Transaction Cancelled - MyDoshBox",
            html: emailMessage,
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (error) {
        console.error("Error sending cancellation email:", error);
    }
});
exports.sendTransactionCancellationMailToBuyer = sendTransactionCancellationMailToBuyer;
