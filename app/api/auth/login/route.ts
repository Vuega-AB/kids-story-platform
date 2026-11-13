import { NextResponse } from "next/server";
import { hashPassword, setServerSessionCookie, verifyPassword } from "@/lib/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("parents")
      .select("id, name, email, password, verified, membership_status, credits")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const { valid, needsRehash } = verifyPassword(data.password, String(password));
    if (!valid) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    // Automatically upgrade legacy plaintext password to scrypt hash
    if (needsRehash) {
      await supabaseAdmin
        .from("parents")
        .update({ password: hashPassword(String(password)) })
        .eq("email", cleanEmail);
    }

    await setServerSessionCookie(cleanEmail);

    return NextResponse.json({
      parent: {
        id: data.id,
        name: data.name,
        email: data.email,
        verified: data.verified,
        membershipStatus: data.membership_status || "member",
        credits: data.credits ?? 5,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
