import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = "noreply@iltacademy.in";

export async function sendPasswordResetEmail(email: string, firstName: string, resetLink: string) {
  if (!resend) {
    console.warn("Resend API key not configured, skipping password reset email");
    return;
  }

  await resend.emails.send({
    from: `ILT Academy <${fromEmail}>`,
    to: email,
    subject: "Reset Your Password - ILT Academy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${firstName},</h2>
        <p>We received a request to reset your password for your ILT Academy account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>ILT Academy Team</p>
      </div>
    `,
  });
}

export async function sendOtpEmail(email: string, firstName: string, otp: string) {
  if (!resend) {
    console.warn("Resend API key not configured, skipping OTP email");
    return;
  }

  await resend.emails.send({
    from: `ILT Academy <${fromEmail}>`,
    to: email,
    subject: "Your Login OTP - ILT Academy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${firstName},</h2>
        <p>Your one-time password (OTP) for ILT Academy login is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>ILT Academy Team</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, firstName: string, registrationNumber: string, temporaryPassword: string, role: string) {
  if (!resend) {
    console.warn("Resend API key not configured, skipping welcome email");
    return;
  }

  await resend.emails.send({
    from: `ILT Academy <${fromEmail}>`,
    to: email,
    subject: "Welcome to ILT Academy - Your Account Details",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ILT Academy, ${firstName}!</h2>
        <p>Your ${role} account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Registration Number:</strong> ${registrationNumber}</p>
          <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        </div>
        <p>Please change your password after your first login for security.</p>
        <p>Best regards,<br>ILT Academy Team</p>
      </div>
    `,
  });
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
