import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"

import { FeedbackWidget } from "@/components/feedback-widget"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BananaImage - Free AI Photo Editor | Try Multiple Models Online",
  description:
    "Edit photos for free using the latest AI models. Switch instantly between models to find the best style while keeping characters consistent.",
  keywords: ['Free AI Editor', 'Multi-model AI', 'Seedream', 'NanoBanana', 'AI Inpainting', 'BananaImage', 'DOUBAO', 'GLM-IMAGE'],
  generator: "v0.app",
  metadataBase: new URL("https://www.bananaimage.online"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.bananaimage.online",
    title: "BananaImage - Free AI Photo Editor | Try Multiple Models Online",
    description: "Edit photos for free using the latest AI models. Switch instantly between models to find the best style while keeping characters consistent.",
    siteName: "BananaImage",
    images: [
      {
        url: "/ai-generated-artistic-image.jpg",
        width: 1200,
        height: 630,
        alt: "BananaImage AI Photo Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BananaImage - Free AI Photo Editor | Try Multiple Models Online",
    description: "Edit photos for free using the latest AI models. Switch instantly between models to find the best style while keeping characters consistent.",
    images: ["/ai-generated-artistic-image.jpg"],
    creator: "@BananaImage",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LZ0WKG48FM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-LZ0WKG48FM');
          `}
        </Script>
        {children}
        <FeedbackWidget />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
