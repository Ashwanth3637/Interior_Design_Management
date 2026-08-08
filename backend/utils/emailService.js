require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Create Nodemailer Transporter.
 * Uses SMTP process.env config if available, otherwise falls back to test mode.
 */
const createTransporter = async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587", 10),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback: Test Transporter (Ethereal / Console mode)
    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (err) {
        // Return a mock transport if test account creation fails offline
        return {
            sendMail: async (options) => {
                console.log("📧 [MOCK EMAIL LOG] Mail dispatched:");
                console.log(`To: ${options.to} | Subject: ${options.subject}`);
                return { messageId: `mock-${Date.now()}` };
            },
        };
    }
};

/**
 * Base Helper to dispatch email safely
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Interior Design Management" <no-reply@interiordesign.com>',
            to,
            subject,
            text: text || "Please view this email in an HTML compatible mail reader.",
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully dispatched to ${to} | ID: ${info.messageId}`);
        if (nodemailer.getTestMessageUrl && info) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) console.log(`🔗 Preview Email URL: ${previewUrl}`);
        }
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Template 1: Welcome Email After Client Registration
 */
const sendWelcomeEmail = async ({ clientEmail, clientName, password = "Client123!" }) => {
    const subject = "🎉 Welcome to Interior Design Management Portal!";
    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Interior Design Management</h1>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Client Account Confirmation</p>
            </div>
            <div style="padding: 32px; color: #334155; line-height: 1.6;">
                <h2 style="color: #0f172a; margin-top: 0;">Welcome, ${clientName}! 👋</h2>
                <p>Your client portal account has been successfully created. You can now log in to track live renovation milestones, approve 2D/3D design concepts, review quotations, and make installment payments.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <h3 style="margin-top: 0; color: #1e293b; font-size: 15px;">Your Portal Login Credentials</h3>
                    <p style="margin: 6px 0;"><strong>Login Email:</strong> ${clientEmail}</p>
                    <p style="margin: 6px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a;">${password}</code></p>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="http://localhost:5173/login" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Log In to Client Portal</a>
                </div>

                <p style="font-size: 13px; color: #64748b;">If you have any questions or need assistance, please feel free to reach out to your assigned Project Manager.</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                © 2026 Interior Design Management System. All rights reserved.
            </div>
        </div>
    `;
    return sendEmail({ to: clientEmail, subject, html });
};

/**
 * Template 2: Quotation Email
 */
const sendQuotationEmail = async ({ clientEmail, clientName, projectName, quotationNumber, totalAmount }) => {
    const subject = `📄 New Quotation Issued: ${quotationNumber} (${projectName})`;
    const formattedAmount = (Number(totalAmount) || 0).toLocaleString("en-IN");
    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Official Quotation Issued</h1>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Quotation #${quotationNumber}</p>
            </div>
            <div style="padding: 32px; color: #334155; line-height: 1.6;">
                <p>Hello <strong>${clientName}</strong>,</p>
                <p>An official project quotation has been generated for your interior design project <strong>"${projectName}"</strong>.</p>
                
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                    <span style="font-size: 13px; color: #1e40af; font-weight: 600; text-transform: uppercase;">Total Budget Estimate</span>
                    <h2 style="margin: 8px 0 0 0; color: #1e3a8a; font-size: 28px; font-weight: 800;">₹${formattedAmount}</h2>
                </div>

                <p>Please log in to your Client Portal to review the detailed cost breakdown (Material, Labour, Electrical, & Design charges) and accept or request revisions.</p>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="http://localhost:5173/client-portal" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Review & Accept Quotation</a>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                © 2026 Interior Design Management System.
            </div>
        </div>
    `;
    return sendEmail({ to: clientEmail, subject, html });
};

/**
 * Template 3: Invoice Email
 */
const sendInvoiceEmail = async ({ clientEmail, clientName, projectName, invoiceNumber, amount, dueDate, installmentType }) => {
    const subject = `💳 Payment Invoice Issued: ${invoiceNumber} (${installmentType || "Client Invoice"})`;
    const formattedAmount = (Number(amount) || 0).toLocaleString("en-IN");
    const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString("en-IN") : "Upon Receipt";
    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Client Payment Invoice</h1>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Invoice #${invoiceNumber}</p>
            </div>
            <div style="padding: 32px; color: #334155; line-height: 1.6;">
                <p>Hello <strong>${clientName}</strong>,</p>
                <p>A new payment installment invoice has been issued for <strong>"${projectName}"</strong>.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">Installment Stage:</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${installmentType || "Advance Payment"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">Invoice Amount:</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 16px; font-weight: 700; color: #2563eb; text-align: right;">₹${formattedAmount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 16px; font-size: 14px; color: #64748b;">Due Date:</td>
                        <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #dc2626; text-align: right;">${formattedDueDate}</td>
                    </tr>
                </table>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="http://localhost:5173/client-portal" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Pay Invoice via Portal</a>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                © 2026 Interior Design Management System.
            </div>
        </div>
    `;
    return sendEmail({ to: clientEmail, subject, html });
};

/**
 * Template 4: Payment Receipt Email
 */
const sendPaymentReceiptEmail = async ({ clientEmail, clientName, projectName, invoiceNumber, paidAmount }) => {
    const subject = `🧾 Payment Receipt Confirmed: ${invoiceNumber}`;
    const formattedAmount = (Number(paidAmount) || 0).toLocaleString("en-IN");
    const dateStr = new Date().toLocaleDateString("en-IN", { dateStyle: "medium" });
    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Payment Received ✔</h1>
                <p style="margin: 4px 0 0 0; color: #a7f3d0; font-size: 14px;">Official Payment Confirmation</p>
            </div>
            <div style="padding: 32px; color: #334155; line-height: 1.6;">
                <p>Hello <strong>${clientName}</strong>,</p>
                <p>Thank you! We have received your payment for project <strong>"${projectName}"</strong>.</p>
                
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #166534; font-size: 14px;">Invoice Number:</td>
                            <td style="padding: 6px 0; font-weight: 700; color: #14532d; text-align: right;">${invoiceNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #166534; font-size: 14px;">Amount Paid:</td>
                            <td style="padding: 6px 0; font-weight: 800; font-size: 18px; color: #15803d; text-align: right;">₹${formattedAmount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #166534; font-size: 14px;">Transaction Date:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #14532d; text-align: right;">${dateStr}</td>
                        </tr>
                    </table>
                </div>

                <p>Your payment has been logged in our finance records, and your project workflow status has been updated accordingly.</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                © 2026 Interior Design Management System.
            </div>
        </div>
    `;
    return sendEmail({ to: clientEmail, subject, html });
};

/**
 * Template 5: Project Completion Email
 */
const sendProjectCompletionEmail = async ({ clientEmail, clientName, projectName }) => {
    const subject = `🎉 Congratulations! Your Project ${projectName} is 100% Completed!`;
    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 28px; text-align: center; color: #ffffff;">
                <span style="font-size: 40px;">🎉</span>
                <h1 style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800;">Project Handover Ready!</h1>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">100% Renovation Execution Complete</p>
            </div>
            <div style="padding: 32px; color: #334155; line-height: 1.6;">
                <p>Dear <strong>${clientName}</strong>,</p>
                <p>We are thrilled to announce that your interior design project <strong>"${projectName}"</strong> has been successfully completed by our engineering and design team!</p>
                
                <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                    <h3 style="margin: 0; color: #6b21a8; font-size: 18px;">Thank you for trusting us with your space!</h3>
                    <p style="margin: 8px 0 0 0; color: #7e22ce; font-size: 14px;">All site installations, quality inspections, and handover milestones are completed.</p>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="http://localhost:5173/client-portal" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">View Project Summary & Handover Docs</a>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                © 2026 Interior Design Management System.
            </div>
        </div>
    `;
    return sendEmail({ to: clientEmail, subject, html });
};

/**
 * Template 6: Account Login Notification Email
 */
const sendLoginNotificationEmail = async ({ clientEmail, clientName, loginTime = new Date() }) => {
    const subject = `🔐 Security Alert: Login Detected on Your Portal Account`;
    const formattedTime = new Date(loginTime).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" });
    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Account Security Alert</h1>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Login Detection</p>
            </div>
            <div style="padding: 28px; color: #334155; line-height: 1.6;">
                <p>Hello <strong>${clientName}</strong>,</p>
                <p>We detected a successful login to your Client Portal account.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Account:</strong> ${clientEmail}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Login Timestamp:</strong> ${formattedTime}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Authorized Session</span></p>
                </div>

                <p style="font-size: 13px; color: #64748b;">If this was you, no action is needed. If you did not initiate this login, please contact support immediately.</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                © 2026 Interior Design Management System.
            </div>
        </div>
    `;
    return sendEmail({ to: clientEmail, subject, html });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendQuotationEmail,
    sendInvoiceEmail,
    sendPaymentReceiptEmail,
    sendProjectCompletionEmail,
    sendLoginNotificationEmail,
};
