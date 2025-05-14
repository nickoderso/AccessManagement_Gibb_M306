"use client"

import type React from "react"

import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNotification } from "@/components/notification-provider"
import Link from "next/link"

export function ResetPasswordForm() {
  // Fallback notification function if provider is not available
  const useNotificationFallback = () => {
    return {
      showNotification: (notification: any) => {
        console.log("Notification (fallback):", notification)
      },
    }
  }

  // Try to use the notification context, fall back to dummy implementation if not available
  let notificationContext
  try {
    notificationContext = useNotification()
  } catch (e) {
    notificationContext = useNotificationFallback()
  }
  const { showNotification } = notificationContext

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setIsSuccess(true)
      showNotification({
        title: "E-Mail gesendet",
        message: "Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.",
        type: "success",
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      let errorMessage = "Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten."

      if (error.code === "auth/user-not-found") {
        errorMessage = "Es wurde kein Benutzer mit dieser E-Mail-Adresse gefunden."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Ungültige E-Mail-Adresse."
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Passwort zurücksetzen</CardTitle>
        <CardDescription>
          Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen Ihres Passworts zu erhalten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <Alert>
            <AlertDescription>
              Eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts wurde an {email} gesendet. Bitte überprüfen
              Sie Ihren Posteingang und folgen Sie den Anweisungen in der E-Mail.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Wird gesendet..." : "Passwort zurücksetzen"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Zurück zur Anmeldung
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
