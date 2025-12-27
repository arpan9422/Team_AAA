import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter for Gmail
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetOTP(email: string, otp: string, userName: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GearGuard Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - GearGuard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .otp-box {
              background-color: #fff;
              border: 2px solid #4CAF50;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .warning {
              color: #d32f2f;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password for your GearGuard account.</p>
              <p>Your One-Time Password (OTP) is:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This OTP is valid for 10 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              <div class="warning">
                ⚠️ Never share this OTP with anyone. GearGuard will never ask for your OTP via phone or email.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} GearGuard - AI-Powered Maintenance Management System</p>
              <p>Team AAA</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${userName},\n\nYour password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nGearGuard Team`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetConfirmation(email: string, userName: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GearGuard Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Successful - GearGuard',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hi ${userName},</p>
              <p>Your password has been successfully reset.</p>
              <p>You can now log in to your GearGuard account with your new password.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
              <p>Thanks,<br>GearGuard Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error for confirmation email
    }
  }
}

export default new EmailService();
