"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { useToast } from "@/hooks/use-toast"

function BillingContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! Your credits have been updated.",
      })
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete("success")
      window.history.replaceState({}, "", url)
    }
  }, [searchParams, toast])

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">Billing & Usage</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recharge History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-center py-8 text-muted-foreground" colSpan={4}>
                  No recharge records found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingContent />
    </Suspense>
  )
}