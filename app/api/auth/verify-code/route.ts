import crypto from "crypto";
import { NextResponse } from "next/server";
import { verifyStoredOtp } from "@/lib/email-auth";
import { hashPassword, setServerSessionCookie } from "@/lib/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, code, name, password } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const result = await verifyStoredOtp(cleanEmail, String(code));

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required to create an account." }, { status: 400 });
    }

    const hashedPassword = hashPassword(String(password));
    const initialCredits = 5;

    const { data, error } = await supabaseAdmin
      .from("parents")
      .upsert(
        [
          {
            id: crypto.randomUUID(),
            name: String(name).trim(),
            email: cleanEmail,
            password: hashedPassword,
            verified: true,
            membership_status: "member",
            credits: initialCredits,
          },
        ],
        { onConflict: "email" }
      )
      .select("id, name, email, verified, membership_status, credits")
      .single();

    if (error || !data) {
      console.error("Create parent error:", error);
      return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
    }

    await setServerSessionCookie(cleanEmail);

    return NextResponse.json({
      success: true,
      message: result.message,
      parent: {
        id: data.id,
        name: data.name,
        email: data.email,
        verified: data.verified,
        membershipStatus: data.membership_status || "member",
        credits: data.credits ?? initialCredits,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
