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
import { useEffect, Suspense, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  created_at: string
  plan_id: string
  amount: number
  currency: string
  status: string
  credits_added: number
}

function BillingContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for success param
    if (searchParams.get("success") === "true") {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! Your credits have been updated.",
      })
      const url = new URL(window.location.href)
      url.searchParams.delete("success")
      window.history.replaceState({}, "", url)
    }

    // Fetch transactions
    const fetchHistory = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching transactions:', error)
        } else {
          setTransactions(data || [])
        }
      } catch (err) {
        console.error('Failed to fetch transactions', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
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
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell className="text-center py-8" colSpan={5}>
                    Loading history...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8 text-muted-foreground" colSpan={5}>
                    No recharge records found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      {new Date(txn.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{txn.plan_id}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: txn.currency || 'USD'
                      }).format(txn.amount)}
                    </TableCell>
                    <TableCell>+{txn.credits_added}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
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