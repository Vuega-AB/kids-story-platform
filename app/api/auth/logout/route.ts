import { NextResponse } from "next/server";
import { clearServerSessionCookie } from "@/lib/server-auth";

export async function POST() {
  await clearServerSessionCookie();
  return NextResponse.json({ success: true });
}
