import nodemailer from "nodemailer";

type OtpRecord = {
  code: string;
  expiresAt: number;
};

// Global in-memory storage for 6-digit codes (10 minute expiry)
const globalForOtp = global as unknown as { otpStore?: Map<string, OtpRecord> };
const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== "production") globalForOtp.otpStore = otpStore;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true" || true,
  auth: {
    user: process.env.SMTP_USER || "businessforyou1990@gmail.com",
    pass: process.env.SMTP_PASS,
  },
});

export function generateAndStoreOtp(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // valid for 10 minutes

  otpStore.set(email.toLowerCase().trim(), { code, expiresAt });
  return code;
}

export function verifyStoredOtp(email: string, code: string): { success: boolean; message: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { success: false, message: "Verification code expired or not requested. Please request a new code." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { success: false, message: "Verification code has expired. Please try again." };
  }

  if (record.code !== code.trim()) {
    return { success: false, message: "Incorrect verification code. Please check your inbox." };
  }

  otpStore.delete(normalizedEmail);
  return { success: true, message: "Email verified successfully!" };
}