"use client"

import { useState } from "react"
import { useOrgStore } from "@/lib/store"
import { TreeNode } from "@/components/tree-node"
import { EntityType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddEntityDialog } from "@/components/add-entity-dialog"

interface OrganizationTreeProps {
  searchTerm: string
}

export function OrganizationTree({ searchTerm }: OrganizationTreeProps) {
  const { entities, getChildrenOf } = useOrgStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Get top-level companies
  const companies = getChildrenOf(null)

  // Filter entities based on search term
  const filteredEntities = searchTerm
    ? entities.filter(
        (entity) =>
          entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entity.role && entity.role.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : []

  if (companies.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-4">Keine Unternehmen gefunden</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
          Beginnen Sie mit dem Hinzufügen eines Unternehmens, um Ihre Organisationsstruktur aufzubauen.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Unternehmen hinzufügen
        </Button>

        <AddEntityDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          entityType={EntityType.COMPANY}
          parentId={null}
        />
      </div>
    )
  }

  if (searchTerm && filteredEntities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Keine Ergebnisse für &quot;{searchTerm}&quot; gefunden.</p>
      </div>
    )
  }

  if (searchTerm) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium mb-4">Suchergebnisse für &quot;{searchTerm}&quot;:</h2>
        {filteredEntities.map((entity) => (
          <div key={entity.id} className="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{entity.name}</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{getEntityTypeName(entity.type)}</span>
              </div>
              {entity.role && (
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(entity.role)}`}>
                  {entity.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <TreeNode key={company.id} entity={company} level={0} />
      ))}
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
