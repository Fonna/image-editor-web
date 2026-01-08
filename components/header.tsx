import Link from "next/link"
import { Banana } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { SignOutButton } from "@/components/sign-out-button"
import { createClient } from "@/lib/supabase/server"

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
          {user ? (
            <SignOutButton />
          ) : (
            <GoogleSignInButton variant="ghost" size="sm" className="hidden sm:inline-flex" />
          )}
          <Button size="sm" className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500" asChild>
            <a href="#editor">Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
