"use client"

import { useState, useEffect } from "react"
import { useOrgStore } from "@/lib/store"
import { EntityType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTabs,
  DialogTabsList,
  DialogTabTrigger,
  DialogTabContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useNotification } from "@/components/notification-provider"
import { PermissionSelector } from "@/components/permission-selector"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateUserDialog({ isOpen, onClose }: CreateUserDialogProps) {
  const { entities, addEntity } = useOrgStore()
  const { showNotification } = useNotification()
  const [activeTab, setActiveTab] = useState("general")
  const [userId, setUserId] = useState("")

  // Benutzerdetails
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [company, setCompany] = useState("")
  const [manager, setManager] = useState("")
  const [parentId, setParentId] = useState<string | null>(null)
  const [accountEnabled, setAccountEnabled] = useState(true)
  const [passwordNeverExpires, setPasswordNeverExpires] = useState(false)
  const [changePasswordNextLogon, setChangePasswordNextLogon] = useState(true)

  // Organisationsstruktur abrufen
  const companies = entities.filter((entity) => entity.type === EntityType.COMPANY)
  const subcompanies = entities.filter((entity) => entity.type === EntityType.SUBCOMPANY)
  const departments = entities.filter((entity) => entity.type === EntityType.DEPARTMENT)
  const teams = entities.filter((entity) => entity.type === EntityType.TEAM)
  const employees = entities.filter((entity) => entity.type === EntityType.EMPLOYEE)

  // Organisationseinheiten für die Auswahl
  const organizationalUnits = [
    ...companies.map((entity) => ({ id: entity.id, name: entity.name, type: "Unternehmen" })),
    ...subcompanies.map((entity) => {
      const parentCompany = companies.find((c) => c.id === entity.parentId)
      return {
        id: entity.id,
        name: `${entity.name} ${parentCompany ? `(${parentCompany.name})` : ""}`,
        type: "Tochterunternehmen",
      }
    }),
    ...departments.map((entity) => {
      const parentCompany =
        subcompanies.find((c) => c.id === entity.parentId) || companies.find((c) => c.id === entity.parentId)
      return {
        id: entity.id,
        name: `${entity.name} ${parentCompany ? `(${parentCompany.name})` : ""}`,
        type: "Abteilung",
      }
    }),
    ...teams.map((entity) => {
      const parentDept = departments.find((d) => d.id === entity.parentId)
      return {
        id: entity.id,
        name: `${entity.name} ${parentDept ? `(${parentDept.name})` : ""}`,
        type: "Team",
      }
    }),
  ]

  // Wenn sich der Vor- oder Nachname ändert, aktualisiere den Anzeigenamen und Benutzernamen
  useEffect(() => {
    if (firstName && lastName) {
      setDisplayName(`${firstName} ${lastName}`)
      setUsername(firstName.toLowerCase().charAt(0) + lastName.toLowerCase().replace(/\s+/g, ""))
      setEmail(`${username}@example.com`)
    }
  }, [firstName, lastName, username])

  // Formular zurücksetzen
  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setDisplayName("")
    setUsername("")
    setEmail("")
    setPhoneNumber("")
    setJobTitle("")
    setDepartment("")
    setCompany("")
    setManager("")
    setParentId(null)
    setAccountEnabled(true)
    setPasswordNeverExpires(false)
    setChangePasswordNextLogon(true)
    setActiveTab("general")
    setUserId("")
  }

  // Benutzer erstellen
  const handleCreateUser = () => {
    if (!firstName || !lastName || !username || !parentId) {
      showNotification({
        title: "Fehler",
        message: "Bitte füllen Sie alle erforderlichen Felder aus.",
        type: "error",
        duration: 3000,
      })
      return
    }

    const newUserId = crypto.randomUUID()

    // Benutzer erstellen
    addEntity({
      id: newUserId,
      name: displayName,
      type: EntityType.EMPLOYEE,
      parentId,
      role: jobTitle || undefined,
      // Zusätzliche Metadaten können in einem separaten Feld gespeichert werden
      metadata: {
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        department,
        company,
        manager,
        accountEnabled,
        passwordNeverExpires,
        changePasswordNextLogon,
      },
    })

    setUserId(newUserId)

    showNotification({
      title: "Benutzer erstellt",
      message: `${displayName} wurde erfolgreich erstellt.`,
      type: "success",
      duration: 3000,
    })

    // Wenn der Benutzer erstellt wurde, wechsle zum Berechtigungen-Tab
    if (activeTab === "general") {
      setActiveTab("permissions")
    } else {
      // Wenn wir bereits auf dem Berechtigungen-Tab sind, schließe den Dialog
      resetForm()
      onClose()
    }
  }

  // Dialog schließen
  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Benutzer und weisen Sie ihn einer Organisationseinheit zu.
          </DialogDescription>
        </DialogHeader>

        <DialogTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <DialogTabsList className="grid w-full grid-cols-2 mb-4">
            <DialogTabTrigger value="general">Allgemein</DialogTabTrigger>
            <DialogTabTrigger value="permissions" disabled={!userId}>
              Berechtigungen
            </DialogTabTrigger>
          </DialogTabsList>

          <DialogTabContent value="general" className="space-y-4 py-2">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-right">
                    Vorname *
                  </Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-right">
                    Nachname *
                  </Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-right">
                  Anzeigename
                </Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-right">
                    Benutzername *
                  </Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right">
                    E-Mail
                  </Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-right">
                    Telefonnummer
                  </Label>
                  <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-right">
                    Position/Rolle
                  </Label>
                  <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId" className="text-right">
                  Organisationseinheit *
                </Label>
                <Select value={parentId || ""} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Organisationseinheit auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationalUnits.map((ou) => (
                      <SelectItem key={ou.id} value={ou.id}>
                        {ou.name} ({ou.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager" className="text-right">
                  Manager
                </Label>
                <Select value={manager} onValueChange={setManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Manager auswählen (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium">Kontooptionen</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="accountEnabled">Konto aktiviert</Label>
                    <p className="text-xs text-muted-foreground">Benutzer kann sich anmelden</p>
                  </div>
                  <Switch id="accountEnabled" checked={accountEnabled} onCheckedChange={setAccountEnabled} />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="passwordNeverExpires"
                    checked={passwordNeverExpires}
                    onCheckedChange={(checked) => setPasswordNeverExpires(!!checked)}
                  />
                  <Label htmlFor="passwordNeverExpires">Passwort läuft nie ab</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="changePasswordNextLogon"
                    checked={changePasswordNextLogon}
                    onCheckedChange={(checked) => setChangePasswordNextLogon(!!checked)}
                  />
                  <Label htmlFor="changePasswordNextLogon" className="text-sm">
                    Benutzer muss Passwort bei der nächsten Anmeldung ändern
                  </Label>
                </div>
              </div>
            </div>
          </DialogTabContent>

          <DialogTabContent value="permissions">
            {userId && (
              <div className="py-2">
                <PermissionSelector entityId={userId} />
              </div>
            )}
          </DialogTabContent>
        </DialogTabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          {activeTab === "general" ? (
            <Button type="button" onClick={handleCreateUser}>
              Benutzer erstellen
            </Button>
          ) : (
            <Button type="button" onClick={handleClose}>
              Fertigstellen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
