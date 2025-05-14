"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useOrgStore } from "@/lib/store"
import { type Entity, EntityType } from "@/lib/types"
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
import { PermissionSelector } from "@/components/permission-selector"

// Füge den Import für useNotification hinzu
import { useNotification } from "@/components/notification-provider"

interface EditEntityDialogProps {
  isOpen: boolean
  onClose: () => void
  entity: Entity
}

export function EditEntityDialog({ isOpen, onClose, entity }: EditEntityDialogProps) {
  const { updateEntity } = useOrgStore()
  const [name, setName] = useState(entity.name)
  const [role, setRole] = useState(entity.role || "")
  const [activeTab, setActiveTab] = useState("details")

  // Füge den Hook in der Komponente hinzu
  const { showNotification } = useNotification()

  useEffect(() => {
    if (isOpen) {
      setName(entity.name)
      setRole(entity.role || "")
      setActiveTab("details")
    }
  }, [isOpen, entity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim()) {
      updateEntity({
        ...entity,
        name: name.trim(),
        role: role.trim() || undefined,
      })

      // Suche nach der handleSubmit-Funktion und füge am Ende vor dem onClose() hinzu:
      showNotification({
        title: `${getEntityTypeName()} aktualisiert`,
        message: `${name.trim()} wurde erfolgreich aktualisiert.`,
        type: "success",
        duration: 3000,
      })

      onClose()
    }
  }

  const getEntityTypeName = (): string => {
    switch (entity.type) {
      case EntityType.COMPANY:
        return "Unternehmen"
      case EntityType.SUBCOMPANY:
        return "Tochterunternehmen"
      case EntityType.DEPARTMENT:
        return "Abteilung"
      case EntityType.TEAM:
        return "Team"
      case EntityType.EMPLOYEE:
        return "Mitarbeiter"
      default:
        return ""
    }
  }

  const showRoleField = entity.type === EntityType.EMPLOYEE
  const showPermissionsTab = entity.type === EntityType.EMPLOYEE

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getEntityTypeName()} bearbeiten</DialogTitle>
          <DialogDescription>Bearbeiten Sie die Details für {entity.name}.</DialogDescription>
        </DialogHeader>

        {showPermissionsTab ? (
          <div className="py-4">
            <DialogTabs value={activeTab} onValueChange={setActiveTab}>
              <DialogTabsList className="grid w-full grid-cols-2">
                <DialogTabTrigger value="details">Details</DialogTabTrigger>
                <DialogTabTrigger value="permissions">Berechtigungen</DialogTabTrigger>
              </DialogTabsList>

              <DialogTabContent value="details">
                <form id="edit-form" onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="col-span-3"
                        autoFocus
                        required
                      />
                    </div>

                    {showRoleField && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Rolle
                        </Label>
                        <Input
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="col-span-3"
                          placeholder="z.B. Administrator, Benutzer, etc."
                        />
                      </div>
                    )}
                  </div>
                </form>
              </DialogTabContent>

              <DialogTabContent value="permissions">
                <div className="py-4">
                  <PermissionSelector entityId={entity.id} />
                </div>
              </DialogTabContent>
            </DialogTabs>
          </div>
        ) : (
          <form id="edit-form" onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                  required
                />
              </div>
            </div>
          </form>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          {activeTab === "details" && (
            <Button type="submit" form="edit-form">
              Speichern
            </Button>
          )}
          {activeTab === "permissions" && (
            <Button type="button" onClick={onClose}>
              Schließen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
