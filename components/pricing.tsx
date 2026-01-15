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

const PLANS = [
  {
    name: "Trial Plan",
    price: "$1",
    description: "Perfect for a quick test",
    credits: 60,
    images: 30,
    popular: false,
    buttonText: "Get Trial Now",
  },
  {
    name: "Starter Plan",
    price: "$9.99",
    description: "Ideal for light users",
    credits: 450,
    images: 225,
    popular: false,
    buttonText: "Get Starter Now",
  },
  {
    name: "Pro Plan",
    price: "$49.99",
    description: "Our most popular choice",
    credits: 2400,
    images: 1200,
    popular: true,
    badgeText: "Most Popular",
    buttonText: "Get Pro Now",
  },
  {
    name: "Ultra Plan",
    price: "$129.99",
    description: "For professional creators",
    credits: 6500,
    images: 3250,
    popular: false,
    buttonText: "Get Ultra Now",
  },
]

import { useToast } from "@/hooks/use-toast"

export function Pricing() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

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

  const handleAction = async (planName: string) => {
    if (loading) return

    if (!user) {
      // User is not logged in, trigger sign in
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      return
    }

    // Process mock payment
    setProcessingPlan(planName)
    try {
      const res = await fetch('/api/payment/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName }),
      })

      if (!res.ok) throw new Error('Payment failed')

      const data = await res.json()
      
      toast({
        title: "Purchase Successful!",
        description: `You have added ${data.message ? data.message.replace('Successfully added ', '') : 'credits'} to your account.`,
        variant: "default", // or "success" if you have it
      })

      // Dispatch event to update credits in navbar/sidebar
      window.dispatchEvent(new Event("credits-updated"))
      
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong with the purchase.",
        variant: "destructive",
      })
    } finally {
      setProcessingPlan(null)
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={`border-yellow-400/50 shadow-xl relative overflow-hidden flex flex-col ${plan.popular ? 'ring-2 ring-yellow-400 scale-105 z-10' : 'scale-95'}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 p-3">
                  <Badge className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 text-[10px] px-2 py-0">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2 pt-6">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-6 flex-1 px-4">
                <div className="flex items-center justify-center gap-1 mb-4">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-[10px]">/ one-time</span>
                </div>

                <ul className="space-y-2 text-left mx-auto">
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-yellow-700" />
                    </div>
                    <span className="text-xs">{plan.credits} Credits included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-yellow-700" />
                    </div>
                    <span className="text-xs">Approx. {plan.images} images</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                      <Zap className="h-3 w-3 text-yellow-700" />
                    </div>
                    <span className="text-xs">Fast GPU Generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-yellow-700" />
                    </div>
                    <span className="text-xs">Commercial License</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 mt-auto">
                <Button 
                  className="w-full bg-yellow-400 text-yellow-950 hover:bg-yellow-500 font-semibold" 
                  size="lg"
                  onClick={() => handleAction(plan.name)}
                  disabled={loading || processingPlan !== null}
                >
                  {processingPlan === plan.name ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
                
                <div className="space-y-2 text-center">
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    7-day refund for unused credits. <Link href="/terms-of-service" className="underline hover:text-foreground">Terms</Link> apply.
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}