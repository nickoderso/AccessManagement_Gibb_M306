"use client"

import { useState } from "react"
import { useOrgStore } from "@/lib/store"
import { EntityType } from "@/lib/types"
import { getAllPermissions, PermissionCategory } from "@/lib/permissions-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart2, PieChartIcon, Users, Shield, Download, Filter, Building } from "lucide-react"
import { useTheme } from "next-themes"

export function StatisticsView() {
  const { entities, getEntityPermissions } = useOrgStore()
  const [activeTab, setActiveTab] = useState("permissions")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Get all permissions
  const allPermissions = getAllPermissions()

  // Get all employees
  const employees = entities.filter((entity) => entity.type === EntityType.EMPLOYEE)

  // Get all departments
  const departments = entities.filter((entity) => entity.type === EntityType.DEPARTMENT)

  // Calculate permission usage statistics
  const permissionUsageData = allPermissions.map((permission) => {
    const usersWithPermission = employees.filter((employee) => {
      const permissions = getEntityPermissions(employee.id)
      return permissions.includes(permission.id)
    })

    return {
      id: permission.id,
      name: permission.name,
      category: permission.category,
      count: usersWithPermission.length,
      percentage: employees.length > 0 ? Math.round((usersWithPermission.length / employees.length) * 100) : 0,
    }
  })

  // Filter permissions by category if selected
  const filteredPermissionData =
    selectedCategory === "all"
      ? permissionUsageData
      : permissionUsageData.filter((p) => p.category === selectedCategory)

  // Sort by usage count (descending)
  const sortedPermissionData = [...filteredPermissionData].sort((a, b) => b.count - a.count)

  // Calculate category distribution
  const categoryData = Object.values(PermissionCategory).map((category) => {
    const permissionsInCategory = permissionUsageData.filter((p) => p.category === category)
    const totalUsage = permissionsInCategory.reduce((sum, p) => sum + p.count, 0)

    return {
      name: getCategoryName(category),
      value: totalUsage,
      category,
    }
  })

  // Calculate user statistics
  const userStatistics = employees.map((employee) => {
    const permissions = getEntityPermissions(employee.id)
    const department = entities.find((e) => e.id === employee.parentId)
    const departmentName = department ? department.name : "Keine Abteilung"

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role || "Keine Rolle",
      department: departmentName,
      permissionCount: permissions.length,
    }
  })

  // Filter users by department if selected
  const filteredUserStatistics =
    selectedDepartment === "all"
      ? userStatistics
      : userStatistics.filter((user) => {
          const department = entities.find((e) => e.id === entities.find((e) => e.id === user.id)?.parentId)
          return department && department.parentId === selectedDepartment
        })

  // Sort users by permission count (descending)
  const sortedUserStatistics = [...filteredUserStatistics].sort((a, b) => b.permissionCount - a.permissionCount)

  // Calculate department statistics
  const departmentStatistics = departments
    .map((department) => {
      const departmentEmployees = employees.filter((employee) => {
        const employeeTeam = entities.find((e) => e.id === employee.parentId)
        return employeeTeam && employeeTeam.parentId === department.id
      })

      const totalPermissions = departmentEmployees.reduce((sum, employee) => {
        return sum + getEntityPermissions(employee.id).length
      }, 0)

      const avgPermissions =
        departmentEmployees.length > 0 ? Math.round((totalPermissions / departmentEmployees.length) * 10) / 10 : 0

      return {
        id: department.id,
        name: department.name,
        employeeCount: departmentEmployees.length,
        totalPermissions,
        avgPermissions,
      }
    })
    .sort((a, b) => b.avgPermissions - a.avgPermissions)

  // Colors for charts - adjusted for dark mode compatibility
  const COLORS = isDarkTheme
    ? ["#60a5fa", "#5eead4", "#fcd34d", "#f87171", "#a78bfa", "#86efac"] // Brighter colors for dark mode
    : ["#3b82f6", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"] // Standard colors for light mode

  // Chart theme settings
  const chartTheme = {
    backgroundColor: "transparent",
    textColor: isDarkTheme ? "#e5e7eb" : "#374151", // Gray-200 for dark, Gray-700 for light
    axisColor: isDarkTheme ? "#4b5563" : "#d1d5db", // Gray-600 for dark, Gray-300 for light
    gridColor: isDarkTheme ? "#374151" : "#e5e7eb", // Gray-700 for dark, Gray-200 for light
  }

  // Export data as CSV
  const exportData = (data: any[], filename: string) => {
    if (data.length === 0) return

    // Get headers from first object
    const headers = Object.keys(data[0])

    // Convert data to CSV
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(",")),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Check if there's data to display
  const hasPermissionData = sortedPermissionData.length > 0
  const hasUserData = sortedUserStatistics.length > 0
  const hasDepartmentData = departmentStatistics.length > 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="permissions" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="permissions">
              <Shield className="mr-2 h-4 w-4" />
              Berechtigungen
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Benutzer
            </TabsTrigger>
            <TabsTrigger value="departments">
              <BarChart2 className="mr-2 h-4 w-4" />
              Abteilungen
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {Object.values(PermissionCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData(sortedPermissionData, "permission_statistics")}
              disabled={!hasPermissionData}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </Button>
          </div>

          {!hasPermissionData ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Keine Berechtigungsdaten verfügbar. Fügen Sie Benutzer und Berechtigungen hinzu, um Statistiken zu
                  sehen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                    Berechtigungsnutzung
                  </CardTitle>
                  <CardDescription>Anzahl der Benutzer pro Berechtigung</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortedPermissionData.slice(0, 10)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                        <XAxis type="number" stroke={chartTheme.textColor} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fontSize: 12 }}
                          stroke={chartTheme.textColor}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkTheme ? "#1f2937" : "#ffffff",
                            borderColor: isDarkTheme ? "#374151" : "#e5e7eb",
                            color: chartTheme.textColor,
                          }}
                        />
                        <Legend wrapperStyle={{ color: chartTheme.textColor }} />
                        <Bar dataKey="count" name="Anzahl Benutzer" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
                    Berechtigungskategorien
                  </CardTitle>
                  <CardDescription>Verteilung der Berechtigungen nach Kategorie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => (percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : "")}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} Zuweisungen`, "Anzahl"]}
                          contentStyle={{
                            backgroundColor: isDarkTheme ? "#1f2937" : "#ffffff",
                            borderColor: isDarkTheme ? "#374151" : "#e5e7eb",
                            color: chartTheme.textColor,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {hasPermissionData && (
            <Card>
              <CardHeader>
                <CardTitle>Detaillierte Berechtigungsstatistiken</CardTitle>
                <CardDescription>Vollständige Liste aller Berechtigungen und deren Nutzung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left">Berechtigung</th>
                        <th className="px-4 py-2 text-left">Kategorie</th>
                        <th className="px-4 py-2 text-center">Anzahl Benutzer</th>
                        <th className="px-4 py-2 text-center">Prozent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedPermissionData.map((permission) => (
                        <tr key={permission.id} className="hover:bg-muted/50">
                          <td className="px-4 py-2">{permission.name}</td>
                          <td className="px-4 py-2">{getCategoryName(permission.category as PermissionCategory)}</td>
                          <td className="px-4 py-2 text-center">{permission.count}</td>
                          <td className="px-4 py-2 text-center">{permission.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Abteilung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData(sortedUserStatistics, "user_statistics")}
              disabled={!hasUserData}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </Button>
          </div>

          {!hasUserData ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Keine Benutzerdaten verfügbar. Fügen Sie Benutzer hinzu, um Statistiken zu sehen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                  Benutzer mit den meisten Berechtigungen
                </CardTitle>
                <CardDescription>Top 10 Benutzer nach Anzahl der zugewiesenen Berechtigungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedUserStatistics.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                      <XAxis type="number" stroke={chartTheme.textColor} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 12 }}
                        stroke={chartTheme.textColor}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkTheme ? "#1f2937" : "#ffffff",
                          borderColor: isDarkTheme ? "#374151" : "#e5e7eb",
                          color: chartTheme.textColor,
                        }}
                      />
                      <Legend wrapperStyle={{ color: chartTheme.textColor }} />
                      <Bar dataKey="permissionCount" name="Anzahl Berechtigungen" fill={COLORS[2]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {hasUserData && (
            <Card>
              <CardHeader>
                <CardTitle>Detaillierte Benutzerstatistiken</CardTitle>
                <CardDescription>Vollständige Liste aller Benutzer und deren Berechtigungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left">Benutzer</th>
                        <th className="px-4 py-2 text-left">Rolle</th>
                        <th className="px-4 py-2 text-left">Abteilung</th>
                        <th className="px-4 py-2 text-center">Anzahl Berechtigungen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedUserStatistics.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50">
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.role}</td>
                          <td className="px-4 py-2">{user.department}</td>
                          <td className="px-4 py-2 text-center">{user.permissionCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData(departmentStatistics, "department_statistics")}
              disabled={!hasDepartmentData}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </Button>
          </div>

          {!hasDepartmentData ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Keine Abteilungsdaten verfügbar. Fügen Sie Abteilungen hinzu, um Statistiken zu sehen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                    Durchschnittliche Berechtigungen pro Abteilung
                  </CardTitle>
                  <CardDescription>Durchschnittliche Anzahl der Berechtigungen pro Mitarbeiter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentStatistics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                        <XAxis dataKey="name" stroke={chartTheme.textColor} />
                        <YAxis stroke={chartTheme.textColor} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkTheme ? "#1f2937" : "#ffffff",
                            borderColor: isDarkTheme ? "#374151" : "#e5e7eb",
                            color: chartTheme.textColor,
                          }}
                        />
                        <Legend wrapperStyle={{ color: chartTheme.textColor }} />
                        <Bar dataKey="avgPermissions" name="Durchschnitt Berechtigungen" fill={COLORS[4]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Mitarbeiter pro Abteilung
                  </CardTitle>
                  <CardDescription>Anzahl der Mitarbeiter in jeder Abteilung</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentStatistics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                        <XAxis dataKey="name" stroke={chartTheme.textColor} />
                        <YAxis stroke={chartTheme.textColor} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkTheme ? "#1f2937" : "#ffffff",
                            borderColor: isDarkTheme ? "#374151" : "#e5e7eb",
                            color: chartTheme.textColor,
                          }}
                        />
                        <Legend wrapperStyle={{ color: chartTheme.textColor }} />
                        <Bar dataKey="employeeCount" name="Anzahl Mitarbeiter" fill={COLORS[2]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {hasDepartmentData && (
            <Card>
              <CardHeader>
                <CardTitle>Detaillierte Abteilungsstatistiken</CardTitle>
                <CardDescription>Vollständige Liste aller Abteilungen und deren Statistiken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left">Abteilung</th>
                        <th className="px-4 py-2 text-center">Anzahl Mitarbeiter</th>
                        <th className="px-4 py-2 text-center">Gesamtberechtigungen</th>
                        <th className="px-4 py-2 text-center">Durchschnitt pro Mitarbeiter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {departmentStatistics.map((dept) => (
                        <tr key={dept.id} className="hover:bg-muted/50">
                          <td className="px-4 py-2">{dept.name}</td>
                          <td className="px-4 py-2 text-center">{dept.employeeCount}</td>
                          <td className="px-4 py-2 text-center">{dept.totalPermissions}</td>
                          <td className="px-4 py-2 text-center">{dept.avgPermissions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
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
