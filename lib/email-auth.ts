import crypto from "crypto";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "./supabase";

const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure =
  process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function generateAndStoreOtp(email: string): Promise<string> {
  const code = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  await supabaseAdmin.from("otp_codes").upsert(
    { email: email.toLowerCase().trim(), code, expires_at: expiresAt },
    { onConflict: "email" }
  );

  return code;
}

export async function verifyStoredOtp(
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const { data, error } = await supabaseAdmin
    .from("otp_codes")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      message: "Verification code expired or not requested. Please request a new code.",
    };
  }

  if (Date.now() > Number(data.expires_at)) {
    await supabaseAdmin.from("otp_codes").delete().eq("email", normalizedEmail);
    return {
      success: false,
      message: "Verification code has expired. Please try again.",
    };
  }

  const storedCode = String(data.code || "").trim();
  const inputCode = code.trim();
  const a = Buffer.from(storedCode, "utf8");
  const b = Buffer.from(inputCode, "utf8");

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return {
      success: false,
      message: "Incorrect verification code. Please check your inbox.",
    };
  }

  // Code is valid: remove it so it cannot be reused
  await supabaseAdmin.from("otp_codes").delete().eq("email", normalizedEmail);
  return { success: true, message: "Email verified successfully!" };
}
