import Stripe from "stripe";
import { supabaseAdmin } from "./supabase";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

const inFlightSessions = new Set<string>();

export async function fulfillCheckoutSession(sessionId: string): Promise<{
  success: boolean;
  alreadyFulfilled?: boolean;
  newCredits: number;
  creditsAdded: number;
}> {
  if (inFlightSessions.has(sessionId)) {
    throw new Error("Payment verification is already in progress.");
  }

  inFlightSessions.add(sessionId);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed.");
    }

    const userEmail = session.metadata?.userEmail?.toLowerCase().trim();
    const creditsToAdd = Number(session.metadata?.creditsToAdd || 0);

    if (!userEmail || creditsToAdd <= 0) {
      throw new Error("Invalid session metadata.");
    }

    const { data: parent } = await supabaseAdmin
      .from("parents")
      .select("credits")
      .eq("email", userEmail)
      .maybeSingle();

    const currentCredits = Number(parent?.credits ?? 5);

    // Idempotency check: if already fulfilled in Stripe metadata, do not add credits again
    if (session.metadata?.fulfilled === "true") {
      return {
        success: true,
        alreadyFulfilled: true,
        newCredits: currentCredits,
        creditsAdded: creditsToAdd,
      };
    }

    const newCredits = currentCredits + creditsToAdd;

    // Mark session as fulfilled in Stripe metadata first so replays cannot double-credit
    await stripe.checkout.sessions.update(sessionId, {
      metadata: {
        ...session.metadata,
        fulfilled: "true",
        fulfilledAt: new Date().toISOString(),
      },
    });

    const { error: updateError } = await supabaseAdmin
      .from("parents")
      .update({ credits: newCredits })
      .eq("email", userEmail);

    if (updateError) {
      // Rollback metadata flag if DB update failed so retry can succeed
      await stripe.checkout.sessions.update(sessionId, {
        metadata: {
          ...session.metadata,
          fulfilled: "false",
        },
      });
      throw new Error("Failed to update credits in database.");
    }

    return {
      success: true,
      alreadyFulfilled: false,
      newCredits,
      creditsAdded: creditsToAdd,
    };
  } finally {
    inFlightSessions.delete(sessionId);
  }
}
