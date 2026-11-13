import { NextResponse } from "next/server";
import { fulfillCheckoutSession } from "@/lib/stripe-fulfillment";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const result = await fulfillCheckoutSession(sessionId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Verify session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
