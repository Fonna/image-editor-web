import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

const showcaseItems = [
  {
    image: "/ai-generated-majestic-mountain-landscape-with-snow.jpg",
    title: "Ultra-Fast Mountain Generation",
    description: "Created in 0.8 seconds with Nano Banana's optimized neural engine",
  },
  {
    image: "/ai-generated-beautiful-garden-with-flowers-and-pat.jpg",
    title: "Instant Garden Creation",
    description: "Complex scene rendered in milliseconds using Nano Banana technology",
  },
  {
    image: "/ai-generated-tropical-beach-with-palm-trees-sunset.jpg",
    title: "Real-time Beach Synthesis",
    description: "Nano Banana delivers photorealistic results at lightning speed",
  },
  {
    image: "/ai-generated-aurora-borealis-northern-lights-over-.jpg",
    title: "Rapid Aurora Generation",
    description: "Advanced effects processed instantly with Nano Banana AI",
  },
]

export function Showcase() {
  return (
    <section id="showcase" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-2">Showcase</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Lightning-Fast AI Creations</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">See what BananaImage generates in milliseconds</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {showcaseItems.map((item, index) => (
            <Card key={index} className="overflow-hidden border-border/50 hover:shadow-xl transition-shadow group">
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-4 left-4 bg-yellow-400 text-yellow-950 hover:bg-yellow-400 gap-1">
                  <Zap className="h-3 w-3" />
                  Nano Banana Speed
                </Badge>
              </div>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Experience the power of BananaImage yourself</p>
          <Button className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 gap-2">
            <span className="text-lg">🍌</span>
            Try BananaImage Generator
          </Button>
        </div>
      </div>
    </section>
  )
}
