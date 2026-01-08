import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/?error=please_login")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-4">
             {/* Credit Balance Display */}
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">200 Credits</span>
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs bg-yellow-400/10 text-yellow-700 hover:bg-yellow-400/20 border-yellow-200" asChild>
                <Link href="/#pricing">Buy More</Link>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
