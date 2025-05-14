import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Entity } from "@/lib/types"
import { type Permission, PermissionCategory } from "@/lib/permissions-db"

// Hilfsfunktion, um undefined-Werte aus einem Objekt zu entfernen
export function removeUndefinedValues(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      // Wenn der Wert ein Objekt ist, rekursiv undefined-Werte entfernen
      if (value !== undefined) {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          acc[key] = removeUndefinedValues(value)
        } else {
          acc[key] = value
        }
      }
      return acc
    },
    {} as Record<string, any>,
  )
}

// Entitäten (Organisationsstruktur)
export async function saveEntity(entity: Entity, userId: string): Promise<void> {
  // Entferne undefined-Werte aus dem Entity-Objekt
  const cleanEntity = removeUndefinedValues(entity)

  const entityRef = doc(db, `users/${userId}/entities/${entity.id}`)
  await setDoc(entityRef, cleanEntity)
}

export async function getEntity(entityId: string, userId: string): Promise<Entity | null> {
  const entityRef = doc(db, `users/${userId}/entities/${entityId}`)
  const entitySnap = await getDoc(entityRef)

  if (entitySnap.exists()) {
    return entitySnap.data() as Entity
  }

  return null
}

export async function getAllEntities(userId: string): Promise<Entity[]> {
  const entitiesRef = collection(db, `users/${userId}/entities`)
  const querySnapshot = await getDocs(entitiesRef)

  const entities: Entity[] = []
  querySnapshot.forEach((doc) => {
    entities.push(doc.data() as Entity)
  })

  return entities
}

export async function updateEntity(entity: Entity, userId: string): Promise<void> {
  // Entferne undefined-Werte aus dem Entity-Objekt
  const cleanEntity = removeUndefinedValues(entity)

  const entityRef = doc(db, `users/${userId}/entities/${entity.id}`)
  await updateDoc(entityRef, cleanEntity)
}

export async function deleteEntity(entityId: string, userId: string): Promise<void> {
  const entityRef = doc(db, `users/${userId}/entities/${entityId}`)
  await deleteDoc(entityRef)
}

export function subscribeToEntities(userId: string, callback: (entities: Entity[]) => void): () => void {
  const entitiesRef = collection(db, `users/${userId}/entities`)

  const unsubscribe = onSnapshot(entitiesRef, (snapshot) => {
    const entities: Entity[] = []
    snapshot.forEach((doc) => {
      entities.push(doc.data() as Entity)
    })
    callback(entities)
  })

  return unsubscribe
}

// Berechtigungen
export async function savePermission(permission: Permission, userId: string): Promise<void> {
  const permissionRef = doc(db, `users/${userId}/permissions/${permission.id}`)
  await setDoc(permissionRef, permission)
}

export async function getAllPermissions(userId: string): Promise<Permission[]> {
  const permissionsRef = collection(db, `users/${userId}/permissions`)
  const querySnapshot = await getDocs(permissionsRef)

  const permissions: Permission[] = []
  querySnapshot.forEach((doc) => {
    permissions.push(doc.data() as Permission)
  })

  return permissions
}

export async function updatePermission(permission: Permission, userId: string): Promise<void> {
  const permissionRef = doc(db, `users/${userId}/permissions/${permission.id}`)
  await updateDoc(permissionRef, permission)
}

export async function deletePermission(permissionId: string, userId: string): Promise<void> {
  const permissionRef = doc(db, `users/${userId}/permissions/${permissionId}`)
  await deleteDoc(permissionRef)
}

export function subscribeToPermissions(userId: string, callback: (permissions: Permission[]) => void): () => void {
  const permissionsRef = collection(db, `users/${userId}/permissions`)

  const unsubscribe = onSnapshot(permissionsRef, (snapshot) => {
    const permissions: Permission[] = []
    snapshot.forEach((doc) => {
      permissions.push(doc.data() as Permission)
    })
    callback(permissions)
  })

  return unsubscribe
}

// Einstellungen
export async function saveSettings(settings: any, userId: string): Promise<void> {
  const settingsRef = doc(db, `users/${userId}/settings/appSettings`)
  await setDoc(settingsRef, settings)
}

export async function getSettings(userId: string): Promise<any | null> {
  const settingsRef = doc(db, `users/${userId}/settings/appSettings`)
  const settingsSnap = await getDoc(settingsRef)

  if (settingsSnap.exists()) {
    return settingsSnap.data()
  }

  return null
}

// Daten-Migration von localStorage zu Firestore
export async function migrateLocalStorageToFirestore(userId: string): Promise<void> {
  if (typeof window === "undefined") return

  const batch = writeBatch(db)

  // Entitäten migrieren
  const storedEntities = localStorage.getItem("orgEntities")
  if (storedEntities) {
    const entities = JSON.parse(storedEntities) as Entity[]
    entities.forEach((entity) => {
      const entityRef = doc(db, `users/${userId}/entities/${entity.id}`)
      batch.set(entityRef, entity)
    })
  }

  // Berechtigungen migrieren
  const storedPermissions = localStorage.getItem("adPermissions")
  if (storedPermissions) {
    const permissions = JSON.parse(storedPermissions) as Permission[]
    permissions.forEach((permission) => {
      const permissionRef = doc(db, `users/${userId}/permissions/${permission.id}`)
      batch.set(permissionRef, permission)
    })
  }

  // Einstellungen migrieren
  const storedSettings = localStorage.getItem("adSettings")
  if (storedSettings) {
    const settings = JSON.parse(storedSettings)
    const settingsRef = doc(db, `users/${userId}/settings/appSettings`)
    batch.set(settingsRef, settings)
  }

  // Batch-Schreibvorgang ausführen
  await batch.commit()
}

// Initialisiere Standarddaten für neue Benutzer
export async function initializeDefaultData(userId: string): Promise<void> {
  const entitiesRef = collection(db, `users/${userId}/entities`)
  const entitiesSnapshot = await getDocs(entitiesRef)

  // Nur initialisieren, wenn keine Entitäten vorhanden sind
  if (entitiesSnapshot.empty) {
    const batch = writeBatch(db)

    // Standardberechtigungen
    const defaultPermissions = [
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
    ]

    defaultPermissions.forEach((permission) => {
      const permissionRef = doc(db, `users/${userId}/permissions/${permission.id}`)
      batch.set(permissionRef, permission)
    })

    // Standardeinstellungen
    const defaultSettings = {
      autoSave: true,
      darkModeDefault: false,
      showPermissionBadges: true,
      expandAllByDefault: false,
    }

    const settingsRef = doc(db, `users/${userId}/settings/appSettings`)
    batch.set(settingsRef, defaultSettings)

    await batch.commit()
  }
}
