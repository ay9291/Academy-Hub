import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'ILT Academy <noreply@iltacademy.in>';

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetLink: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not configured - skipping password reset email');
    return false;
  }
  
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - ILT Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ILT Academy</h1>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937;">Password Reset Request</h2>
            <p style="color: #374151; font-size: 16px;">Hello ${firstName},</p>
            <p style="color: #374151; font-size: 16px;">
              You requested to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 1 hour. If you did not request a password reset, 
              please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              ILT Academy Management System
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  registrationNumber: string,
  temporaryPassword: string,
  role: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not configured - skipping welcome email');
    return false;
  }
  
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to ILT Academy - Your Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ILT Academy</h1>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937;">Welcome to ILT Academy!</h2>
            <p style="color: #374151; font-size: 16px;">Hello ${firstName},</p>
            <p style="color: #374151; font-size: 16px;">
              Your ${role} account has been created. Here are your login credentials:
            </p>
            <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #374151;">
                <strong>Registration Number:</strong> ${registrationNumber}
              </p>
              <p style="margin: 5px 0; color: #374151;">
                <strong>Temporary Password:</strong> ${temporaryPassword}
              </p>
            </div>
            <p style="color: #dc2626; font-size: 14px;">
              Please change your password after your first login for security.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              ILT Academy Management System
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export async function sendOtpEmail(
  email: string,
  firstName: string,
  otp: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not configured - skipping OTP email');
    return false;
  }
  
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Login OTP - ILT Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ILT Academy</h1>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937;">Your Login Code</h2>
            <p style="color: #374151; font-size: 16px;">Hello ${firstName},</p>
            <p style="color: #374151; font-size: 16px;">
              Use the following code to log in to your account:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #1e40af; color: white; padding: 20px 40px; 
                          font-size: 32px; font-weight: bold; letter-spacing: 8px;
                          display: inline-block; border-radius: 8px;">
                ${otp}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This code will expire in 10 minutes. If you did not request this code, 
              please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              ILT Academy Management System
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}
