"use client"

import type React from "react"

import { useState } from "react"
import { useOrgStore } from "@/lib/store"
import type { Entity } from "@/lib/types"
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
import { Copy } from "lucide-react"

interface CopyUserDialogProps {
  isOpen: boolean
  onClose: () => void
  entity: Entity
}

export function CopyUserDialog({ isOpen, onClose, entity }: CopyUserDialogProps) {
  const { copyUser } = useOrgStore()
  const { showNotification } = useNotification()
  const [name, setName] = useState(`${entity.name} (Kopie)`)
  const [role, setRole] = useState(entity.role || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim()) {
      copyUser(entity.id, {
        name: name.trim(),
        role: role.trim() || undefined,
      })

      showNotification({
        title: "Benutzer kopiert",
        message: `Benutzer "${entity.name}" wurde als "${name.trim()}" kopiert.`,
        type: "success",
        duration: 3000,
      })

      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Benutzer kopieren</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine Kopie von {entity.name} mit allen zugewiesenen Berechtigungen.
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">
              <Copy className="mr-2 h-4 w-4" />
              Kopieren
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
