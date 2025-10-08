const nodemailer = require('nodemailer');
const { logger } = require('@utils');

class EmailService {
  constructor() {
    // Email transporter configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send OTP verification email
   * @param {string} email - Recipient email
   * @param {string} name - User name
   * @param {string} otp - 6-digit OTP
   */
  async sendOTPEmail(email, name, otp) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Video Course Platform'}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'E-pochtani tekshirish - OTP kaliti',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 36px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; }
              .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <p>Assalomu alaykum, <strong>${name}</strong>!</p>
                <p>Ro'yxatdan o'tganingiz uchun tashakkur! Pochta manzilingizni tasdiqlash uchun quyidagi OTP kaliti kiriting:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; color: #6b7280;">Bu kod 20 daqiqa davomida amal qiladi</p>
                </div>

                <p>Agar siz bu so'rovni yuborgan bo'lmasangiz, bu xabarni e'tiborsiz qoldiring.</p>

                <div class="warning">
                  ⚠️ Bu kodni hech kimga bermang!
                </div>

                <div class="footer">
                  <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Hasanov Academy'}</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`OTP email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send OTP email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService();