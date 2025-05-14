"use client"

import { useState, useEffect } from "react"
import {
  getAllPermissions,
  type Permission,
  PermissionCategory,
  addPermission as addPermissionToDb,
  updatePermission,
  deletePermission,
} from "@/lib/permissions-db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Search, X, Shield } from "lucide-react"

interface PermissionsViewProps {
  searchTerm: string
}

// Dummy components to resolve the undeclared variable errors
const PermissionTemplates = () => <div>PermissionTemplates Component</div>
const PermissionComparison = () => <div>PermissionComparison Component</div>
const PermissionAudit = () => <div>PermissionAudit Component</div>

export function PermissionsView({ searchTerm }: PermissionsViewProps) {
  const [permissions, setPermissions] = useState<Permission[]>(getAllPermissions())
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [newPermission, setNewPermission] = useState<{
    name: string
    description: string
    category: PermissionCategory
  }>({
    name: "",
    description: "",
    category: PermissionCategory.SYSTEM,
  })

  // Aktualisieren Sie die useEffect-Abhängigkeiten, um auf Änderungen des searchTerm-Props zu reagieren
  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  // Filtere Berechtigungen basierend auf Suchbegriff und Kategorie
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      localSearchTerm === "" ||
      permission.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(localSearchTerm.toLowerCase())

    const matchesCategory = activeTab === "all" || permission.category === activeTab

    return matchesSearch && matchesCategory
  })

  // Neue Berechtigung hinzufügen
  const handleAddPermission = () => {
    if (newPermission.name.trim() === "") return

    const addedPermission = addPermissionToDb({
      name: newPermission.name,
      description: newPermission.description,
      category: newPermission.category,
    })

    setPermissions(getAllPermissions())

    setNewPermission({
      name: "",
      description: "",
      category: PermissionCategory.SYSTEM,
    })

    setIsAddDialogOpen(false)
  }

  // Berechtigung bearbeiten
  const handleEditPermission = () => {
    if (!currentPermission || currentPermission.name.trim() === "") return

    updatePermission(currentPermission)
    setPermissions(getAllPermissions())
    setIsEditDialogOpen(false)
  }

  // Berechtigung löschen
  const handleDeletePermission = () => {
    if (!currentPermission) return

    deletePermission(currentPermission.id)
    setPermissions(getAllPermissions())
    setIsDeleteDialogOpen(false)
  }

  // Kategorie-Namen abrufen
  const getCategoryName = (category: PermissionCategory): string => {
    switch (category) {
      case PermissionCategory.SYSTEM:
        return "System"
      case PermissionCategory.FILE:
        return "Datei"
      case PermissionCategory.USER:
        return "Benutzer"
      case PermissionCategory.NETWORK:
        return "Netzwerk"
      case PermissionCategory.APPLICATION:
        return "Anwendung"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">Berechtigungen verwalten</h3>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Neue Berechtigung
        </Button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Berechtigungen durchsuchen..."
          className="pl-10 pr-10"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        {localSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setLocalSearchTerm("")}
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value={PermissionCategory.SYSTEM}>System</TabsTrigger>
          <TabsTrigger value={PermissionCategory.FILE}>Datei</TabsTrigger>
          <TabsTrigger value={PermissionCategory.USER}>Benutzer</TabsTrigger>
          <TabsTrigger value={PermissionCategory.NETWORK}>Netzwerk</TabsTrigger>
          <TabsTrigger value={PermissionCategory.APPLICATION}>Anwendung</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {activeTab === "tools" ? (
            <div className="space-y-6">
              <PermissionTemplates />
              <PermissionComparison />
              <PermissionAudit />
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Keine Berechtigungen gefunden.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPermissions.map((permission) => (
                <Card key={permission.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{permission.name}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setCurrentPermission(permission)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => {
                            setCurrentPermission(permission)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{permission.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {getCategoryName(permission.category)}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog zum Hinzufügen einer neuen Berechtigung */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Berechtigung hinzufügen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Berechtigung, die Benutzern zugewiesen werden kann.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPermission.name}
                onChange={(e) => setNewPermission((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Beschreibung
              </Label>
              <Textarea
                id="description"
                value={newPermission.description}
                onChange={(e) => setNewPermission((prev) => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Kategorie
              </Label>
              <Select
                value={newPermission.category}
                onValueChange={(value) =>
                  setNewPermission((prev) => ({
                    ...prev,
                    category: value as PermissionCategory,
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PermissionCategory.SYSTEM}>System</SelectItem>
                  <SelectItem value={PermissionCategory.FILE}>Datei</SelectItem>
                  <SelectItem value={PermissionCategory.USER}>Benutzer</SelectItem>
                  <SelectItem value={PermissionCategory.NETWORK}>Netzwerk</SelectItem>
                  <SelectItem value={PermissionCategory.APPLICATION}>Anwendung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" onClick={handleAddPermission} disabled={!newPermission.name.trim()}>
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zum Bearbeiten einer Berechtigung */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Berechtigung bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die Details der Berechtigung.</DialogDescription>
          </DialogHeader>

          {currentPermission && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={currentPermission.name}
                  onChange={(e) => setCurrentPermission({ ...currentPermission, name: e.target.value })}
                  className="col-span-3"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Beschreibung
                </Label>
                <Textarea
                  id="edit-description"
                  value={currentPermission.description}
                  onChange={(e) => setCurrentPermission({ ...currentPermission, description: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Kategorie
                </Label>
                <Select
                  value={currentPermission.category}
                  onValueChange={(value) =>
                    setCurrentPermission({
                      ...currentPermission,
                      category: value as PermissionCategory,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PermissionCategory.SYSTEM}>System</SelectItem>
                    <SelectItem value={PermissionCategory.FILE}>Datei</SelectItem>
                    <SelectItem value={PermissionCategory.USER}>Benutzer</SelectItem>
                    <SelectItem value={PermissionCategory.NETWORK}>Netzwerk</SelectItem>
                    <SelectItem value={PermissionCategory.APPLICATION}>Anwendung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" onClick={handleEditPermission} disabled={!currentPermission?.name.trim()}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zum Löschen einer Berechtigung */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Berechtigung löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Berechtigung löschen möchten? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
