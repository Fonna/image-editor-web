import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminSupabase = createAdminClient()

  // Try to get credits
  const { data: creditData, error: fetchError } = await adminSupabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
    console.error('Error fetching credits:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }

  if (creditData) {
    return NextResponse.json({ credits: creditData.credits })
  }

  // If no record, initialize with 10 credits
  const { data: newCreditData, error: insertError } = await adminSupabase
    .from('user_credits')
    .insert([{ user_id: user.id, credits: 10 }])
    .select('credits')
    .single()

  if (insertError) {
    console.error('Error initializing credits:', insertError)
    // If insert fails (maybe race condition), try fetching again
    return NextResponse.json({ error: 'Failed to initialize credits' }, { status: 500 })
  }

  return NextResponse.json({ credits: newCreditData.credits })
}
