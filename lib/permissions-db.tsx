// Diese Datei dient als "Datenbank" für Berechtigungen

export interface Permission {
  id: string
  name: string
  description: string
  category: PermissionCategory
}

export enum PermissionCategory {
  SYSTEM = "system",
  FILE = "file",
  USER = "user",
  NETWORK = "network",
  APPLICATION = "application",
}

// Initial-Berechtigungen
const initialPermissions: Permission[] = [
  {
    id: "perm_1",
    name: "Domänen-Administrator",
    description: "Vollständige Kontrolle über die Domäne",
    category: PermissionCategory.SYSTEM,
  },
  {
    id: "perm_2",
    name: "Lokaler Administrator",
    description: "Vollständige Kontrolle über lokale Systeme",
    category: PermissionCategory.SYSTEM,
  },
  {
    id: "perm_3",
    name: "Benutzerkonten verwalten",
    description: "Benutzerkonten erstellen, ändern und löschen",
    category: PermissionCategory.USER,
  },
  {
    id: "perm_4",
    name: "Gruppenrichtlinien verwalten",
    description: "Gruppenrichtlinien erstellen und bearbeiten",
    category: PermissionCategory.SYSTEM,
  },
  {
    id: "perm_5",
    name: "Dateizugriff - Lesen",
    description: "Lesezugriff auf Dateien und Ordner",
    category: PermissionCategory.FILE,
  },
  {
    id: "perm_6",
    name: "Dateizugriff - Schreiben",
    description: "Schreibzugriff auf Dateien und Ordner",
    category: PermissionCategory.FILE,
  },
  {
    id: "perm_7",
    name: "Netzwerkzugriff",
    description: "Zugriff auf Netzwerkressourcen",
    category: PermissionCategory.NETWORK,
  },
  {
    id: "perm_8",
    name: "Remote-Zugriff",
    description: "Fernzugriff auf Systeme",
    category: PermissionCategory.NETWORK,
  },
  {
    id: "perm_9",
    name: "Anwendungsinstallation",
    description: "Software installieren und deinstallieren",
    category: PermissionCategory.APPLICATION,
  },
  {
    id: "perm_10",
    name: "Sicherheitsrichtlinien verwalten",
    description: "Sicherheitsrichtlinien konfigurieren",
    category: PermissionCategory.SYSTEM,
  },
]

// Lokaler Speicher für Berechtigungen
let permissions: Permission[] = []

// Funktion zum Laden der Berechtigungen aus dem localStorage
const loadPermissionsFromStorage = (): void => {
  if (typeof window !== "undefined") {
    const storedPermissions = localStorage.getItem("adPermissions")
    if (storedPermissions) {
      permissions = JSON.parse(storedPermissions)
    } else {
      // Wenn keine gespeicherten Berechtigungen vorhanden sind, verwende die Initial-Berechtigungen
      permissions = [...initialPermissions]
      // Speichere die Initial-Berechtigungen im localStorage
      localStorage.setItem("adPermissions", JSON.stringify(permissions))
    }
  }
}

// Funktion zum Speichern der Berechtigungen im localStorage
const savePermissionsToStorage = (): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("adPermissions", JSON.stringify(permissions))
  }
}

// Initialisiere die Berechtigungen beim ersten Laden
if (typeof window !== "undefined") {
  loadPermissionsFromStorage()
}

// Funktion zum Abrufen aller Berechtigungen
export function getAllPermissions(): Permission[] {
  if (permissions.length === 0 && typeof window !== "undefined") {
    loadPermissionsFromStorage()
  }
  return [...permissions]
}

// Funktion zum Abrufen von Berechtigungen nach Kategorie
export function getPermissionsByCategory(category: PermissionCategory): Permission[] {
  return getAllPermissions().filter((permission) => permission.category === category)
}

// Funktion zum Hinzufügen einer neuen Berechtigung
export function addPermission(permission: Omit<Permission, "id">): Permission {
  const newPermission = {
    ...permission,
    id: `perm_${Date.now()}`,
  }

  permissions.push(newPermission)
  savePermissionsToStorage()
  return newPermission
}

// Funktion zum Aktualisieren einer Berechtigung
export function updatePermission(permission: Permission): void {
  const index = permissions.findIndex((p) => p.id === permission.id)
  if (index !== -1) {
    permissions[index] = permission
    savePermissionsToStorage()
  }
}

// Funktion zum Löschen einer Berechtigung
export function deletePermission(id: string): void {
  permissions = permissions.filter((permission) => permission.id !== id)
  savePermissionsToStorage()
}

// Funktion zum Zurücksetzen auf die Initial-Berechtigungen
export function resetPermissions(): void {
  permissions = [...initialPermissions]
  savePermissionsToStorage()
}
