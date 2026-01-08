"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, Sparkles, X, Copy, Loader2, Lock, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ImageEditor({ compact = false }: { compact?: boolean }) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("nano-banana")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result && uploadedImages.length < 9) {
            setUploadedImages((prev) => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      })
      return
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload a reference image.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)
    setGeneratedText(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadedImages[0],
          prompt: prompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image")
      }

      if (data.full_response) {
        const message = data.full_response.choices?.[0]?.message;
        // Check for non-standard 'images' field in the message object (OpenRouter specific)
        if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
           const imgObj = message.images[0];
           if (imgObj.image_url?.url) {
             setGeneratedImage(imgObj.image_url.url);
             // Use content as description if available
             if (message.content) {
               setGeneratedText(message.content);
             }
             return; // Exit early since we found the image
           }
        }
      }

      if (data.result) {
        // Parse for markdown image URL: ![alt](url)
        const markdownImageRegex = /!\[.*?\]\((.*?)\)/
        const urlRegex = /(https?:\/\/[^\s]+)/
        
        const markdownMatch = data.result.match(markdownImageRegex)
        const urlMatch = data.result.match(urlRegex)
        
        const imageUrl = markdownMatch ? markdownMatch[1] : (urlMatch ? urlMatch[0] : null)

        if (imageUrl) {
           setGeneratedImage(imageUrl)
           // If there is also text accompanying the image, we could optionally show it too, 
           // but the primary goal is to show the image.
           if (data.result !== imageUrl) {
             setGeneratedText(data.result.replace(markdownImageRegex, '').trim())
           }
        } else {
           setGeneratedText(data.result)
           toast({
             title: "Analysis Complete",
             description: "The model has processed your image.",
           })
        }
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section id="editor" className={compact ? "" : "py-20 bg-muted/30 scroll-mt-24"}>
      <div className={compact ? "" : "container mx-auto px-4"}>
        {!compact && (
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-2">Get Started</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">Try The AI Editor</h3>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Experience the power of nano-banana's natural language image editing. Transform any photo with simple text
              commands
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Prompt Engine Card */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Prompt Engine
              </CardTitle>
              <CardDescription>Transform your image with AI-powered editing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tabs */}
              <Tabs defaultValue="image-to-image">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image-to-image">Image to Image</TabsTrigger>
                  <TabsTrigger value="text-to-image">Text to Image</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">AI Model Selection</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nano-banana">🍌 Nano Banana</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Different models offer unique characteristics and styles
                </p>
              </div>

              {/* Batch Processing */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <Switch disabled />
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Batch Processing
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-700">Pro</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable batch mode to process multiple images at once
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                  <Lock className="h-3 w-3" />
                  Upgrade
                </Button>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Reference Image</Label>
                  <span className="text-xs text-muted-foreground">{uploadedImages.length}/9</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < 9 && (
                    <label
                      className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        dragActive
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-border hover:border-yellow-400/50 hover:bg-muted/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add Image</span>
                      <span className="text-xs text-muted-foreground/70">Max 10MB</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
                    </label>
                  )}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Main Prompt</Label>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe your desired image transformation..."
                  className="min-h-[100px] resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <Button
                className="w-full bg-yellow-400 text-yellow-950 hover:bg-yellow-500 gap-2"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Gallery Card */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-yellow-500" />
                Output Gallery
              </CardTitle>
              <CardDescription>Your ultra-fast AI creations appear here instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden">
                {generatedImage ? (
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : generatedText ? (
                  <ScrollArea className="h-full w-full p-6 text-left">
                    <p className="font-medium text-foreground mb-2">AI Analysis Result:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{generatedText}</p>
                  </ScrollArea>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                      <span className="text-3xl">🍌</span>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Ready for instant generation</h4>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      Enter your prompt and unleash the power
                    </p>
                  </>
                )}
              </div>
              


              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50">
                <p className="text-sm text-yellow-800 mb-2">Want more powerful image generation features?</p>
                <Button variant="link" className="p-0 h-auto text-yellow-700 gap-1">
                  Visit Full Generator
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
