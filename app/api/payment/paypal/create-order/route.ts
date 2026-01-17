import { generatePayPalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
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

    const plans: Record<string, { price: string; value: string }> = {
      "TRIAL": { price: "1.00", value: "1.00" },
      "STARTER": { price: "9.99", value: "9.99" },
      "PRO": { price: "49.99", value: "49.99" },
      "ULTRA": { price: "129.99", value: "129.99" }
    };

    if (!planId || !plans[planId]) {
      return new NextResponse("Invalid plan ID", { status: 400 });
    }

    const plan = plans[planId];
    const accessToken = await generatePayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: plan.value,
            },
            custom_id: JSON.stringify({
              userId: user.id,
              planId: planId,
            }),
          },
        ],
      }),
    });

    const data = await response.json();

    if (response.status !== 201) {
      console.error("PayPal Create Order Error:", data);
      return new NextResponse("Failed to create PayPal order", { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PayPal Create Order Exception:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
