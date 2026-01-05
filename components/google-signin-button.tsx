"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { type ComponentProps } from "react"

export function GoogleSignInButton(props: ComponentProps<typeof Button>) {
  const supabase = createClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Button onClick={handleSignIn} {...props}>
      Sign In
    </Button>
  )
}
