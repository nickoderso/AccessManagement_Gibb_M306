"use client"

import type React from "react"

import { useState } from "react"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotification } from "@/components/notification-provider"

interface AddEntityDialogProps {
  isOpen: boolean
  onClose: () => void
  entityType: EntityType
  parentId: string | null
}

export function AddEntityDialog({ isOpen, onClose, entityType, parentId }: AddEntityDialogProps) {
  const { addEntity } = useOrgStore()
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const { showNotification } = useNotification()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim()) {
      addEntity({
        id: crypto.randomUUID(),
        name: name.trim(),
        type: entityType,
        parentId,
        role: role.trim() || undefined,
      })

      setName("")
      setRole("")

      showNotification({
        title: `${getEntityTypeName()} hinzugefügt`,
        message: `${name.trim()} wurde erfolgreich hinzugefügt.`,
        type: "success",
        duration: 3000,
      })

      onClose()
    }
  }

  const getEntityTypeName = (): string => {
    switch (entityType) {
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

  const showRoleField = entityType === EntityType.EMPLOYEE

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getEntityTypeName()} hinzufügen</DialogTitle>
          <DialogDescription>
            Geben Sie die Details für das neue {getEntityTypeName().toLowerCase()} ein.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">Hinzufügen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
