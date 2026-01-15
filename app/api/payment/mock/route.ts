import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLAN_CREDITS: Record<string, number> = {
  "Trial Plan": 60,
  "Starter Plan": 450,
  "Pro Plan": 2400,
  "Ultra Plan": 6500,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { planName } = await req.json()
    const creditsToAdd = PLAN_CREDITS[planName]

    if (!creditsToAdd) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 1. Get current credits
    const { data: currentData, error: fetchError } = await adminSupabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const currentCredits = currentData?.credits || 0
    const newCredits = currentCredits + creditsToAdd

    // 2. Update (or insert if missing - though upsert is safer)
    const { error: updateError } = await adminSupabase
      .from('user_credits')
      .upsert({ 
        user_id: user.id, 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })

    if (updateError) throw updateError

    // 3. Log the transaction (Optional but good for history)
    // We would insert into a 'transactions' table here if it existed.
    
    return NextResponse.json({ 
      success: true, 
      credits: newCredits,
      message: `Successfully added ${creditsToAdd} credits` 
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
