import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export default async function FeedbackPage() {
  const supabase = await createClient()

  const { data: feedbackList, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feedback:", error)
    return <div>Error loading feedback.</div>
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-6">
      <h1 className="text-2xl font-bold mb-6">User Feedback</h1>
      
      {feedbackList && feedbackList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feedbackList.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={item.status === "new" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{item.message}</p>
                {item.user_id && (
                    <p className="mt-4 text-xs text-muted-foreground">User ID: {item.user_id}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          No feedback received yet.
        </div>
      )}
    </div>
  )
}
