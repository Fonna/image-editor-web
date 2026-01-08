import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ImageEditor } from "@/components/image-editor"
import { Features } from "@/components/features"
import { Showcase } from "@/components/showcase"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"
import { BananaDecorations } from "@/components/banana-decorations"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <BananaDecorations />
      <Header />
      <Hero />
      <ImageEditor />
      <Features />
      <Showcase />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
