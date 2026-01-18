import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { message, userId } = json

    if (!message) {
      return new NextResponse("Message is required", { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("feedback").insert({
      message,
      user_id: userId,
    })

    if (error) {
      console.error("[FEEDBACK_POST]", error)
      return new NextResponse("Internal Error", { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[FEEDBACK_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
