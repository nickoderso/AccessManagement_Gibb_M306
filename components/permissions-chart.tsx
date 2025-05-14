"use client"

import { useEffect, useState } from "react"
import { useOrgStore } from "@/lib/store"
import { EntityType } from "@/lib/types"
import { getAllPermissions, PermissionCategory } from "@/lib/permissions-db"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"

export function PermissionsChart() {
  const { entities, getEntityPermissions } = useOrgStore()
  const [data, setData] = useState<any[]>([])
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Colors for charts - adjusted for dark mode compatibility
  const COLORS = isDarkTheme
    ? ["#60a5fa", "#5eead4", "#fcd34d", "#f87171", "#a78bfa", "#86efac"] // Brighter colors for dark mode
    : ["#3b82f6", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"] // Standard colors for light mode

  useEffect(() => {
    // Get all permissions
    const allPermissions = getAllPermissions()

    // Get all employees
    const employees = entities.filter((entity) => entity.type === EntityType.EMPLOYEE)

    // Calculate category distribution
    const categoryData = Object.values(PermissionCategory).map((category) => {
      const permissionsInCategory = allPermissions.filter((p) => p.category === category)

      // Count how many users have each permission
      const usageCount = permissionsInCategory.reduce((total, permission) => {
        const usersWithPermission = employees.filter((employee) => {
          const permissions = getEntityPermissions(employee.id)
          return permissions.includes(permission.id)
        }).length

        return total + usersWithPermission
      }, 0)

      return {
        name: getCategoryName(category),
        value: usageCount,
      }
    })

    setData(categoryData)
  }, [entities, getEntityPermissions])

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground text-center">
          Keine Berechtigungsdaten verfügbar. Fügen Sie Benutzer und Berechtigungen hinzu, um Statistiken zu sehen.
        </p>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => (percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : "")}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} Zuweisungen`, "Anzahl"]}
            contentStyle={{
              backgroundColor: isDarkTheme ? "#1f2937" : "#ffffff",
              borderColor: isDarkTheme ? "#374151" : "#e5e7eb",
              color: isDarkTheme ? "#e5e7eb" : "#374151",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Hilfsfunktion zum Formatieren der Kategorienamen
function getCategoryName(category: PermissionCategory): string {
  switch (category) {
    case PermissionCategory.SYSTEM:
      return "System"
    case PermissionCategory.FILE:
      return "Datei"
    case PermissionCategory.USER:
      return "Benutzer"
    case PermissionCategory.NETWORK:
      return "Netzwerk"
    case PermissionCategory.APPLICATION:
      return "Anwendung"
    default:
      return category
  }
}
