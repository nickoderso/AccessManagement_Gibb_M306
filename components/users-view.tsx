"use client"

import { useState } from "react"
import { useOrgStore } from "@/lib/store"
import { type Entity, EntityType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { EditEntityDialog } from "@/components/edit-entity-dialog"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { User, Edit, Trash2, Shield, Copy, UserPlus } from "lucide-react"
import { CopyUserDialog } from "@/components/copy-user-dialog"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { getAllPermissions } from "@/lib/permissions-db"

interface UsersViewProps {
  searchTerm: string
}

export function UsersView({ searchTerm }: UsersViewProps) {
  const { entities, getEntityPermissions } = useOrgStore()
  const [editEntity, setEditEntity] = useState<Entity | null>(null)
  const [deleteEntity, setDeleteEntity] = useState<Entity | null>(null)
  const [copyEntity, setCopyEntity] = useState<Entity | null>(null)
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)

  // Alle Berechtigungen abrufen
  const allPermissions = getAllPermissions()

  // Nur Mitarbeiter filtern
  const employees = entities.filter((entity) => entity.type === EntityType.EMPLOYEE)

  // Nach Suchbegriff filtern
  const filteredEmployees = searchTerm
    ? employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (employee.role && employee.role.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : employees

  // Berechtigungen für einen Benutzer abrufen
  const getPermissionNames = (entityId: string): string[] => {
    const permissionIds = getEntityPermissions(entityId)
    return permissionIds
      .map((id) => {
        const permission = allPermissions.find((p) => p.id === id)
        return permission ? permission.name : ""
      })
      .filter(Boolean)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Benutzer verwalten</h3>
        <Button onClick={() => setIsCreateUserDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
          <UserPlus className="mr-2 h-4 w-4" /> Neuen Benutzer erstellen
        </Button>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Benutzer gefunden</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm
              ? `Keine Ergebnisse für "${searchTerm}" gefunden.`
              : "Fügen Sie Mitarbeiter in der Organisationsstruktur hinzu."}
          </p>
          <Button onClick={() => setIsCreateUserDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
            <UserPlus className="mr-2 h-4 w-4" /> Neuen Benutzer erstellen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => {
            const permissions = getPermissionNames(employee.id)

            return (
              <div key={employee.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-medium">{employee.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditEntity(employee)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bearbeiten</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCopyEntity(employee)}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Kopieren</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => setDeleteEntity(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Löschen</span>
                    </Button>
                  </div>
                </div>

                {employee.role && (
                  <div className="mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(employee.role)}`}>
                      {employee.role}
                    </span>
                  </div>
                )}

                <div className="mt-3">
                  <div className="flex items-center mb-1">
                    <Shield className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm font-medium">Berechtigungen:</span>
                  </div>
                  {permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Keine Berechtigungen zugewiesen</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editEntity && <EditEntityDialog isOpen={!!editEntity} onClose={() => setEditEntity(null)} entity={editEntity} />}

      {deleteEntity && (
        <DeleteEntityDialog isOpen={!!deleteEntity} onClose={() => setDeleteEntity(null)} entity={deleteEntity} />
      )}

      {copyEntity && <CopyUserDialog isOpen={!!copyEntity} onClose={() => setCopyEntity(null)} entity={copyEntity} />}

      <CreateUserDialog isOpen={isCreateUserDialogOpen} onClose={() => setIsCreateUserDialogOpen(false)} />
    </div>
  )
}

function getRoleBadgeColor(role: string): string {
  if (role.includes("Admin")) {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  } else if (role.includes("Manager")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  } else if (role.includes("Leiter")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  } else {
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  }
}
