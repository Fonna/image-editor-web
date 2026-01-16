import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // Validating webhook signature should go here
    // const signature = req.headers.get("x-creem-signature");
    // if (!verifySignature(signature, body, process.env.CREEM_WEBHOOK_SECRET)) ...

    const eventType = body.eventType || body.type;
    const eventObject = body.object || body.data?.object || body.data;

    console.log(`Processing event: ${eventType}`);

    if (eventType === "checkout.completed" || eventType === "order.paid") {
      const metadata = eventObject?.metadata;
      
      console.log("Metadata found:", metadata);

      if (metadata?.userId && metadata?.planId) {
        const userId = metadata.userId;
        const planId = metadata.planId;
        
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
          const supabase = createAdminClient();
          
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
          // Extract amount and currency from various possible locations
          // Creem 'checkout.completed' usually has amount in eventObject.order.amount (in cents)
          const order = eventObject.order || {};
          const rawAmount = order.amount || eventObject.amount || eventObject.amount_total || 0;
          const amount = rawAmount > 0 ? rawAmount / 100 : 0;
          
          const currency = (order.currency || eventObject.currency || 'USD').toUpperCase();
          const transactionId = order.transaction || eventObject.id || `txn_${Date.now()}`;

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
              metadata: eventObject,
              created_at: new Date().toISOString()
            });

          if (txnError) {
            console.error("Error logging transaction:", txnError);
            // We don't fail the webhook here because credits were already added
          } else {
            console.log(`Transaction logged for user ${userId}`);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
