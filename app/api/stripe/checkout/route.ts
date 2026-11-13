import { NextResponse } from "next/server";
import { getAuthenticatedEmail } from "@/lib/server-auth";
import { stripe } from "@/lib/stripe-fulfillment";

const PACKAGES: Record<string, { name: string; price: number; credits: number }> = {
  starter: { name: "Starter Pack (5 Sparks)", price: 299, credits: 5 }, // $2.99
  popular: { name: "Story Lover Pack (15 Sparks)", price: 699, credits: 15 }, // $6.99
  master: { name: "Master Author Pack (35 Sparks)", price: 1299, credits: 35 }, // $12.99
};

export async function POST(request: Request) {
  try {
    const { packageId, email } = await request.json();

    if (!packageId || !PACKAGES[packageId]) {
      return NextResponse.json({ error: "Invalid package selected." }, { status: 400 });
    }

    const sessionEmail = await getAuthenticatedEmail();
    const userEmail = (sessionEmail || email || "").toLowerCase().trim();

    if (!userEmail) {
      return NextResponse.json({ error: "Please log in before purchasing credits." }, { status: 401 });
    }

    const selectedPack = PACKAGES[packageId];
    const requestOrigin = new URL(request.url).origin;
    const origin = process.env.NEXT_PUBLIC_APP_URL || requestOrigin;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedPack.name,
              description: `Adds ${selectedPack.credits} Magic Sparks to your Storyland account balance.`,
            },
            unit_amount: selectedPack.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userEmail,
      metadata: {
        userEmail,
        creditsToAdd: selectedPack.credits.toString(),
        fulfilled: "false",
      },
      success_url: `${origin}/parents?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/parents?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
