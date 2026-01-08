import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ImageEditor } from "@/components/image-editor"
import { HistoryGallery } from "@/components/dashboard/history-gallery"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/sign-out-button"
import { Coins, Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/?error=please_login")
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 bg-background p-2 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 px-3">
                <Coins className="h-5 w-5 text-yellow-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Credits</span>
                  <span className="text-sm font-bold">200</span>
                </div>
              </div>
              <Button size="sm" className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500" asChild>
                  <Link href="/#pricing">
                      <Plus className="h-4 w-4 mr-1" />
                      Buy More
                  </Link>
              </Button>
            </div>
            
            <SignOutButton />
          </div>
        </div>

        {/* Generator Section */}
        <div className="mb-8">
           <ImageEditor compact={true} />
        </div>

        {/* History Section */}
        <HistoryGallery />
      </div>
    </div>
  )
}
