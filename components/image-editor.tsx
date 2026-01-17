"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, Sparkles, X, Copy, Loader2, Lock, ArrowRight, User, UserX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { GuestLimitDialog } from "@/components/guest-limit-dialog"
import { GuestWarningDialog } from "@/components/guest-warning-dialog"

// Image validation for Doubao Seedream 4.5
const validateImageForDoubao = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: "图片大小不能超过 10MB" }
  }

  // Check file format
  const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif']
  if (!allowedFormats.includes(file.type)) {
    return { valid: false, error: "不支持的图片格式。请使用 JPEG, PNG, WEBP, BMP, TIFF 或 GIF 格式" }
  }

  // Check dimensions
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const width = img.width
      const height = img.height

      // Check minimum dimensions
      if (width <= 14 || height <= 14) {
        resolve({ valid: false, error: `图片尺寸太小。宽度和高度必须大于 14px（当前: ${width}x${height}px）` })
        return
      }

      // Check aspect ratio (1/16 to 16)
      const aspectRatio = width / height
      if (aspectRatio < 1 / 16 || aspectRatio > 16) {
        resolve({ valid: false, error: `图片宽高比不符合要求。宽高比必须在 1:16 到 16:1 之间（当前: ${aspectRatio.toFixed(2)}）` })
        return
      }

      // Check maximum pixels
      const totalPixels = width * height
      if (totalPixels > 36000000) {
        resolve({ valid: false, error: `图片像素总数过大。最大支持 36,000,000 像素（当前: ${totalPixels.toLocaleString()}）` })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      resolve({ valid: false, error: "无法读取图片文件" })
    }

    img.src = URL.createObjectURL(file)
  })
}

export function ImageEditor({ compact = false }: { compact?: boolean }) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("nano-banana")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [mode, setMode] = useState("image-to-image")
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [showGuestLimitDialog, setShowGuestLimitDialog] = useState(false)
  const [showGuestWarningDialog, setShowGuestWarningDialog] = useState(false)
  const [guestCount, setGuestCount] = useState(0)
  const [credits, setCredits] = useState<number | null>(null)

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/user/credits")
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits)
      }
    } catch (error) {
      console.error("Failed to fetch credits", error)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Check current session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Init guest count
    const storedCount = parseInt(localStorage.getItem("guest_usage_count") || "0", 10)
    setGuestCount(storedCount)

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchCredits()
    } else {
      setCredits(null)
    }
  }, [user, fetchCredits])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    await handleFiles(files)
  }, [model, toast])

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "文件类型错误",
          description: "请上传图片文件",
          variant: "destructive",
        })
        continue
      }

      // Validate for Doubao model if selected
      if (model === "doubao-seedream-4.5") {
        const validation = await validateImageForDoubao(file)
        if (!validation.valid) {
          toast({
            title: "图片不符合要求",
            description: validation.error,
            variant: "destructive",
          })
          continue
        }
      } else {
        // Original validation for other models
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "文件过大",
            description: "图片大小不能超过 10MB",
            variant: "destructive",
          })
          continue
        }
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result && uploadedImages.length < 9) {
          setUploadedImages((prev) => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(Array.from(e.target.files))
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const executeGenerate = async () => {
    setIsGenerating(true)
    setGeneratedImage(null)
    setGeneratedText(null)
    setShowGuestWarningDialog(false) // Close warning if open

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: mode === "image-to-image" ? uploadedImages[0] : undefined,
          prompt: prompt,
          mode: mode,
          model: model,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image")
      }

      // Increment guest usage on success
      if (!user) {
        const newCount = guestCount + 1
        localStorage.setItem("guest_usage_count", newCount.toString())
        setGuestCount(newCount)
      } else {
        fetchCredits()
        // Notify other components (like the dashboard header) that credits have changed
        window.dispatchEvent(new Event("credits-updated"))
      }

      // 1. Check for direct imageUrl from our new backend logic
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        if (data.result) setGeneratedText(data.result);
        return;
      }

      // 2. Fallback to parsing full_response
      if (data.full_response) {
        const message = data.full_response.choices?.[0]?.message;
        // Check for 'images' field (supporting both camelCase and snake_case inside)
        if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
          const imgObj = message.images[0];
          const url = imgObj.imageUrl?.url || imgObj.image_url?.url;
          if (url) {
            setGeneratedImage(url);
            if (message.content) {
              setGeneratedText(message.content);
            }
            return;
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      })
      return
    }

    if (mode === "image-to-image" && uploadedImages.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload a reference image.",
        variant: "destructive",
      })
      return
    }

    // Guest check
    if (!user) {
      if (guestCount >= 2) {
        setShowGuestLimitDialog(true)
        return
      }
      // Show warning before generating
      setShowGuestWarningDialog(true)
      return
    }

    if (credits !== null && credits < 2) {
      toast({
        title: "Insufficient credits",
        description: "You need at least 2 credits to generate an image.",
        variant: "destructive",
      })
      return
    }

    // Logged in user
    executeGenerate()
  }

  return (
    <section id="editor" className={compact ? "" : "py-20 bg-muted/30 scroll-mt-24"}>
      <GuestLimitDialog open={showGuestLimitDialog} onOpenChange={setShowGuestLimitDialog} />
      <GuestWarningDialog
        open={showGuestWarningDialog}
        onOpenChange={setShowGuestWarningDialog}
        onContinue={executeGenerate}
      />
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Prompt Engine
                </div>
                {credits !== null && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ml-auto">
                    {credits} Credits
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Transform your image with AI-powered editing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tabs */}
              <Tabs value={mode} onValueChange={setMode}>
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
                    <SelectItem value="doubao-seedream-4.5">🌋 Doubao Seedream 4.5</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Different models offer unique characteristics and styles
                </p>
              </div>

              {/* Image Upload */}
              {mode === "image-to-image" && (
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
                        className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive
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
              )}

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
                    Generate Now {user && <span className="text-xs opacity-80 ml-1">(2 Credits)</span>}
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
              <div className={`rounded-lg bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden ${generatedImage ? "min-h-[300px]" : "aspect-square"}`}>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 animate-pulse rounded-full"></div>
                      <Loader2 className="h-12 w-12 text-yellow-500 animate-spin relative z-10" />
                    </div>
                    <h4 className="font-medium text-foreground mt-4 mb-1">Creating Magic...</h4>
                    <p className="text-sm text-muted-foreground text-center max-w-xs animate-pulse">
                      Please wait while the AI generates your image
                    </p>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated"
                    className="w-full h-auto rounded-lg shadow-sm"
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
