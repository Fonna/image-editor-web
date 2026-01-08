"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Download, Share2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for history
const historyItems = [
  {
    id: 1,
    image: "/ai-generated-artistic-image.jpg",
    prompt: "A futuristic city with flying cars in cyberpunk style",
    date: "2 mins ago",
  },
  {
    id: 2,
    image: "/ai-generated-aurora-borealis-northern-lights-over-.jpg",
    prompt: "Aurora borealis over a snowy mountain range",
    date: "1 hour ago",
  },
  {
    id: 3,
    image: "/ai-generated-beautiful-garden-with-flowers-and-pat.jpg",
    prompt: "A beautiful English garden with blooming flowers",
    date: "2 hours ago",
  },
  {
    id: 4,
    image: "/ai-generated-majestic-mountain-landscape-with-snow.jpg",
    prompt: "Majestic mountains with snow peaks",
    date: "1 day ago",
  },
]

export function HistoryGallery() {
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
            <div key={item.id} className="group relative rounded-lg overflow-hidden border border-border aspect-square">
              <img
                src={item.image}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-xs text-white line-clamp-2 mb-2 font-medium">{item.prompt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/80">{item.date}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:text-white hover:bg-white/20">
                      <Download className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:text-white hover:bg-white/20">
                            <MoreHorizontal className="h-3 w-3" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Reuse Prompt</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
