import Link from "next/link"
import { Banana } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400/10 p-1.5 rounded-lg">
              <Banana className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-lg font-bold text-foreground">BananaImage</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="mailto:support@bananaimage.online" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">© 2026 BananaImage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
