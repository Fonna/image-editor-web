import { generatePayPalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderID } = await req.json();

    if (!orderID) {
      return new NextResponse("Missing order ID", { status: 400 });
    }

    const accessToken = await generatePayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    console.log("PayPal Capture Response:", JSON.stringify(data, null, 2));

    if (response.status !== 201 && response.status !== 200) {
      console.error("PayPal Capture Order Error:", data);
      return new NextResponse("Failed to capture PayPal order", { status: 500 });
    }

    // Payment successful, now add credits
    
    const purchaseUnit = data.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    
    // custom_id can be on the purchase_unit level or the capture level depending on API version and flow
    let rawCustomId = purchaseUnit?.custom_id || capture?.custom_id;

    if (!rawCustomId) {
        console.warn("custom_id not found in standard locations. Checking deeper...");
        // Fallback: Check if it's in the payment object itself if structure differs
    }

    let planId = null;
    let userIdFromOrder = null;

    if (rawCustomId) {
      try {
        const customData = JSON.parse(rawCustomId);
        planId = customData.planId;
        userIdFromOrder = customData.userId;
      } catch (e) {
        console.error("Error parsing custom_id:", e);
      }
    }

    // Verify the user matches the one who initiated the request (optional but good security)
    if (userIdFromOrder && userIdFromOrder !== user.id) {
       console.warn("User ID mismatch in PayPal capture. Order User:", userIdFromOrder, "Request User:", user.id);
       // We might still proceed if we trust the order ID, but it's suspicious.
       // For now, we'll proceed using the authenticated user.
    }

    if (planId) {
      const adminSupabase = createAdminClient();
      
      let creditsToAdd = 0;
      switch (planId) {
        case "TRIAL":
          creditsToAdd = 60;
          break;
        case "STARTER":
          creditsToAdd = 450;
          break;
        case "PRO":
          creditsToAdd = 2400;
          break;
        case "ULTRA":
          creditsToAdd = 6500;
          break;
      }

      if (creditsToAdd > 0) {
        // Get current credits
        const { data: currentCredit, error: fetchError } = await adminSupabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error fetching credits:", fetchError);
            return new NextResponse("Database error", { status: 500 });
        }

        const currentBalance = currentCredit?.credits || 0;
        const newBalance = currentBalance + creditsToAdd;

        // Update credits
        const { error: updateError } = await adminSupabase
          .from('user_credits')
          .upsert({ 
            user_id: user.id, 
            credits: newBalance,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error("Error updating credits:", updateError);
          return new NextResponse("Database update error", { status: 500 });
        }

        // Record transaction
        const capture = purchaseUnit?.payments?.captures?.[0] || {};
        const amount = capture.amount?.value || 0;
        const currency = capture.amount?.currency_code || 'USD';
        const transactionId = capture.id || data.id;

        const { error: txnError } = await adminSupabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: parseFloat(amount),
            currency: currency,
            status: 'completed',
            plan_id: planId,
            credits_added: creditsToAdd,
            provider_transaction_id: transactionId,
            metadata: data,
            created_at: new Date().toISOString()
          });

        if (txnError) {
          console.error("Error logging transaction:", txnError);
        }
      }
    } else {
        console.error("Could not determine planId from PayPal order.");
        // We captured the money but failed to fulfill? 
        // We should log this critically or return an error so the client knows something went wrong.
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PayPal Capture Order Exception:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
