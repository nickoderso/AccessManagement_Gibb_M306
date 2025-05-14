"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNotification } from "@/components/notification-provider"
import Link from "next/link"

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fallback notification function if provider is not available
  const useNotificationFallback = () => {
    return {
      showNotification: (notification: any) => {
        console.log("Notification (fallback):", notification)
      },
    }
  }

  // Try to use the notification context, fall back to dummy implementation if not available
  const notificationContext = useNotification() || useNotificationFallback()
  const { showNotification } = notificationContext

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Passwort-Validierung
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.")
      return
    }

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.")
      return
    }

    setIsLoading(true)

    try {
      // Benutzer erstellen
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Anzeigename aktualisieren
      await updateProfile(user, { displayName })

      // Benutzerdaten in Firestore speichern
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email,
        createdAt: new Date().toISOString(),
        role: "user", // Standardrolle
      })

      showNotification({
        title: "Registrierung erfolgreich",
        message: "Ihr Konto wurde erfolgreich erstellt.",
        type: "success",
        duration: 3000,
      })

      // Weiterleitung zum Dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)
      let errorMessage = "Bei der Registrierung ist ein Fehler aufgetreten."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Diese E-Mail-Adresse wird bereits verwendet."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Ungültige E-Mail-Adresse."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Das Passwort ist zu schwach."
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registrieren</CardTitle>
        <CardDescription>Erstellen Sie ein neues Konto</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              placeholder="Max Mustermann"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registrierung läuft..." : "Registrieren"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Bereits registriert?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Anmelden
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
