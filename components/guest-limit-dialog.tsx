"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/google-signin-button"

interface GuestLimitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GuestLimitDialog({ open, onOpenChange }: GuestLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Free limit reached</DialogTitle>
          <DialogDescription>
            You've used your 2 free guest generations. Sign in to get more credits and save your work.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <GoogleSignInButton className="w-full sm:w-auto">
            Sign In / Sign Up
          </GoogleSignInButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
