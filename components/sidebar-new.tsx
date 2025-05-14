"use client"

import type React from "react"

import { useState } from "react"
import { Building, Users, Shield, Settings, HelpCircle, Plus, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react"
import { AddEntityDialog } from "@/components/add-entity-dialog"
import { EntityType, ViewType } from "@/lib/types"
import { useOrgStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export function AppSidebar() {
  const { activeView, setActiveView } = useOrgStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { state, toggleSidebar } = useSidebar()
  const { user } = useAuth()

  // Generiere den ersten Buchstaben für Avatar
  const getFirstLetter = () => {
    if (user?.displayName && user.displayName.trim() !== "") {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "?"
  }

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white font-bold">
              AD
            </div>
            <h2
              className={cn(
                "text-lg font-bold text-primary transition-opacity duration-200",
                state === "collapsed" && "opacity-0",
              )}
            >
              AD Manager
            </h2>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleSidebar()}
            className="ml-2"
            aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
          >
            {state === "expanded" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      {user && state === "expanded" && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-600 text-white">{getFirstLetter()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[150px]">{user.displayName || "Benutzer"}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
            </div>
          </div>
        </div>
      )}

      <SidebarContent>
        <div className="px-3 py-2">
          <h3
            className={cn("text-xs font-semibold text-muted-foreground mb-2 px-2", state === "collapsed" && "sr-only")}
          >
            Hauptmenü
          </h3>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === ViewType.ORGANIZATION}
                onClick={() => setActiveView(ViewType.ORGANIZATION)}
                tooltip="Organisationen"
                className="gap-3 py-2"
              >
                <Building className="h-5 w-5" />
                <span>Organisationen</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === ViewType.USERS}
                onClick={() => setActiveView(ViewType.USERS)}
                tooltip="Benutzer"
                className="gap-3 py-2"
              >
                <Users className="h-5 w-5" />
                <span>Benutzer</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === ViewType.PERMISSIONS}
                onClick={() => setActiveView(ViewType.PERMISSIONS)}
                tooltip="Berechtigungen"
                className="gap-3 py-2"
              >
                <Shield className="h-5 w-5" />
                <span>Berechtigungen</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === ViewType.STATISTICS}
                onClick={() => setActiveView(ViewType.STATISTICS)}
                tooltip="Statistiken"
                className="gap-3 py-2"
              >
                <BarChart2 className="h-5 w-5" />
                <span>Statistiken</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <Separator className="my-2" />

        <div className="px-3 py-2">
          <h3
            className={cn("text-xs font-semibold text-muted-foreground mb-2 px-2", state === "collapsed" && "sr-only")}
          >
            System
          </h3>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === ViewType.SETTINGS}
                onClick={() => setActiveView(ViewType.SETTINGS)}
                tooltip="Einstellungen"
                className="gap-3 py-2"
              >
                <Settings className="h-5 w-5" />
                <span>Einstellungen</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === ViewType.HELP}
                onClick={() => setActiveView(ViewType.HELP)}
                tooltip="Hilfe"
                className="gap-3 py-2"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Hilfe</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className={cn("transition-opacity duration-200", state === "collapsed" && "opacity-0")}>
              Unternehmen hinzufügen
            </span>
          </Button>

          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-200",
                state === "collapsed" && "opacity-0",
              )}
            >
              Darstellung
            </span>
            <ModeToggle />
          </div>
        </div>
      </SidebarFooter>

      <AddEntityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        entityType={EntityType.COMPANY}
        parentId={null}
      />
    </Sidebar>
  )
}

// Ändern Sie die SidebarWrapper-Komponente, um ein festes Icon zum Aufklappen der Sidebar hinzuzufügen
export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen relative">
        <AppSidebar />
        <ExpandSidebarButton />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </SidebarProvider>
  )
}

// Fügen Sie diese neue Komponente hinzu, die ein festes Icon zum Aufklappen der Sidebar anzeigt
function ExpandSidebarButton() {
  const { state, toggleSidebar } = useSidebar()

  if (state !== "collapsed") {
    return null
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleSidebar}
      className="absolute left-0 top-4 z-50 rounded-r-md rounded-l-none border-l-0 shadow-md"
      aria-label="Expand sidebar"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
}
