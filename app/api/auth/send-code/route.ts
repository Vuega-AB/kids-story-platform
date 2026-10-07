import { NextResponse } from "next/server";
import { generateAndStoreOtp, transporter } from "@/lib/email-auth";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = generateAndStoreOtp(cleanEmail);

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Storyland" <businessforyou1990@gmail.com>`,
      to: cleanEmail,
      subject: `✨ Your Storyland Verification Code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border-radius: 20px; background-color: #fdfaf5; border: 2px solid #e9d5ff;">
          <h1 style="color: #6b46c1; text-align: center; font-size: 26px;">Welcome to Storyland! ✨</h1>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
            Hi ${name ? `<b>${name}</b>` : "Explorer"}! 👋
          </p>
          <p style="font-size: 15px; color: #4a5568;">
            Here is your 6-digit verification code to activate your account:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff; background: linear-gradient(135deg, #9b7bea, #ff7184); padding: 12px 28px; border-radius: 14px; box-shadow: 0 4px 10px rgba(155, 123, 234, 0.3);">
              ${code}
            </span>
          </div>
          <p style="font-size: 13px; color: #a0aec0; text-align: center;">
            This code expires in 10 minutes. If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Code sent successfully." });
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    return NextResponse.json(
      { error: "Could not send verification email. Please try again." },
      { status: 500 }
    );
  }
}