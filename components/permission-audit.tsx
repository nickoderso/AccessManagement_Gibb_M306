"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Filter, Search, User, Plus, Minus, RefreshCw } from "lucide-react"
import { useOrgStore } from "@/lib/store"
import { EntityType } from "@/lib/types"
import { getAllPermissions } from "@/lib/permissions-db"
import { useNotification } from "@/components/notification-provider"

// Define the audit log entry type
interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: "add" | "remove" | "modify"
  entityId: string
  entityName: string
  permissionId: string
  permissionName: string
}

export function PermissionAudit() {
  const { entities } = useOrgStore()
  const { showNotification } = useNotification()
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("recent")

  // Get all permissions
  const allPermissions = getAllPermissions()

  // Get all employees (users)
  const employees = entities.filter((entity) => entity.type === EntityType.EMPLOYEE)

  // Load audit logs from localStorage on component mount
  useEffect(() => {
    const storedLogs = localStorage.getItem("permissionAuditLogs")
    if (storedLogs) {
      try {
        // Parse the stored logs and convert string timestamps back to Date objects
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }))
        setAuditLogs(parsedLogs)
      } catch (error) {
        console.error("Error parsing audit logs:", error)
      }
    } else {
      // Generate some sample audit logs if none exist
      generateSampleLogs()
    }
  }, [])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let filtered = [...auditLogs]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(term) ||
          log.entityName.toLowerCase().includes(term) ||
          log.permissionName.toLowerCase().includes(term),
      )
    }

    // Apply action filter
    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.action === filterAction)
    }

    // Apply user filter
    if (filterUser !== "all") {
      filtered = filtered.filter((log) => log.userId === filterUser)
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setFilteredLogs(filtered)
  }, [auditLogs, searchTerm, filterAction, filterUser])

  // Generate sample audit logs for demonstration
  const generateSampleLogs = () => {
    if (employees.length === 0 || allPermissions.length === 0) {
      return
    }

    const sampleLogs: AuditLogEntry[] = []

    // Generate 20 sample logs
    for (let i = 0; i < 20; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)]
      const permission = allPermissions[Math.floor(Math.random() * allPermissions.length)]
      const action = ["add", "remove", "modify"][Math.floor(Math.random() * 3)] as "add" | "remove" | "modify"

      // Create a random date within the last 30 days
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))

      sampleLogs.push({
        id: `log_${i}_${Date.now()}`,
        timestamp: date,
        userId: employee.id,
        userName: employee.name,
        action: action,
        entityId: employee.id,
        entityName: employee.name,
        permissionId: permission.id,
        permissionName: permission.name,
      })
    }

    // Sort by timestamp (newest first)
    sampleLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setAuditLogs(sampleLogs)

    // Save to localStorage
    localStorage.setItem("permissionAuditLogs", JSON.stringify(sampleLogs))
  }

  // Add a new audit log entry
  const addAuditLogEntry = (entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log_${Date.now()}`,
      timestamp: new Date(),
    }

    const updatedLogs = [newEntry, ...auditLogs]
    setAuditLogs(updatedLogs)

    // Save to localStorage
    localStorage.setItem("permissionAuditLogs", JSON.stringify(updatedLogs))

    return newEntry
  }

  // Clear all audit logs
  const clearAuditLogs = () => {
    if (confirm("Are you sure you want to clear all audit logs? This action cannot be undone.")) {
      setAuditLogs([])
      localStorage.removeItem("permissionAuditLogs")
      showNotification({
        title: "Audit Logs Cleared",
        message: "All permission audit logs have been cleared.",
        type: "info",
      })
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get action badge color
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "add":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "remove":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "modify":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case "add":
        return <Plus className="h-4 w-4" />
      case "remove":
        return <Minus className="h-4 w-4" />
      case "modify":
        return <RefreshCw className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Permission Audit Log</CardTitle>
            <CardDescription>Track changes to user permissions over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateSampleLogs}>
              Generate Sample Data
            </Button>
            <Button variant="destructive" size="sm" onClick={clearAuditLogs}>
              Clear Logs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="all">All Logs</TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8 w-full md:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-[130px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Action</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="add">Added</SelectItem>
                    <SelectItem value="remove">Removed</SelectItem>
                    <SelectItem value="modify">Modified</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger className="w-[130px]">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>User</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="recent" className="m-0">
            {filteredLogs.slice(0, 10).length > 0 ? (
              <div className="space-y-4">
                {filteredLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getActionBadgeColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {log.action === "add" && "Permission Added"}
                            {log.action === "remove" && "Permission Removed"}
                            {log.action === "modify" && "Permission Modified"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{log.userName}</span>{" "}
                            {log.action === "add"
                              ? "was granted"
                              : log.action === "remove"
                                ? "had removed"
                                : "had modified"}{" "}
                            the <span className="font-medium">{log.permissionName}</span> permission
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No recent activity found.</div>
            )}
          </TabsContent>

          <TabsContent value="all" className="m-0">
            {filteredLogs.length > 0 ? (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getActionBadgeColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {log.action === "add" && "Permission Added"}
                            {log.action === "remove" && "Permission Removed"}
                            {log.action === "modify" && "Permission Modified"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{log.userName}</span>{" "}
                            {log.action === "add"
                              ? "was granted"
                              : log.action === "remove"
                                ? "had removed"
                                : "had modified"}{" "}
                            the <span className="font-medium">{log.permissionName}</span> permission
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No audit logs found.</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
