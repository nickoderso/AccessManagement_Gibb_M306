"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Check, Users } from "lucide-react"
import { getAllPermissions, PermissionCategory } from "@/lib/permissions-db"
import { useOrgStore } from "@/lib/store"
import { EntityType } from "@/lib/types"
import { useNotification } from "@/components/notification-provider"

// Define the permission template type
interface PermissionTemplate {
  id: string
  name: string
  description: string
  permissions: string[] // Permission IDs
  createdAt: Date
  updatedAt: Date
}

export function PermissionTemplates() {
  const { entities, addPermissionToEntity, removePermissionFromEntity, getEntityPermissions } = useOrgStore()
  const { showNotification } = useNotification()
  const [templates, setTemplates] = useState<PermissionTemplate[]>([])
  const [activeTab, setActiveTab] = useState("templates")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [newTemplate, setNewTemplate] = useState<{
    name: string
    description: string
    permissions: string[]
  }>({
    name: "",
    description: "",
    permissions: [],
  })

  // Get all permissions
  const allPermissions = getAllPermissions()

  // Get all employees (users)
  const employees = entities.filter((entity) => entity.type === EntityType.EMPLOYEE)

  // Load templates from localStorage on component mount
  useEffect(() => {
    const storedTemplates = localStorage.getItem("permissionTemplates")
    if (storedTemplates) {
      try {
        // Parse the stored templates and convert string dates back to Date objects
        const parsedTemplates = JSON.parse(storedTemplates).map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
        }))
        setTemplates(parsedTemplates)
      } catch (error) {
        console.error("Error parsing permission templates:", error)
      }
    } else {
      // Generate some sample templates if none exist
      generateSampleTemplates()
    }
  }, [])

  // Generate sample permission templates for demonstration
  const generateSampleTemplates = () => {
    if (allPermissions.length === 0) {
      return
    }

    const sampleTemplates: PermissionTemplate[] = [
      {
        id: `template_1`,
        name: "Basic User",
        description: "Standard permissions for regular users",
        permissions: allPermissions
          .filter((p) => p.category === PermissionCategory.FILE || p.category === PermissionCategory.USER)
          .slice(0, 3)
          .map((p) => p.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `template_2`,
        name: "IT Administrator",
        description: "Full system access for IT administrators",
        permissions: allPermissions
          .filter((p) => p.category === PermissionCategory.SYSTEM || p.category === PermissionCategory.NETWORK)
          .map((p) => p.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `template_3`,
        name: "Department Manager",
        description: "Permissions for department managers",
        permissions: allPermissions
          .filter((p) => p.category === PermissionCategory.USER || p.name.includes("Manager"))
          .slice(0, 5)
          .map((p) => p.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    setTemplates(sampleTemplates)

    // Save to localStorage
    localStorage.setItem("permissionTemplates", JSON.stringify(sampleTemplates))
  }

  // Create a new permission template
  const createTemplate = () => {
    if (!newTemplate.name.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Template name is required",
        type: "error",
      })
      return
    }

    if (newTemplate.permissions.length === 0) {
      showNotification({
        title: "Validation Error",
        message: "Please select at least one permission",
        type: "error",
      })
      return
    }

    const now = new Date()
    const template: PermissionTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplate.name.trim(),
      description: newTemplate.description.trim(),
      permissions: newTemplate.permissions,
      createdAt: now,
      updatedAt: now,
    }

    const updatedTemplates = [...templates, template]
    setTemplates(updatedTemplates)

    // Save to localStorage
    localStorage.setItem("permissionTemplates", JSON.stringify(updatedTemplates))

    // Reset form and close dialog
    setNewTemplate({
      name: "",
      description: "",
      permissions: [],
    })
    setIsCreateDialogOpen(false)

    showNotification({
      title: "Template Created",
      message: `Permission template "${template.name}" has been created`,
      type: "success",
    })
  }

  // Delete a permission template
  const deleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      const templateToDelete = templates.find((t) => t.id === templateId)
      const updatedTemplates = templates.filter((t) => t.id !== templateId)
      setTemplates(updatedTemplates)

      // Save to localStorage
      localStorage.setItem("permissionTemplates", JSON.stringify(updatedTemplates))

      showNotification({
        title: "Template Deleted",
        message: `Permission template "${templateToDelete?.name}" has been deleted`,
        type: "info",
      })
    }
  }

  // Apply a template to selected users
  const applyTemplateToUsers = () => {
    if (!selectedTemplate) return

    if (selectedUsers.length === 0) {
      showNotification({
        title: "Validation Error",
        message: "Please select at least one user",
        type: "error",
      })
      return
    }

    // For each selected user, apply the template permissions
    selectedUsers.forEach((userId) => {
      const user = employees.find((e) => e.id === userId)
      if (!user) return

      // Get current user permissions
      const currentPermissions = getEntityPermissions(userId)

      // Add template permissions that the user doesn't already have
      selectedTemplate.permissions.forEach((permissionId) => {
        if (!currentPermissions.includes(permissionId)) {
          addPermissionToEntity(userId, permissionId)
        }
      })
    })

    // Close dialog and reset selection
    setIsApplyDialogOpen(false)
    setSelectedUsers([])

    showNotification({
      title: "Template Applied",
      message: `Template "${selectedTemplate.name}" applied to ${selectedUsers.length} user(s)`,
      type: "success",
    })
  }

  // Toggle permission selection in new template form
  const togglePermission = (permissionId: string) => {
    setNewTemplate((prev) => {
      if (prev.permissions.includes(permissionId)) {
        return {
          ...prev,
          permissions: prev.permissions.filter((id) => id !== permissionId),
        }
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permissionId],
        }
      }
    })
  }

  // Toggle user selection when applying template
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Permission Templates</CardTitle>
              <CardDescription>Create and manage reusable permission sets</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="apply">Apply Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="m-0">
              {templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Permissions ({template.permissions.length})</div>
                          <div className="flex flex-wrap gap-1">
                            {template.permissions.slice(0, 5).map((permId) => {
                              const permission = allPermissions.find((p) => p.id === permId)
                              return permission ? (
                                <Badge key={permId} variant="outline">
                                  {permission.name}
                                </Badge>
                              ) : null
                            })}
                            {template.permissions.length > 5 && (
                              <Badge variant="outline">+{template.permissions.length - 5} more</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between text-xs text-gray-500">
                        <span>Created: {formatDate(template.createdAt)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setActiveTab("apply")
                          }}
                        >
                          <Users className="mr-2 h-4 w-4" /> Apply
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No permission templates found. Create your first template to get started.
                </div>
              )}
            </TabsContent>

            <TabsContent value="apply" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Select Template</h3>
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 rounded-md cursor-pointer border ${
                            selectedTemplate?.id === template.id
                              ? "border-primary bg-primary/10"
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{template.name}</div>
                            {selectedTemplate?.id === template.id && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {template.permissions.length} permissions
                          </div>
                        </div>
                      ))}
                    </div>

                    {templates.length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No templates available. Please create a template first.
                      </div>
                    )}

                    <Button
                      className="w-full mt-4"
                      disabled={!selectedTemplate}
                      onClick={() => setIsApplyDialogOpen(true)}
                    >
                      Apply to Users
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">{selectedTemplate.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{selectedTemplate.description}</p>

                      <div>
                        <h4 className="font-medium mb-2">Included Permissions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedTemplate.permissions.map((permId) => {
                            const permission = allPermissions.find((p) => p.id === permId)
                            return permission ? (
                              <div key={permId} className="flex items-center p-2 border rounded-md">
                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                <div>
                                  <div className="font-medium text-sm">{permission.name}</div>
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                </div>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="mb-2">Select a template to view details</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Permission Template</DialogTitle>
            <DialogDescription>
              Create a reusable set of permissions that can be applied to multiple users
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Name
              </Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Basic User, IT Admin"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Describe what this template is for"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Permissions</Label>
              <div className="col-span-3 border rounded-md p-4 max-h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {Object.values(PermissionCategory).map((category) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allPermissions
                          .filter((permission) => permission.category === category)
                          .map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={`perm-${permission.id}`}
                                checked={newTemplate.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label
                                  htmlFor={`perm-${permission.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Template to Users</DialogTitle>
            <DialogDescription>Select users to apply the "{selectedTemplate?.name}" template</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <Label className="mb-2 block">Select Users</Label>
              <div className="border rounded-md p-2 max-h-[300px] overflow-y-auto">
                {employees.length > 0 ? (
                  <div className="space-y-2">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                      >
                        <Checkbox
                          id={`user-${employee.id}`}
                          checked={selectedUsers.includes(employee.id)}
                          onCheckedChange={() => toggleUserSelection(employee.id)}
                        />
                        <Label htmlFor={`user-${employee.id}`} className="flex-1 cursor-pointer">
                          {employee.name}
                          {employee.role && <span className="ml-2 text-xs text-gray-500">({employee.role})</span>}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No users available</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>{selectedUsers.length} users selected</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUsers(employees.map((e) => e.id))}>
                Select All
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyTemplateToUsers} disabled={selectedUsers.length === 0}>
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
