import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, CreditCard, MessageSquare, Settings } from "lucide-react"
import { DashboardCredits } from "@/components/dashboard/dashboard-credits"
import { HistoryGallery } from "@/components/dashboard/history-gallery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto w-full space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Ready to create something amazing?
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
             <Link href="/">
               <PlusCircle className="mr-2 h-5 w-5" />
               Create New Image
             </Link>
           </Button>
        </div>
      </div>

      {/* 2. Stats Section */}
      <DashboardCredits />

      {/* 3. Recent History Section */}
      <section>
        <HistoryGallery limit={4} />
      </section>

      {/* 4. Quick Access Section */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/billing">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billing & Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Free Plan</div>
              <p className="text-xs text-muted-foreground mt-1">
                Manage your subscription and billing history.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/feedback">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Help Us</div>
              <p className="text-xs text-muted-foreground mt-1">
                Share your thoughts and help us improve.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/history">
           <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full History</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
              <div className="text-2xl font-bold">All Images</div>
              <p className="text-xs text-muted-foreground mt-1">
                View, download, and manage all your creations.
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  )
}
