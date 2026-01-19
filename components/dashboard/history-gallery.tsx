"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Download, Share2, MoreHorizontal, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type HistoryItem = {
  id: string
  image_url: string
  prompt: string
  created_at: string
  model: string
  mode: string
}

export function HistoryGallery() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchHistory = async () => {
    try {
      const guestId = localStorage.getItem("guest_id") || ""
      
      const res = await fetch("/api/history", {
        headers: {
          "X-Guest-Id": guestId
        }
      })
      
      if (!res.ok) throw new Error("Failed to load history")
      
      const data = await res.json()
      setHistoryItems(data.data || [])
    } catch (error) {
      console.error("History fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to load generation history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      // Cut prompt to safe filename length
      const safeName = prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')
      link.download = `banana-ai-${safeName}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  if (historyItems.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No History Yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Generate your first image to see it appear here. Your creations will be saved automatically.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 shadow-sm mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          Recent Generations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {historyItems.map((item) => (
            <div key={item.id} className="group relative rounded-lg overflow-hidden border border-border aspect-square bg-muted">
              <img
                src={item.image_url}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-xs text-white line-clamp-2 mb-2 font-medium" title={item.prompt}>
                  {item.prompt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/80">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-white hover:text-white hover:bg-white/20"
                      onClick={() => handleDownload(item.image_url, item.prompt)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:text-white hover:bg-white/20">
                            <MoreHorizontal className="h-3 w-3" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(item.prompt)
                          toast({ title: "Copied", description: "Prompt copied to clipboard" })
                        }}>
                          Copy Prompt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(item.image_url, '_blank')}>
                          Open Full Size
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}