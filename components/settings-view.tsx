"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useOrgStore } from "@/lib/store"
import { resetPermissions } from "@/lib/permissions-db"
import { useTheme } from "next-themes"
import { Save, RotateCcw, Download, Upload, CloudUpload } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { saveSettings, getSettings } from "@/lib/firestore-service"
import { useNotification } from "@/components/notification-provider"

// Interface für die Einstellungen
interface Settings {
  autoSave: boolean
  darkModeDefault: boolean
  showPermissionBadges: boolean
  expandAllByDefault: boolean
}

// Standard-Einstellungen
const defaultSettings: Settings = {
  autoSave: true,
  darkModeDefault: false,
  showPermissionBadges: true,
  expandAllByDefault: false,
}

export function SettingsView() {
  const { entities, initializeFromStorage } = useOrgStore()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isSaved, setIsSaved] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Lade Einstellungen aus Firestore und fallback auf localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (user) {
          // Versuche, Einstellungen aus Firestore zu laden
          const firestoreSettings = await getSettings(user.uid)

          if (firestoreSettings) {
            setSettings(firestoreSettings)

            // Wende das gespeicherte Theme an
            if (firestoreSettings.darkModeDefault) {
              setTheme("dark")
            } else {
              setTheme("light")
            }
            return
          }
        }

        // Fallback auf localStorage, wenn keine Firestore-Einstellungen vorhanden sind
        const storedSettings = localStorage.getItem("adSettings")
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings)
          setSettings(parsedSettings)

          // Wende das gespeicherte Theme an
          if (parsedSettings.darkModeDefault) {
            setTheme("dark")
          } else {
            setTheme("light")
          }

          // Wenn der Benutzer angemeldet ist, synchronisiere die Einstellungen mit Firestore
          if (user) {
            await saveSettings(parsedSettings, user.uid)
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden der Einstellungen:", error)
      }
    }

    loadSettings()
  }, [user, setTheme])

  // Einstellungen ändern
  const handleSettingChange = (key: keyof Settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setIsSaved(false)

    // Spezielle Aktionen für bestimmte Einstellungen
    if (key === "darkModeDefault") {
      setTheme(value ? "dark" : "light")
    }
  }

  // Einstellungen speichern
  const saveSettingsToStorage = async () => {
    try {
      // Speichere in localStorage für Offline-Zugriff
      localStorage.setItem("adSettings", JSON.stringify(settings))

      // Wenn der Benutzer angemeldet ist, speichere auch in Firestore
      if (user) {
        await saveSettings(settings, user.uid)
      }

      setIsSaved(true)
      showNotification({
        title: "Einstellungen gespeichert",
        message: "Ihre Einstellungen wurden erfolgreich gespeichert.",
        type: "success",
        duration: 3000,
      })

      // Zeige die Erfolgsmeldung für 2 Sekunden an
      setTimeout(() => {
        setIsSaved(false)
      }, 2000)
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error)
      showNotification({
        title: "Fehler",
        message: "Beim Speichern der Einstellungen ist ein Fehler aufgetreten.",
        type: "error",
        duration: 3000,
      })
    }
  }

  // Daten exportieren
  const handleExportData = () => {
    const data = {
      entities,
      settings,
      permissions: localStorage.getItem("adPermissions") ? JSON.parse(localStorage.getItem("adPermissions")!) : [],
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `ad-permissions-export-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Daten importieren
  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      if (!target.files?.length) return

      const file = target.files[0]
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          const result = event.target?.result as string
          const data = JSON.parse(result)

          if (data.entities) {
            localStorage.setItem("orgEntities", JSON.stringify(data.entities))
            initializeFromStorage()
          }

          if (data.settings) {
            localStorage.setItem("adSettings", JSON.stringify(data.settings))
            setSettings(data.settings)
            setTheme(data.settings.darkModeDefault ? "dark" : "light")

            // Wenn der Benutzer angemeldet ist, synchronisiere die Einstellungen mit Firestore
            if (user) {
              await saveSettings(data.settings, user.uid)
            }
          }

          if (data.permissions) {
            localStorage.setItem("adPermissions", JSON.stringify(data.permissions))
          }

          showNotification({
            title: "Import erfolgreich",
            message: "Daten wurden erfolgreich importiert.",
            type: "success",
            duration: 3000,
          })
        } catch (error) {
          console.error("Fehler beim Importieren der Daten:", error)
          showNotification({
            title: "Import fehlgeschlagen",
            message: "Beim Importieren der Daten ist ein Fehler aufgetreten.",
            type: "error",
            duration: 3000,
          })
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }

  // Alle Daten zurücksetzen
  const handleResetData = async () => {
    localStorage.removeItem("orgEntities")
    localStorage.removeItem("adSettings")
    localStorage.removeItem("adPermissions")

    resetPermissions()
    initializeFromStorage()
    setSettings(defaultSettings)
    setTheme("light")

    // Wenn der Benutzer angemeldet ist, aktualisiere auch die Firestore-Einstellungen
    if (user) {
      await saveSettings(defaultSettings, user.uid)
    }

    setIsResetDialogOpen(false)
    showNotification({
      title: "Zurückgesetzt",
      message: "Alle Daten wurden zurückgesetzt.",
      type: "success",
      duration: 3000,
    })
  }

  // Synchronisiere Einstellungen mit Firestore
  const syncSettingsWithFirestore = async () => {
    if (!user) {
      showNotification({
        title: "Nicht angemeldet",
        message: "Sie müssen angemeldet sein, um Einstellungen zu synchronisieren.",
        type: "warning",
        duration: 3000,
      })
      return
    }

    setIsSyncing(true)

    try {
      await saveSettings(settings, user.uid)
      showNotification({
        title: "Synchronisiert",
        message: "Einstellungen wurden erfolgreich mit der Cloud synchronisiert.",
        type: "success",
        duration: 3000,
      })
    } catch (error) {
      console.error("Fehler bei der Synchronisierung:", error)
      showNotification({
        title: "Synchronisierungsfehler",
        message: "Bei der Synchronisierung ist ein Fehler aufgetreten.",
        type: "error",
        duration: 3000,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Darstellung</CardTitle>
          <CardDescription>Passen Sie das Erscheinungsbild der Anwendung an.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dunkler Modus</Label>
              <p className="text-sm text-muted-foreground">Standardmäßig dunkles Farbschema verwenden</p>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkModeDefault}
              onCheckedChange={(checked) => handleSettingChange("darkModeDefault", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="permission-badges">Berechtigungs-Badges</Label>
              <p className="text-sm text-muted-foreground">Berechtigungen als Badges in der Baumansicht anzeigen</p>
            </div>
            <Switch
              id="permission-badges"
              checked={settings.showPermissionBadges}
              onCheckedChange={(checked) => handleSettingChange("showPermissionBadges", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="expand-all">Alle Knoten erweitern</Label>
              <p className="text-sm text-muted-foreground">Standardmäßig alle Knoten in der Baumansicht erweitern</p>
            </div>
            <Switch
              id="expand-all"
              checked={settings.expandAllByDefault}
              onCheckedChange={(checked) => handleSettingChange("expandAllByDefault", checked)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Button onClick={saveSettingsToStorage}>
            <Save className="mr-2 h-4 w-4" /> Einstellungen speichern
          </Button>
          {user && (
            <Button variant="outline" onClick={syncSettingsWithFirestore} disabled={isSyncing}>
              <CloudUpload className="mr-2 h-4 w-4" />
              {isSyncing ? "Synchronisiere..." : "Mit Cloud synchronisieren"}
            </Button>
          )}
          {isSaved && (
            <span className="ml-4 text-sm text-green-600 dark:text-green-400">Einstellungen gespeichert!</span>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daten</CardTitle>
          <CardDescription>Verwalten Sie Ihre Daten und Einstellungen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Automatisches Speichern</Label>
              <p className="text-sm text-muted-foreground">Änderungen automatisch im lokalen Speicher sichern</p>
            </div>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" /> Daten exportieren
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="mr-2 h-4 w-4" /> Daten importieren
            </Button>
          </div>
          <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)}>
            <RotateCcw className="mr-2 h-4 w-4" /> Zurücksetzen
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alle Daten zurücksetzen</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion setzt alle Organisationsdaten, Berechtigungen und Einstellungen zurück. Dieser Vorgang kann
              nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Zurücksetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
