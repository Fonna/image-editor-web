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

interface GuestWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: () => void
}

export function GuestWarningDialog({ open, onOpenChange, onContinue }: GuestWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Guest Mode</DialogTitle>
          <DialogDescription>
            You are currently using Guest Mode. You have 2 free generations available.
            <br />
            Sign in now to save your work and access more features.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={onContinue}>
            Continue as Guest
          </Button>
          <GoogleSignInButton className="w-full sm:w-auto">
            Sign In / Sign Up
          </GoogleSignInButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
