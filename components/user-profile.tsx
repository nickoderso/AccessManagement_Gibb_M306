"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotification } from "@/components/notification-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Key, Mail, Shield, User } from "lucide-react"

export function UserProfile() {
  const { user, setUser } = useAuth()
  const { showNotification } = useNotification()
  const [activeTab, setActiveTab] = useState("profile")

  // Profilformular
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // E-Mail-Formular
  const [newEmail, setNewEmail] = useState(user?.email || "")
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("")
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Passwortformular
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Benutzerinformationen
  const [lastLogin, setLastLogin] = useState<string>("Wird geladen...")
  const [accountCreated, setAccountCreated] = useState<string>("Wird geladen...")

  useEffect(() => {
    if (auth.currentUser) {
      const metadata = auth.currentUser.metadata

      // Formatiere das Datum für die letzte Anmeldung
      if (metadata.lastSignInTime) {
        const lastLoginDate = new Date(metadata.lastSignInTime)
        setLastLogin(formatDate(lastLoginDate))
      } else {
        setLastLogin("Unbekannt")
      }

      // Formatiere das Datum für die Kontoerstellung
      if (metadata.creationTime) {
        const creationDate = new Date(metadata.creationTime)
        setAccountCreated(formatDate(creationDate))
      } else {
        setAccountCreated("Unbekannt")
      }
    }
  }, [])

  // Funktion zum Formatieren des Datums
  const formatDate = (date: Date): string => {
    return date
      .toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " um")
  }

  // Profil aktualisieren
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setIsUpdatingProfile(true)

    try {
      if (!auth.currentUser) throw new Error("Nicht authentifiziert")

      await updateProfile(auth.currentUser, { displayName })

      // Aktualisiere den Benutzer im Kontext
      if (user) {
        setUser({
          ...user,
          displayName,
        })
      }

      showNotification({
        title: "Profil aktualisiert",
        message: "Ihr Profil wurde erfolgreich aktualisiert.",
        type: "success",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setProfileError("Beim Aktualisieren des Profils ist ein Fehler aufgetreten.")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // E-Mail aktualisieren
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setIsUpdatingEmail(true)

    try {
      if (!auth.currentUser) throw new Error("Nicht authentifiziert")

      // Reautentifizierung erforderlich für sensible Operationen
      const credential = EmailAuthProvider.credential(user?.email || "", currentPasswordForEmail)

      await reauthenticateWithCredential(auth.currentUser, credential)
      await updateEmail(auth.currentUser, newEmail)

      // Aktualisiere den Benutzer im Kontext
      if (user) {
        setUser({
          ...user,
          email: newEmail,
        })
      }

      setCurrentPasswordForEmail("")

      showNotification({
        title: "E-Mail aktualisiert",
        message: "Ihre E-Mail-Adresse wurde erfolgreich aktualisiert.",
        type: "success",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error updating email:", error)

      if (error.code === "auth/wrong-password") {
        setEmailError("Das eingegebene Passwort ist falsch.")
      } else if (error.code === "auth/email-already-in-use") {
        setEmailError("Diese E-Mail-Adresse wird bereits verwendet.")
      } else {
        setEmailError("Beim Aktualisieren der E-Mail-Adresse ist ein Fehler aufgetreten.")
      }
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Passwort aktualisieren
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    // Passwort-Validierung
    if (newPassword !== confirmPassword) {
      setPasswordError("Die Passwörter stimmen nicht überein.")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Das neue Passwort muss mindestens 6 Zeichen lang sein.")
      return
    }

    setIsUpdatingPassword(true)

    try {
      if (!auth.currentUser) throw new Error("Nicht authentifiziert")

      // Reautentifizierung erforderlich für sensible Operationen
      const credential = EmailAuthProvider.credential(user?.email || "", currentPassword)

      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPassword)

      // Formular zurücksetzen
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      showNotification({
        title: "Passwort aktualisiert",
        message: "Ihr Passwort wurde erfolgreich aktualisiert.",
        type: "success",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error updating password:", error)

      if (error.code === "auth/wrong-password") {
        setPasswordError("Das aktuelle Passwort ist falsch.")
      } else {
        setPasswordError("Beim Aktualisieren des Passworts ist ein Fehler aufgetreten.")
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Generiere den ersten Buchstaben für Avatar
  const getFirstLetter = () => {
    if (user?.displayName && user.displayName.trim() !== "") {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "?"
  }

  // Formatiere die Benutzer-ID für bessere Lesbarkeit
  const formatUserId = (uid: string) => {
    if (uid.length > 12) {
      return `${uid.substring(0, 6)}...${uid.substring(uid.length - 6)}`
    }
    return uid
  }

  if (!user) {
    return <div>Nicht angemeldet</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Linke Spalte - Profilübersicht */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-3xl bg-blue-600 text-white">{getFirstLetter()}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user.displayName || "Kein Name"}</CardTitle>
              <CardDescription className="text-sm">{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-2 py-1">
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    Benutzer
                  </Badge>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-3">
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Benutzer-ID:</span>
                    </div>
                    <div className="mt-1 font-mono text-xs bg-muted p-1.5 rounded-md overflow-x-auto" title={user.uid}>
                      {user.uid}
                    </div>
                  </div>

                  <div className="flex flex-col text-sm">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Konto erstellt:</span>
                    </div>
                    <div className="mt-1 font-medium">{accountCreated}</div>
                  </div>

                  <div className="flex flex-col text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Letzte Anmeldung:</span>
                    </div>
                    <div className="mt-1 font-medium">{lastLogin}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Sicherheitshinweise</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Key className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span>Ändern Sie Ihr Passwort regelmäßig, um die Sicherheit Ihres Kontos zu gewährleisten.</span>
                </li>
                <li className="flex items-start">
                  <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span>Halten Sie Ihre E-Mail-Adresse aktuell, um wichtige Benachrichtigungen zu erhalten.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte - Einstellungen */}
        <div className="w-full md:w-2/3">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Kontoeinstellungen</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre persönlichen Informationen und Sicherheitseinstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="email">E-Mail</TabsTrigger>
                  <TabsTrigger value="password">Passwort</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {profileError && (
                      <Alert variant="destructive">
                        <AlertDescription>{profileError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="displayName">Anzeigename</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="max-w-md"
                        required
                      />
                      <p className="text-sm text-muted-foreground">Dieser Name wird in der Anwendung angezeigt.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>E-Mail-Adresse</Label>
                      <div className="p-2 border rounded-md bg-muted max-w-md">{user.email}</div>
                      <p className="text-sm text-muted-foreground">
                        Um Ihre E-Mail-Adresse zu ändern, wechseln Sie zum Tab "E-Mail".
                      </p>
                    </div>

                    <Button type="submit" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? "Wird aktualisiert..." : "Profil aktualisieren"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="email" className="mt-6">
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    {emailError && (
                      <Alert variant="destructive">
                        <AlertDescription>{emailError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="currentEmail">Aktuelle E-Mail-Adresse</Label>
                      <div className="p-2 border rounded-md bg-muted max-w-md">{user.email}</div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newEmail">Neue E-Mail-Adresse</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="max-w-md"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPasswordForEmail">Aktuelles Passwort</Label>
                      <Input
                        id="currentPasswordForEmail"
                        type="password"
                        value={currentPasswordForEmail}
                        onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                        className="max-w-md"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Aus Sicherheitsgründen müssen Sie Ihr aktuelles Passwort eingeben.
                      </p>
                    </div>

                    <Button type="submit" disabled={isUpdatingEmail}>
                      {isUpdatingEmail ? "Wird aktualisiert..." : "E-Mail aktualisieren"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="mt-6">
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="max-w-md"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Neues Passwort</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="max-w-md"
                        required
                      />
                      <p className="text-sm text-muted-foreground">Das Passwort muss mindestens 6 Zeichen lang sein.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="max-w-md"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? "Wird aktualisiert..." : "Passwort aktualisieren"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
