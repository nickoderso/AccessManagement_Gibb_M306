"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Building, Users, Shield, Settings, HelpCircle, X, Plus } from "lucide-react"
import { AddEntityDialog } from "@/components/add-entity-dialog"
import { EntityType, ViewType } from "@/lib/types"
import { useOrgStore } from "@/lib/store"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeView, setActiveView } = useOrgStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-secondary border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Menü</h2>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <Button variant="outline" className="w-full justify-start mb-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Unternehmen hinzufügen
          </Button>

          <nav className="space-y-1">
            <Button
              variant={activeView === ViewType.ORGANIZATION ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewChange(ViewType.ORGANIZATION)}
            >
              <Building className="mr-2 h-4 w-4" /> Organisationen
            </Button>
            <Button
              variant={activeView === ViewType.USERS ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewChange(ViewType.USERS)}
            >
              <Users className="mr-2 h-4 w-4" /> Benutzer
            </Button>
            <Button
              variant={activeView === ViewType.PERMISSIONS ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewChange(ViewType.PERMISSIONS)}
            >
              <Shield className="mr-2 h-4 w-4" /> Berechtigungen
            </Button>
            <Button
              variant={activeView === ViewType.SETTINGS ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewChange(ViewType.SETTINGS)}
            >
              <Settings className="mr-2 h-4 w-4" /> Einstellungen
            </Button>
            <Button
              variant={activeView === ViewType.HELP ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewChange(ViewType.HELP)}
            >
              <HelpCircle className="mr-2 h-4 w-4" /> Hilfe
            </Button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Darstellung</span>
            <ModeToggle />
          </div>
        </div>
      </aside>

      <AddEntityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        entityType={EntityType.COMPANY}
        parentId={null}
      />
    </>
  )
}
