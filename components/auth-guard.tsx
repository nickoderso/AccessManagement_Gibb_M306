"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

// Pfade, die ohne Authentifizierung zugänglich sind
const publicPaths = ["/login", "/register", "/reset-password"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Warte, bis der Authentifizierungsstatus geladen ist
    if (loading) return

    // Speichere den aktuellen Benutzer im localStorage für den Zustand-Store
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
    } else {
      localStorage.removeItem("currentUser")
    }

    // Überprüfe, ob der Benutzer authentifiziert ist und leite entsprechend weiter
    const isPublicPath = publicPaths.includes(pathname)

    if (!user && !isPublicPath) {
      // Nicht authentifiziert und kein öffentlicher Pfad -> zur Anmeldeseite
      router.push("/login")
    } else if (user && isPublicPath) {
      // Authentifiziert und öffentlicher Pfad -> zum Dashboard
      router.push("/dashboard")
    }
  }, [user, loading, pathname, router])

  // Zeige eine Ladeanimation, während der Authentifizierungsstatus überprüft wird
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Wenn der Benutzer auf einem öffentlichen Pfad ist oder authentifiziert ist, zeige den Inhalt
  if (publicPaths.includes(pathname) || user) {
    return <>{children}</>
  }

  // Ansonsten zeige nichts (wird zur Anmeldeseite weitergeleitet)
  return null
}
