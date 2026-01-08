import Link from "next/link"
import { Banana } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { SignOutButton } from "@/components/sign-out-button"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-yellow-400/10 p-2 rounded-xl">
            <Banana className="h-6 w-6 text-yellow-400" />
          </div>
          <span className="text-xl font-bold text-foreground">BananaImage</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#editor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Editor
          </Link>
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#showcase" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Showcase
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500" asChild>
            <Link href="#editor">Get Started</Link>
          </Button>
          
          {user ? (
            <Link href="/dashboard" aria-label="Go to Dashboard">
              <Avatar className="h-8 w-8 border border-border/50 transition-transform hover:scale-105">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
                <AvatarFallback className="bg-yellow-100 text-yellow-700">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <GoogleSignInButton variant="ghost" size="sm" className="hidden sm:inline-flex" />
          )}
        </div>
      </div>
    </header>
  )
}
