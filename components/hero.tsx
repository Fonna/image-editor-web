import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <Badge variant="outline" className="mb-6 gap-2 px-4 py-2 border-yellow-400/50 bg-yellow-50">
          <span className="text-lg">🍌</span>
          <span className="text-yellow-700">The AI model that outperforms Flux Kontext</span>
          <ArrowRight className="h-3 w-3 text-yellow-700" />
        </Badge>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance">
          BananaImage
        </h1>

        <div className="flex items-center justify-center mb-6">
           <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 text-base animate-pulse">
             ✨ New user gets 10 credits!
           </Badge>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-pretty">
          Transform any image with simple text prompts. Nano-banana's advanced model delivers consistent character
          editing and scene preservation that surpasses Flux Kontext. Experience the future of AI image editing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 gap-2 text-base px-8" asChild>
            <a href="#editor">
              <Sparkles className="h-5 w-5" />
              Start Editing
              <span className="text-xl">🍌</span>
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            One-shot editing
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Multi-image support
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Natural language
          </div>
        </div>
      </div>
    </section>
  )
}
