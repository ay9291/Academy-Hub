import session from "express-session";
import type { Express, RequestHandler, Request, Response } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";
import { sendPasswordResetEmail, sendOtpEmail, sendWelcomeEmail } from "./emailService";
import { sendPhoneOtp, verifyPhoneOtp } from "./phoneOtpService";
import { generateOtp } from "./otpService";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: string;
    isAuthenticated: boolean;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { registrationNumber, password } = req.body;
      
      if (!registrationNumber || !password) {
        return res.status(400).json({ message: "Registration number and password are required" });
      }

      let actualRegNumber = registrationNumber;
      let isParentLogin = false;

      if (registrationNumber.endsWith('p') || registrationNumber.endsWith('P')) {
        actualRegNumber = registrationNumber.slice(0, -1);
        isParentLogin = true;
      }

      const user = await storage.getUserByRegistrationNumber(actualRegNumber);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (isParentLogin && user.role !== 'student') {
        return res.status(401).json({ message: "Invalid parent login" });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ message: "Password not set. Please use OTP login or contact admin." });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = isParentLogin ? 'parent' : user.role || 'student';
      req.session.isAuthenticated = true;

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: isParentLogin ? 'parent' : user.role,
        username: user.username,
        registrationNumber: isParentLogin ? registrationNumber : actualRegNumber,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/request-otp", async (req: Request, res: Response) => {
    try {
      const { registrationNumber } = req.body;
      
      if (!registrationNumber) {
        return res.status(400).json({ message: "Registration number is required" });
      }

      let actualRegNumber = registrationNumber;
      if (registrationNumber.endsWith('p') || registrationNumber.endsWith('P')) {
        actualRegNumber = registrationNumber.slice(0, -1);
      }

      const user = await storage.getUserByRegistrationNumber(actualRegNumber);
      
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found or email not set" });
      }

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createOtpCode({
        registrationNumber: registrationNumber,
        code: otp,
        expiresAt,
      });

      await sendOtpEmail(user.email, user.firstName || 'User', otp);

      res.json({ message: "OTP sent to your registered email" });
    } catch (error) {
      console.error("OTP request error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { registrationNumber, otp } = req.body;
      
      if (!registrationNumber || !otp) {
        return res.status(400).json({ message: "Registration number and OTP are required" });
      }

      let actualRegNumber = registrationNumber;
      let isParentLogin = false;

      if (registrationNumber.endsWith('p') || registrationNumber.endsWith('P')) {
        actualRegNumber = registrationNumber.slice(0, -1);
        isParentLogin = true;
      }

      const validOtp = await storage.getValidOtpCode(registrationNumber, otp);
      
      if (!validOtp) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      const user = await storage.getUserByRegistrationNumber(actualRegNumber);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (isParentLogin && user.role !== 'student') {
        return res.status(401).json({ message: "Invalid parent login" });
      }

      await storage.markOtpAsUsed(validOtp.id);

      req.session.userId = user.id;
      req.session.userRole = isParentLogin ? 'parent' : user.role || 'student';
      req.session.isAuthenticated = true;

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: isParentLogin ? 'parent' : user.role,
        username: user.username,
        registrationNumber: isParentLogin ? registrationNumber : actualRegNumber,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  app.post("/api/auth/request-phone-otp", async (req: Request, res: Response) => {
    try {
      const { registrationNumber } = req.body;
      
      if (!registrationNumber) {
        return res.status(400).json({ message: "Registration number is required" });
      }

      let actualRegNumber = registrationNumber;
      if (registrationNumber.endsWith('p') || registrationNumber.endsWith('P')) {
        actualRegNumber = registrationNumber.slice(0, -1);
      }

      const user = await storage.getUserByRegistrationNumber(actualRegNumber);
      
      if (!user || !user.phone) {
        return res.status(404).json({ message: "User not found or phone not set" });
      }

      const result = await sendPhoneOtp(user.phone);
      
      if (!result.success) {
        return res.status(500).json({ message: result.error || "Failed to send OTP" });
      }

      await storage.createOtpCode({
        registrationNumber: registrationNumber,
        code: result.verificationId!,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      res.json({ 
        message: "OTP sent to your registered phone number",
        verificationId: result.verificationId,
      });
    } catch (error) {
      console.error("Phone OTP request error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-phone-otp", async (req: Request, res: Response) => {
    try {
      const { registrationNumber, otp, verificationId } = req.body;
      
      if (!registrationNumber || !otp || !verificationId) {
        return res.status(400).json({ message: "Registration number, OTP, and verification ID are required" });
      }

      let actualRegNumber = registrationNumber;
      let isParentLogin = false;

      if (registrationNumber.endsWith('p') || registrationNumber.endsWith('P')) {
        actualRegNumber = registrationNumber.slice(0, -1);
        isParentLogin = true;
      }

      const user = await storage.getUserByRegistrationNumber(actualRegNumber);
      
      if (!user || !user.phone) {
        return res.status(401).json({ message: "User not found or phone not set" });
      }

      const verifyResult = await verifyPhoneOtp(verificationId, otp, user.phone);
      
      if (!verifyResult.success) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      if (isParentLogin && user.role !== 'student') {
        return res.status(401).json({ message: "Invalid parent login" });
      }

      req.session.userId = user.id;
      req.session.userRole = isParentLogin ? 'parent' : user.role || 'student';
      req.session.isAuthenticated = true;

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: isParentLogin ? 'parent' : user.role,
        username: user.username,
        registrationNumber: isParentLogin ? registrationNumber : actualRegNumber,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Phone OTP verification error:", error);
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.json({ message: "If your email is registered, you will receive a password reset link" });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      const resetLink = `${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/reset-password?token=${token}`;
      
      await sendPasswordResetEmail(user.email!, user.firstName || 'User', resetLink);

      res.json({ message: "If your email is registered, you will receive a password reset link" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/auth/validate-reset-token", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const resetToken = await storage.getValidPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({ message: "Token validation failed" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const resetToken = await storage.getValidPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(resetToken.userId, passwordHash);
      await storage.markPasswordResetTokenAsUsed(resetToken.id);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  app.post("/api/auth/change-password", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: "User not found or password not set" });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(userId, passwordHash);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Password change failed" });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        ...user,
        role: req.session.userRole,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const { firstName, lastName, profileImageUrl } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        profileImageUrl,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        ...updatedUser,
        role: req.session.userRole,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/");
      }
      res.clearCookie('connect.sid');
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function createUserWithRegistrationNumber(
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'teacher';
    profileImageUrl?: string;
  },
  temporaryPassword?: string
): Promise<{ user: any; registrationNumber: string; password: string }> {
  const registrationNumber = await storage.generateRegistrationNumber(userData.role);
  const password = temporaryPassword || crypto.randomBytes(4).toString('hex');
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await storage.upsertUser({
    id: `${userData.role}-${registrationNumber}`,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    profileImageUrl: userData.profileImageUrl,
    registrationNumber,
    passwordHash,
  });

  if (userData.email) {
    await sendWelcomeEmail(
      userData.email,
      userData.firstName,
      registrationNumber,
      password,
      userData.role
    );
  }

  return { user, registrationNumber, password };
}
