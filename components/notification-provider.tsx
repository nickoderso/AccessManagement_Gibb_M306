"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "info" | "warning"

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, "id">) => void
  dismissNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-dismiss after duration (default: 5000ms)
    const duration = notification.duration || 5000
    setTimeout(() => {
      dismissNotification(id)
    }, duration)
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "p-4 rounded-lg shadow-lg flex items-start gap-3 animate-in slide-in-from-right-5 duration-300",
            notification.type === "success" &&
              "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
            notification.type === "error" && "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
            notification.type === "info" &&
              "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
            notification.type === "warning" &&
              "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",
          )}
        >
          <div className="flex-shrink-0">
            {notification.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {notification.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
            {notification.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
            {notification.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{notification.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
          </div>
          <button
            onClick={() => dismissNotification(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  )
}
