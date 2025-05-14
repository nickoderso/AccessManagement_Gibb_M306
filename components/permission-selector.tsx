"use client"

import { useState, useEffect } from "react"
import { useOrgStore } from "@/lib/store"
import {
  getAllPermissions,
  type Permission,
  PermissionCategory,
  addPermission as addPermissionToDb,
} from "@/lib/permissions-db"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, X } from "lucide-react"

interface PermissionSelectorProps {
  entityId: string
}

export function PermissionSelector({ entityId }: PermissionSelectorProps) {
  const { addPermissionToEntity, removePermissionFromEntity, getEntityPermissions } = useOrgStore()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>(PermissionCategory.SYSTEM)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPermission, setNewPermission] = useState<{
    name: string
    description: string
    category: PermissionCategory
  }>({
    name: "",
    description: "",
    category: PermissionCategory.SYSTEM,
  })

  // Lade Berechtigungen und ausgewählte Berechtigungen
  useEffect(() => {
    setPermissions(getAllPermissions())
    setSelectedPermissions(getEntityPermissions(entityId))
  }, [entityId, getEntityPermissions])

  // Filtere Berechtigungen basierend auf Suchbegriff und Kategorie
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      searchTerm === "" ||
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = activeTab === "all" || permission.category === activeTab

    return matchesSearch && matchesCategory
  })

  // Berechtigung hinzufügen oder entfernen
  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      removePermissionFromEntity(entityId, permissionId)
      setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId))
    } else {
      addPermissionToEntity(entityId, permissionId)
      setSelectedPermissions((prev) => [...prev, permissionId])
    }
  }

  // Neue Berechtigung hinzufügen
  const handleAddPermission = () => {
    if (newPermission.name.trim() === "") return

    const addedPermission = addPermissionToDb({
      name: newPermission.name,
      description: newPermission.description,
      category: newPermission.category,
    })

    // Füge die neue Berechtigung zur Liste hinzu
    setPermissions((prev) => [...prev, addedPermission])

    // Füge die neue Berechtigung dem Benutzer hinzu
    addPermissionToEntity(entityId, addedPermission.id)
    setSelectedPermissions((prev) => [...prev, addedPermission.id])

    // Formular zurücksetzen
    setNewPermission({
      name: "",
      description: "",
      category: PermissionCategory.SYSTEM,
    })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Berechtigungen verwalten</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" /> Neue Berechtigung
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-4">
          <h4 className="font-medium mb-3">Neue Berechtigung hinzufügen</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-permission-name">Name</Label>
              <Input
                id="new-permission-name"
                value={newPermission.name}
                onChange={(e) => setNewPermission((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name der Berechtigung"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-permission-description">Beschreibung</Label>
              <Textarea
                id="new-permission-description"
                value={newPermission.description}
                onChange={(e) => setNewPermission((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibung der Berechtigung"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-permission-category">Kategorie</Label>
              <Select
                value={newPermission.category}
                onValueChange={(value) =>
                  setNewPermission((prev) => ({
                    ...prev,
                    category: value as PermissionCategory,
                  }))
                }
              >
                <SelectTrigger className="mt-1">
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
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleAddPermission} disabled={!newPermission.name.trim()}>
                Hinzufügen
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Berechtigungen durchsuchen..."
          className="pl-10 pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        )}
      </div>

      <Tabs defaultValue={PermissionCategory.SYSTEM} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value={PermissionCategory.SYSTEM}>System</TabsTrigger>
          <TabsTrigger value={PermissionCategory.FILE}>Datei</TabsTrigger>
          <TabsTrigger value={PermissionCategory.USER}>Benutzer</TabsTrigger>
          <TabsTrigger value={PermissionCategory.NETWORK}>Netzwerk</TabsTrigger>
          <TabsTrigger value={PermissionCategory.APPLICATION}>Anwendung</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Keine Berechtigungen gefunden.</div>
          ) : (
            <div className="space-y-2">
              {filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => togglePermission(permission.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`permission-${permission.id}`} className="font-medium cursor-pointer">
                      {permission.name}
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
