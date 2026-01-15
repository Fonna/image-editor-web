"use client"

import { useEffect, useState } from "react"
import { Coins } from "lucide-react"

export function DashboardCredits() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/user/credits")
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits)
      }
    } catch (error) {
      console.error("Failed to fetch credits", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()

    const handleCreditUpdate = () => {
      fetchCredits()
    }

    window.addEventListener("credits-updated", handleCreditUpdate)

    return () => {
      window.removeEventListener("credits-updated", handleCreditUpdate)
    }
  }, [])

  if (loading && credits === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border animate-pulse">
        <Coins className="h-4 w-4 text-muted-foreground" />
        <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border">
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-medium">
        {credits !== null ? `${credits} Credits` : "0 Credits"}
      </span>
    </div>
  )
}
