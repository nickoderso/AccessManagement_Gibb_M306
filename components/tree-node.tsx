"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useOrgStore } from "@/lib/store"
import { type Entity, EntityType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  Building,
  Building2,
  Briefcase,
  User,
  Shield,
  Copy,
} from "lucide-react"
import { AddEntityDialog } from "@/components/add-entity-dialog"
import { EditEntityDialog } from "@/components/edit-entity-dialog"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAllPermissions } from "@/lib/permissions-db"
import { CopyUserDialog } from "@/components/copy-user-dialog"

interface TreeNodeProps {
  entity: Entity
  level: number
}

export function TreeNode({ entity, level }: TreeNodeProps) {
  const { getChildrenOf, moveEntity, getEntityPermissions } = useOrgStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  // Lade Einstellungen aus dem localStorage
  const [showPermissionBadges, setShowPermissionBadges] = useState(true)
  const [expandAllByDefault, setExpandAllByDefault] = useState(false)

  useEffect(() => {
    // Lade Einstellungen aus dem localStorage
    const loadSettings = () => {
      const storedSettings = localStorage.getItem("adSettings")
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings)
        setShowPermissionBadges(parsedSettings.showPermissionBadges)
        setExpandAllByDefault(parsedSettings.expandAllByDefault)
      }
    }

    loadSettings()

    // Setze isExpanded basierend auf der Einstellung
    if (expandAllByDefault) {
      setIsExpanded(true)
    }
  }, [expandAllByDefault])

  const children = getChildrenOf(entity.id)
  const hasChildren = children.length > 0

  // Berechtigungen für Mitarbeiter abrufen
  const permissions = entity.type === EntityType.EMPLOYEE ? getEntityPermissions(entity.id) : []
  const allPermissions = getAllPermissions()

  // Berechtigungsnamen abrufen
  const getPermissionNames = (): string[] => {
    return permissions
      .map((id) => {
        const permission = allPermissions.find((p) => p.id === id)
        return permission ? permission.name : ""
      })
      .filter(Boolean)
  }

  const permissionNames = getPermissionNames()

  const getNextEntityType = (): EntityType => {
    switch (entity.type) {
      case EntityType.COMPANY:
        return EntityType.SUBCOMPANY
      case EntityType.SUBCOMPANY:
        return EntityType.DEPARTMENT
      case EntityType.DEPARTMENT:
        return EntityType.TEAM
      case EntityType.TEAM:
        return EntityType.EMPLOYEE
      default:
        return EntityType.EMPLOYEE
    }
  }

  const getEntityIcon = () => {
    switch (entity.type) {
      case EntityType.COMPANY:
        return <Building className="h-5 w-5 text-primary" />
      case EntityType.SUBCOMPANY:
        return <Building2 className="h-5 w-5 text-blue-600" />
      case EntityType.DEPARTMENT:
        return <Briefcase className="h-5 w-5 text-purple-600" />
      case EntityType.TEAM:
        return <Users className="h-5 w-5 text-orange-600" />
      case EntityType.EMPLOYEE:
        return <User className="h-5 w-5 text-gray-600" />
      default:
        return null
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", entity.id)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (entity.type !== EntityType.EMPLOYEE) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const draggedEntityId = e.dataTransfer.getData("text/plain")

    if (draggedEntityId !== entity.id && entity.type !== EntityType.EMPLOYEE) {
      moveEntity(draggedEntityId, entity.id)
      setIsExpanded(true)
    }
  }

  const canAddChild = entity.type !== EntityType.EMPLOYEE
  const nextEntityType = getNextEntityType()
  const paddingLeft = `${level * 1.5 + 0.5}rem`

  return (
    <div className={`node-container ${isDragging ? "opacity-50" : ""}`} ref={nodeRef}>
      <div
        className={`node-content flex items-center p-2 rounded-md ${isDragOver ? "drag-over" : ""}`}
        style={{ paddingLeft }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {hasChildren ? (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6 mr-2" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="w-6 mr-2" />
        )}

        <div className="mr-2">{getEntityIcon()}</div>

        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-1">
            <span className="font-medium">{entity.name}</span>
            {entity.role && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(entity.role)}`}>
                {entity.role}
              </span>
            )}
            {showPermissionBadges && entity.type === EntityType.EMPLOYEE && permissionNames.length > 0 && (
              <div className="flex items-center ml-2">
                <Shield className="h-3 w-3 text-blue-600 mr-1" />
                <span className="text-xs text-gray-500">
                  {permissionNames.length} {permissionNames.length === 1 ? "Berechtigung" : "Berechtigungen"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {canAddChild && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mr-1"
                onClick={() => setIsAddDialogOpen(true)}
                title={`${getEntityTypeName(nextEntityType)} hinzufügen`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu modal={true}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                {entity.type === EntityType.EMPLOYEE && (
                  <DropdownMenuItem onSelect={() => setIsCopyDialogOpen(true)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Kopieren
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {children.map((child) => (
            <TreeNode key={child.id} entity={child} level={level + 1} />
          ))}
        </div>
      )}

      <AddEntityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        entityType={nextEntityType}
        parentId={entity.id}
      />

      <EditEntityDialog isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} entity={entity} />

      <DeleteEntityDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} entity={entity} />
      {entity.type === EntityType.EMPLOYEE && (
        <CopyUserDialog isOpen={isCopyDialogOpen} onClose={() => setIsCopyDialogOpen(false)} entity={entity} />
      )}
    </div>
  )
}

function getEntityTypeName(type: EntityType): string {
  switch (type) {
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
