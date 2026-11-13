import { NextResponse } from "next/server";
import { getAuthenticatedEmail } from "@/lib/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) {
      return NextResponse.json({ parent: null });
    }

    const { data, error } = await supabaseAdmin
      .from("parents")
      .select("id, name, email, verified, membership_status, credits")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ parent: null });
    }

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
  } catch {
    return NextResponse.json({ parent: null });
  }
}
