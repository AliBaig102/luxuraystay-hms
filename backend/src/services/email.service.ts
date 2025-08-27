import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    email: string,
    token: string,
    firstName: string
  ): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const template: EmailTemplate = {
      subject: 'Verify Your Email - LuxuryStay HMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">LuxuryStay HMS</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with LuxuryStay HMS. To complete your registration and verify your email address, 
              please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin-bottom: 25px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              This verification link will expire in 24 hours. If you didn't create an account with us, 
              please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        LuxuryStay HMS - Email Verification
        
        Hello ${firstName}!
        
        Thank you for registering with LuxuryStay HMS. To complete your registration and verify your email address, 
        please visit the following link:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours. If you didn't create an account with us, 
        please ignore this email.
        
        © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
      `,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    token: string,
    firstName: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const template: EmailTemplate = {
      subject: 'Reset Your Password - LuxuryStay HMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">LuxuryStay HMS</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Password Reset</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password for your LuxuryStay HMS account. 
              To proceed with the password reset, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #ff6b6b; font-size: 14px; word-break: break-all; margin-bottom: 25px;">
              ${resetUrl}
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              This password reset link will expire in 1 hour. If you didn't request a password reset, 
              please ignore this email and your password will remain unchanged.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Security Tip:</strong> Never share this link with anyone. LuxuryStay HMS will never ask you for your password.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        LuxuryStay HMS - Password Reset
        
        Hello ${firstName}!
        
        We received a request to reset your password for your LuxuryStay HMS account. 
        To proceed with the password reset, please visit the following link:
        
        ${resetUrl}
        
        This password reset link will expire in 1 hour. If you didn't request a password reset, 
        please ignore this email and your password will remain unchanged.
        
        Security Tip: Never share this link with anyone. LuxuryStay HMS will never ask you for your password.
        
        © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
      `,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Welcome to LuxuryStay HMS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">LuxuryStay HMS</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome Aboard!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome ${firstName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              Thank you for joining LuxuryStay HMS! We're excited to have you as part of our community. 
              Your account has been successfully created and verified.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>✅ Account Status:</strong> Your account is now active and ready to use.
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You can now access all the features of LuxuryStay HMS. If you have any questions or need assistance, 
              our support team is here to help.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        LuxuryStay HMS - Welcome!
        
        Welcome ${firstName}!
        
        Thank you for joining LuxuryStay HMS! We're excited to have you as part of our community. 
        Your account has been successfully created and verified.
        
        Account Status: Your account is now active and ready to use.
        
        You can now access all the features of LuxuryStay HMS. If you have any questions or need assistance, 
        our support team is here to help.
        
        © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
      `,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send generic notification email
   */
  async sendNotificationEmail(
    email: string,
    subject: string,
    message: string,
    firstName: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `LuxuryStay HMS - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">LuxuryStay HMS</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Notification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName}!</h2>
            
            <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #555; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        LuxuryStay HMS - ${subject}
        
        Hello ${firstName}!
        
        ${message}
        
        © ${new Date().getFullYear()} LuxuryStay HMS. All rights reserved.
      `,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send email with custom template
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send email', {
        error: error.message,
        to: options.to,
        subject: options.subject,
      });

      return false;
    }
  }

  /**
   * Verify email service configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified successfully');
      return true;
    } catch (error: any) {
      logger.error('Email service connection verification failed', {
        error: error.message,
      });
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
