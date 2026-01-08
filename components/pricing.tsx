"use client"

import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

export function Pricing() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleAction = async () => {
    if (loading) return

    if (!user) {
      // User is not logged in, trigger sign in
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } else {
      // User is logged in, redirect to dashboard (using #editor as placeholder if dashboard doesn't exist)
      router.push("#editor")
    }
  }

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background decoration similar to hero but subtle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-200/20 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-2">Pricing</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple One-Time Payment</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start creating amazing images today with no monthly commitment.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-yellow-400/50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500">Popular</Badge>
            </div>
            
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Starter Plan</CardTitle>
              <CardDescription>Perfect for trying out Nano Banana</CardDescription>
            </CardHeader>

            <CardContent className="text-center pb-8">
              <div className="flex items-center justify-center gap-1 mb-6">
                <span className="text-4xl font-bold">$3.99</span>
                <span className="text-muted-foreground">/ one-time</span>
              </div>

              <ul className="space-y-3 text-left max-w-[280px] mx-auto">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-yellow-700" />
                  </div>
                  <span className="text-sm">200 Credits included</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-yellow-700" />
                  </div>
                  <span className="text-sm">Approx. 100 Images (Nano Banana Standard)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <Zap className="h-3.5 w-3.5 text-yellow-700" />
                  </div>
                  <span className="text-sm">Fast GPU Generation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-yellow-700" />
                  </div>
                  <span className="text-sm">Commercial License</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-yellow-700" />
                  </div>
                  <span className="text-sm">No monthly subscription (Pay-as-you-go)</span>
                </li>
              </ul>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full bg-yellow-400 text-yellow-950 hover:bg-yellow-500 font-semibold" 
                size="lg"
                onClick={handleAction}
                disabled={loading}
              >
                Get Starter Now
              </Button>
              
              <div className="space-y-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Refund Policy: Refunds available within 7 days for unused credits only. See <Link href="/terms-of-service" className="underline hover:text-foreground">Terms of Service</Link> for details.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  AI Disclaimer: Service powered by third-party AI models.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}