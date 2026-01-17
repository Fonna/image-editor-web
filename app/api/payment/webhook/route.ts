import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // Validating webhook signature should go here
    // const signature = req.headers.get("x-creem-signature");
    // if (!verifySignature(signature, body, process.env.CREEM_WEBHOOK_SECRET)) ...

    // PayPal event types use 'event_type', Creem uses 'eventType' or 'type'
    const eventType = body.event_type || body.eventType || body.type;
    // PayPal data is in 'resource', Creem is in 'object' or 'data'
    const resource = body.resource || body.object || body.data?.object || body.data;

    console.log(`Processing event: ${eventType}`);

    let userId: string | null = null;
    let planId: string | null = null;
    let transactionId: string | null = null;
    let amount: number = 0;
    let currency: string = 'USD';
    let metadata: any = {};

    // --- HANDLE PAYPAL EVENTS ---
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      console.log("Handling PayPal Capture Event");
      
      const customId = resource.custom_id;
      if (customId) {
        try {
          const customData = JSON.parse(customId);
          userId = customData.userId;
          planId = customData.planId;
        } catch (e) {
          console.error("Error parsing PayPal custom_id:", e);
        }
      }
      
      transactionId = resource.id;
      amount = parseFloat(resource.amount?.value || "0");
      currency = resource.amount?.currency_code || "USD";
      metadata = resource;
    }
    
    // --- HANDLE CREEM / STRIPE EVENTS (Existing Logic) ---
    else if (eventType === "checkout.completed" || eventType === "order.paid") {
      const meta = resource?.metadata;
      if (meta?.userId && meta?.planId) {
        userId = meta.userId;
        planId = meta.planId;
      }
      
      const order = resource.order || {};
      const rawAmount = order.amount || resource.amount || resource.amount_total || 0;
      amount = rawAmount > 0 ? rawAmount / 100 : 0;
      currency = (order.currency || resource.currency || 'USD').toUpperCase();
      transactionId = order.transaction || resource.id || `txn_${Date.now()}`;
      metadata = resource;
    }

    // --- EXECUTE CREDIT ADDITION ---
    if (userId && planId) {
      // Check if transaction already exists to prevent duplicate processing
      // PayPal might send the webhook AND we might have processed it via client-side capture
      const supabase = createAdminClient();

      const { data: existingTxn } = await supabase
        .from('transactions')
        .select('id')
        .eq('provider_transaction_id', transactionId)
        .single();

      if (existingTxn) {
        console.log(`Transaction ${transactionId} already processed. Skipping.`);
        return NextResponse.json({ received: true, status: "already_processed" });
      }
      
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
        const { data: currentCredit, error: fetchError } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error fetching credits in webhook:", fetchError);
            return new NextResponse("Database error", { status: 500 });
        }

        const currentBalance = currentCredit?.credits || 0;
        const newBalance = currentBalance + creditsToAdd;

        // Update credits
        const { error: updateError } = await supabase
          .from('user_credits')
          .upsert({ 
            user_id: userId, 
            credits: newBalance,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error("Error updating credits:", updateError);
          return new NextResponse("Database update error", { status: 500 });
        }

        console.log(`Added ${creditsToAdd} credits to user ${userId}. New balance: ${newBalance}`);

        // Record transaction
        const { error: txnError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            amount: amount,
            currency: currency,
            status: 'completed',
            plan_id: planId,
            credits_added: creditsToAdd,
            provider_transaction_id: transactionId,
            metadata: metadata,
            created_at: new Date().toISOString()
          });

        if (txnError) {
          console.error("Error logging transaction:", txnError);
        } else {
          console.log(`Transaction logged for user ${userId}`);
        }
      }
    } else {
        console.log(`Event ${eventType} received but missing user/plan info or not handled.`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}