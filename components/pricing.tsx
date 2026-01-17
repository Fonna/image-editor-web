"use client"

import Link from "next/link"
import { Check, Zap, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { PayPalCheckoutButton } from "@/components/paypal-checkout-button"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Pricing() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")

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

  const handleCheckout = async (planId: string) => {
    if (loading) return

    if (!user) {
      // User is not logged in, trigger sign in
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
    } else {
      try {
        const response = await fetch("/api/payment/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || "Failed to start checkout")
        }

        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      } catch (error) {
        console.error("Checkout error:", error)
        alert("Failed to start checkout. Please try again.")
      }
    }
  }

  const plans = [
    {
      name: "Trial Plan",
      description: "Test the waters",
      price: "$1",
      credits: "60 Credits included",
      images: "Approx. 30 Images (Nano Banana Standard)",
      planId: "TRIAL",
      popular: false
    },
    {
      name: "Starter Plan",
      description: "Perfect for casual creators",
      price: "$9.99",
      credits: "450 Credits included",
      images: "Approx. 225 Images (Nano Banana Standard)",
      planId: "STARTER",
      popular: false
    },
    {
      name: "Pro Plan",
      description: "For serious creators",
      price: "$49.99",
      credits: "2400 Credits included",
      images: "Approx. 1200 Images (Nano Banana Standard)",
      planId: "PRO",
      popular: true
    },
    {
      name: "Ultra Plan",
      description: "Maximum creative power",
      price: "$129.99",
      credits: "6500 Credits included",
      images: "Approx. 3250 Images (Nano Banana Standard)",
      planId: "ULTRA",
      popular: false
    }
  ]

  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <section id="pricing" className="py-20 relative overflow-hidden">
        {/* Background decoration similar to hero but subtle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-200/20 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-2">Pricing</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple One-Time Payment</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Start creating amazing images today with no monthly commitment.
            </p>

            <Tabs defaultValue="card" className="w-[400px] mx-auto" onValueChange={(v) => setPaymentMethod(v as "card" | "paypal")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Credit Card
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  {/* Simple PayPal Text or Icon if available */}
                  <span className="font-bold italic">PayPal</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.planId} className={`border-yellow-400/50 shadow-xl relative overflow-hidden flex flex-col ${plan.popular ? 'scale-105 z-10 border-yellow-500 shadow-2xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-4">
                    <Badge className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-8 flex-1">
                  <div className="flex items-center justify-center gap-1 mb-6">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/ one-time</span>
                  </div>

                  <ul className="space-y-3 text-left text-sm mx-auto">
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-yellow-700" />
                      </div>
                      <span>{plan.credits}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-yellow-700" />
                      </div>
                      <span>{plan.images}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <Zap className="h-3 w-3 text-yellow-700" />
                      </div>
                      <span>Fast GPU Generation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-yellow-700" />
                      </div>
                      <span>Commercial License</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-yellow-700" />
                      </div>
                      <span>No monthly subscription</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 mt-auto">
                  {paymentMethod === "paypal" ? (
                    user ? (
                      <PayPalCheckoutButton 
                        planId={plan.planId} 
                        onSuccess={() => router.push('/dashboard/history?success=true')}
                      />
                    ) : (
                      <Button 
                        className="w-full bg-[#FFC439] text-black hover:bg-[#FFC439]/90 font-semibold" 
                        size="lg"
                        onClick={() => supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                          },
                        })}
                      >
                        Sign in to Pay with PayPal
                      </Button>
                    )
                  ) : (
                    <Button 
                      className="w-full bg-yellow-400 text-yellow-950 hover:bg-yellow-500 font-semibold" 
                      size="lg"
                      onClick={() => handleCheckout(plan.planId)}
                      disabled={loading}
                    >
                      Get {plan.name.split(' ')[0]}
                    </Button>
                  )}
                  
                  {plan.planId === "PRO" && (
                     <div className="space-y-2 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        Refund Policy: Refunds within 7 days.
                      </p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                  Refund Policy: Refunds available within 7 days for unused credits only. See <Link href="/terms-of-service" className="underline hover:text-foreground">Terms of Service</Link> for details.
              </p>
              <p className="text-xs text-muted-foreground/60">
                  AI Disclaimer: Service powered by third-party AI models.
              </p>
          </div>
        </div>
      </section>
    </PayPalScriptProvider>
  )
}
