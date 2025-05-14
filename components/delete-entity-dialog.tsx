"use client"

import { useOrgStore } from "@/lib/store"
import { type Entity, EntityType } from "@/lib/types"
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
import { useNotification } from "@/components/notification-provider"

interface DeleteEntityDialogProps {
  isOpen: boolean
  onClose: () => void
  entity: Entity
}

export function DeleteEntityDialog({ isOpen, onClose, entity }: DeleteEntityDialogProps) {
  const { deleteEntity, getChildrenOf } = useOrgStore()
  const { showNotification } = useNotification()

  const children = getChildrenOf(entity.id)
  const hasChildren = children.length > 0

  const handleDelete = () => {
    deleteEntity(entity.id)
    showNotification({
      title: `${getEntityTypeName()} gelöscht`,
      message: `${entity.name} wurde erfolgreich gelöscht.`,
      type: "warning",
      duration: 3000,
    })
    onClose()
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

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getEntityTypeName()} löschen</AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie {entity.name} löschen möchten?
            {hasChildren && (
              <span className="block mt-2 font-semibold text-destructive">
                Warnung: Alle untergeordneten Elemente werden ebenfalls gelöscht!
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
