import { creem } from "@/lib/creem";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { planId } = await req.json();

    const validPlans = ["TRIAL", "STARTER", "PRO", "ULTRA"];
    if (!planId || !validPlans.includes(planId)) {
      return new NextResponse("Invalid plan ID", { status: 400 });
    }

    let productId;
    switch (planId) {
      case "TRIAL":
        productId = process.env.CREEM_PRODUCT_TRIAL_ID;
        break;
      case "STARTER":
        productId = process.env.CREEM_PRODUCT_STARTER_ID;
        break;
      case "PRO":
        productId = process.env.CREEM_PRODUCT_PRO_ID;
        break;
      case "ULTRA":
        productId = process.env.CREEM_PRODUCT_ULTRA_ID;
        break;
    }

    if (!productId) {
      console.error("Missing product ID for plan:", planId);
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      console.error("Missing CREEM_API_KEY");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const result = await creem.createCheckout({
      xApiKey: apiKey,
      createCheckoutRequest: {
        productId: productId,
        customer: {
          email: user.email,
          // You can map other user details here if available
        },
        metadata: {
          userId: user.id,
          planId: planId,
        },
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
      },
    });

    if (!result.checkoutUrl) {
      console.error("Failed to create checkout session. Result:", JSON.stringify(result, null, 2));
      return new NextResponse("Failed to create checkout session", { status: 500 });
    }

    return NextResponse.json({ url: result.checkoutUrl });
  } catch (error: any) {
    console.error("Checkout error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      response: error.response // Some SDKs attach the raw response
    });
    // Return the specific error message to the client for better debugging
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
