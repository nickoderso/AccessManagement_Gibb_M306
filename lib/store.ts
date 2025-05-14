"use client"

import { create } from "zustand"
import { type Entity, ViewType, EntityType } from "./types"
import type { Permission } from "./permissions-db"
import {
  saveEntity,
  updateEntity as updateFirestoreEntity,
  deleteEntity as deleteFirestoreEntity,
  savePermission,
  subscribeToEntities,
  subscribeToPermissions,
  getSettings,
  saveSettings,
} from "./firestore-service"
import { doc } from "firebase/firestore"
import { db } from "./firebase"

interface OrgState {
  entities: Entity[]
  activeView: ViewType
  isLoading: boolean
  addEntity: (entity: Entity) => Promise<void>
  updateEntity: (entity: Entity) => Promise<void>
  deleteEntity: (id: string) => Promise<void>
  moveEntity: (id: string, newParentId: string) => Promise<void>
  getChildrenOf: (parentId: string | null) => Entity[]
  initializeFromFirestore: () => Promise<void>
  setActiveView: (view: ViewType) => void
  addPermissionToEntity: (entityId: string, permissionId: string) => Promise<void>
  removePermissionFromEntity: (entityId: string, permissionId: string) => Promise<void>
  getEntityPermissions: (entityId: string) => string[]
  addCustomPermission: (permission: Omit<Permission, "id">) => Promise<Permission>
  copyUser: (userId: string, newUserData: { name: string; role?: string }) => Promise<void>
  loadSettings: () => Promise<void>
  saveUserSettings: (settings: any) => Promise<void>
}

export const useOrgStore = create<OrgState>((set, get) => {
  // Hilfsfunktion, um den aktuellen Benutzer zu erhalten
  const getCurrentUserId = () => {
    // In einer echten Implementierung würden wir hier useAuth() verwenden,
    // aber da Zustand-Hooks nicht direkt in Zustand-Stores verwendet werden können,
    // müssen wir den Benutzer als Parameter übergeben
    const auth = typeof window !== "undefined" ? window.localStorage.getItem("currentUser") : null
    return auth ? JSON.parse(auth).uid : null
  }

  return {
    entities: [],
    activeView: ViewType.ORGANIZATION,
    isLoading: false,

    addEntity: async (entity) => {
      const userId = getCurrentUserId()
      if (!userId) return

      set((state) => ({ isLoading: true }))

      try {
        // Stelle sicher, dass role nicht undefined ist
        const entityToSave = {
          ...entity,
          role: entity.role || null, // Verwende null statt undefined
        }

        await saveEntity(entityToSave, userId)

        // Entferne diese Zeilen, da die Entität bereits durch die Subscription hinzugefügt wird
        // set((state) => ({
        //   entities: [...state.entities, entityToSave],
        //   isLoading: false,
        // }))

        // Setze nur isLoading zurück
        set((state) => ({ isLoading: false }))
      } catch (error) {
        console.error("Error adding entity:", error)
        set((state) => ({ isLoading: false }))
      }
    },

    updateEntity: async (updatedEntity) => {
      const userId = getCurrentUserId()
      if (!userId) return

      set((state) => ({ isLoading: true }))

      try {
        await updateFirestoreEntity(updatedEntity, userId)

        set((state) => ({
          entities: state.entities.map((entity) => (entity.id === updatedEntity.id ? updatedEntity : entity)),
          isLoading: false,
        }))
      } catch (error) {
        console.error("Error updating entity:", error)
        set((state) => ({ isLoading: false }))
      }
    },

    deleteEntity: async (id) => {
      const userId = getCurrentUserId()
      if (!userId) return

      set((state) => ({ isLoading: true }))

      try {
        // Get all descendant IDs recursively
        const getDescendantIds = (parentId: string): string[] => {
          const children = get().entities.filter((e) => e.parentId === parentId)
          return [...children.map((c) => c.id), ...children.flatMap((c) => getDescendantIds(c.id))]
        }

        const idsToRemove = [id, ...getDescendantIds(id)]

        // Delete all entities in Firestore
        for (const entityId of idsToRemove) {
          await deleteFirestoreEntity(doc(db, `users/${userId}/entities/${entityId}`))
        }

        set((state) => ({
          entities: state.entities.filter((entity) => !idsToRemove.includes(entity.id)),
          isLoading: false,
        }))
      } catch (error) {
        console.error("Error deleting entity:", error)
        set((state) => ({ isLoading: false }))
      }
    },

    moveEntity: async (id, newParentId) => {
      const userId = getCurrentUserId()
      if (!userId) return

      set((state) => {
        // Prevent circular references
        const isDescendant = (entityId: string, potentialAncestorId: string): boolean => {
          if (entityId === potentialAncestorId) return true

          const entity = state.entities.find((e) => e.id === potentialAncestorId)
          if (!entity || entity.parentId === null) return false

          return isDescendant(entityId, entity.parentId)
        }

        if (isDescendant(newParentId, id)) return state

        const entityToMove = state.entities.find((e) => e.id === id)
        if (!entityToMove) return state

        const updatedEntity = { ...entityToMove, parentId: newParentId }

        // Update in Firestore
        updateFirestoreEntity(updatedEntity, userId).catch((error) => console.error("Error moving entity:", error))

        return {
          entities: state.entities.map((entity) => (entity.id === id ? updatedEntity : entity)),
        }
      })
    },

    getChildrenOf: (parentId) => {
      return get().entities.filter((entity) => entity.parentId === parentId)
    },

    initializeFromFirestore: async () => {
      const userId = getCurrentUserId()
      if (!userId) return

      set({ isLoading: true })

      try {
        // Abonniere Änderungen an Entitäten
        const unsubscribeEntities = subscribeToEntities(userId, (entities) => {
          set({ entities, isLoading: false })
        })

        // Abonniere Änderungen an Berechtigungen
        const unsubscribePermissions = subscribeToPermissions(userId, (permissions) => {
          // Hier könnten wir die Berechtigungen im Store speichern, wenn nötig
        })

        // Speichere die Unsubscribe-Funktionen für die Bereinigung
        window.__firestoreUnsubscribes = [unsubscribeEntities, unsubscribePermissions]
      } catch (error) {
        console.error("Error initializing from Firestore:", error)
        set({ isLoading: false })
      }
    },

    setActiveView: (view) => {
      set({ activeView: view })
    },

    addPermissionToEntity: async (entityId, permissionId) => {
      const userId = getCurrentUserId()
      if (!userId) return

      set((state) => {
        const entity = state.entities.find((e) => e.id === entityId)
        if (!entity) return state

        const permissions = entity.permissions || []
        if (permissions.includes(permissionId)) return state

        const updatedEntity = {
          ...entity,
          permissions: [...permissions, permissionId],
        }

        // Update in Firestore
        updateFirestoreEntity(updatedEntity, userId).catch((error) =>
          console.error("Error adding permission to entity:", error),
        )

        return {
          entities: state.entities.map((e) => (e.id === entityId ? updatedEntity : e)),
        }
      })
    },

    removePermissionFromEntity: async (entityId, permissionId) => {
      const userId = getCurrentUserId()
      if (!userId) return

      set((state) => {
        const entity = state.entities.find((e) => e.id === entityId)
        if (!entity || !entity.permissions) return state

        const updatedEntity = {
          ...entity,
          permissions: entity.permissions.filter((id) => id !== permissionId),
        }

        // Update in Firestore
        updateFirestoreEntity(updatedEntity, userId).catch((error) =>
          console.error("Error removing permission from entity:", error),
        )

        return {
          entities: state.entities.map((e) => (e.id === entityId ? updatedEntity : e)),
        }
      })
    },

    getEntityPermissions: (entityId) => {
      const entity = get().entities.find((e) => e.id === entityId)
      return entity?.permissions || []
    },

    addCustomPermission: async (permission) => {
      const userId = getCurrentUserId()
      if (!userId) throw new Error("User not authenticated")

      const newPermission = {
        ...permission,
        id: `perm_${Date.now()}`,
      }

      try {
        await savePermission(newPermission, userId)
        return newPermission
      } catch (error) {
        console.error("Error adding custom permission:", error)
        throw error
      }
    },

    copyUser: async (userId, newUserData) => {
      const currentUserId = getCurrentUserId()
      if (!currentUserId) return

      try {
        const sourceUser = get().entities.find((e) => e.id === userId)
        if (!sourceUser || sourceUser.type !== EntityType.EMPLOYEE) return

        const newUserId = crypto.randomUUID()
        const newUser: Entity = {
          id: newUserId,
          name: newUserData.name,
          type: EntityType.EMPLOYEE,
          parentId: sourceUser.parentId,
          role: newUserData.role || sourceUser.role || null,
          permissions: sourceUser.permissions ? [...sourceUser.permissions] : [],
          metadata: sourceUser.metadata ? { ...sourceUser.metadata } : {},
        }

        // Save to Firestore
        await saveEntity(newUser, currentUserId)

        // Entferne diese Zeilen, da die Entität bereits durch die Subscription hinzugefügt wird
        // set((state) => ({
        //   entities: [...state.entities, newUser],
        // }))

        return newUserId
      } catch (error) {
        console.error("Error copying user:", error)
      }
    },

    loadSettings: async () => {
      const userId = getCurrentUserId()
      if (!userId) return

      try {
        const settings = await getSettings(userId)
        if (settings) {
          // Hier könnten wir die Einstellungen im Store speichern, wenn nötig
          return settings
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    },

    saveUserSettings: async (settings) => {
      const userId = getCurrentUserId()
      if (!userId) return

      try {
        await saveSettings(settings, userId)
      } catch (error) {
        console.error("Error saving settings:", error)
      }
    },
  }
})

// Hilfsfunktion für die Bereinigung der Firestore-Abonnements
window.__firestoreUnsubscribes = []

// Bereinige Abonnements beim Entladen der Seite
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    window.__firestoreUnsubscribes.forEach((unsubscribe) => unsubscribe())
  })
}
