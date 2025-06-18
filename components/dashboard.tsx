"use client";

import { useState, useEffect } from "react";
import { OrganizationTree } from "@/components/organization-tree";
import { SearchBar } from "@/components/search-bar";
import { useOrgStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddEntityDialog } from "@/components/add-entity-dialog";
import { EntityType, ViewType } from "@/lib/types";
import { UsersView } from "@/components/users-view";
import { PermissionsView } from "@/components/permissions-view";
import { SettingsView } from "@/components/settings-view";
import { HelpView } from "@/components/help-view";
import { Footer } from "@/components/footer";
import { PermissionsChart } from "@/components/permissions-chart";
import { StatisticsView } from "@/components/statistics-view";
import { useAuth } from "@/lib/auth-context";
import { UserMenu } from "@/components/user-menu";
import {
  migrateLocalStorageToFirestore,
  initializeDefaultData,
} from "@/lib/firestore-service";
import { useNotification } from "@/components/notification-provider";
import React from "react";

export function Dashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const { initializeFromFirestore, activeView, setActiveView, isLoading } =
    useOrgStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      const initializeData = async () => {
        try {
          const hasLocalData = localStorage.getItem("orgEntities") !== null;

          if (hasLocalData) {
            // Migriere lokale Daten zu Firestore
            await migrateLocalStorageToFirestore(user.uid);
            showNotification({
              title: "Daten migriert",
              message:
                "Ihre lokalen Daten wurden erfolgreich in die Cloud migriert.",
              type: "success",
              duration: 5000,
            });
          } else {
            // Initialisiere Standarddaten für neue Benutzer
            await initializeDefaultData(user.uid);
          }

          // Lade Daten aus Firestore
          await initializeFromFirestore();
          setIsInitialized(true);
        } catch (error) {
          console.error("Error initializing data:", error);
          showNotification({
            title: "Fehler",
            message: "Beim Laden Ihrer Daten ist ein Fehler aufgetreten.",
            type: "error",
            duration: 5000,
          });
        }
      };

      initializeData();
    }
  }, [user, initializeFromFirestore, showNotification, isInitialized]);

  useEffect(() => {
    // Zeige eine Benachrichtigung über die neue Funktion an, wenn die Anwendung geladen wird
    const hasShownCopyFeatureNotification = localStorage.getItem(
      "hasShownCopyFeatureNotification"
    );
    if (!hasShownCopyFeatureNotification) {
      // Verzögere die Benachrichtigung um 2 Sekunden, damit die Anwendung zuerst geladen wird
      const timer = setTimeout(() => {
        showNotification({
          title: "Neue Funktion: Benutzer kopieren",
          message:
            "Sie können jetzt Benutzer mit allen Berechtigungen kopieren. Probieren Sie es aus!",
          type: "info",
          duration: 8000,
        });
        localStorage.setItem("hasShownCopyFeatureNotification", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const renderActiveView = () => {
    switch (activeView) {
      case ViewType.ORGANIZATION:
        return <OrganizationTree searchTerm={searchTerm} />;
      case ViewType.USERS:
        return <UsersView searchTerm={searchTerm} />;
      case ViewType.PERMISSIONS:
        return <PermissionsView searchTerm={searchTerm} />;
      case ViewType.SETTINGS:
        return <SettingsView />;
      case ViewType.HELP:
        return <HelpView />;
      case ViewType.STATISTICS:
        return <StatisticsView />;
      default:
        return <OrganizationTree searchTerm={searchTerm} />;
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case ViewType.ORGANIZATION:
        return "Organisationsstruktur";
      case ViewType.USERS:
        return "Benutzer";
      case ViewType.PERMISSIONS:
        return "Berechtigungen";
      case ViewType.SETTINGS:
        return "Einstellungen";
      case ViewType.HELP:
        return "Hilfe";
      case ViewType.STATISTICS:
        return "Statistiken";
      default:
        return "Organisationsstruktur";
    }
  };

  const showAddButton = activeView === ViewType.ORGANIZATION;
  const showSearchBar =
    activeView === ViewType.ORGANIZATION ||
    activeView === ViewType.USERS ||
    activeView === ViewType.PERMISSIONS;
  const showPermissionsChart = activeView === ViewType.PERMISSIONS;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b border-border py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">
            Gruppe Gilgen - Access Management
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {showAddButton && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white hidden md:flex"
            >
              <Plus className="mr-2 h-4 w-4" /> Unternehmen hinzufügen
            </Button>
          )}
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 bg-background">
        {showSearchBar && (
          <div className="mb-6">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        )}

        <div className="bg-card text-card-foreground rounded-lg shadow p-6 overflow-auto mb-6">
          <h2 className="text-xl font-semibold mb-6">{getViewTitle()}</h2>
          {renderActiveView()}
        </div>

        {showPermissionsChart && (
          <div className="bg-card text-card-foreground rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6">
              Berechtigungsverteilung
            </h2>
            <PermissionsChart />
          </div>
        )}
      </main>

      <Footer />

      <AddEntityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        entityType={EntityType.COMPANY}
        parentId={null}
      />
    </div>
  );
}
