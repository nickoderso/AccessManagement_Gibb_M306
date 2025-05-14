"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowRight, RefreshCw } from "lucide-react"
import { useOrgStore } from "@/lib/store"
import { EntityType } from "@/lib/types"
import { getAllPermissions, PermissionCategory } from "@/lib/permissions-db"
import { useNotification } from "@/components/notification-provider"
import { CopyUserDialog } from "@/components/copy-user-dialog"
import { Copy } from "lucide-react"
import type { Entity } from "@/lib/types"

export function PermissionComparison() {
  const { entities, getEntityPermissions, addPermissionToEntity, removePermissionFromEntity } = useOrgStore()
  const { showNotification } = useNotification()
  const [user1Id, setUser1Id] = useState<string>("")
  const [user2Id, setUser2Id] = useState<string>("")
  const [user1Permissions, setUser1Permissions] = useState<string[]>([])
  const [user2Permissions, setUser2Permissions] = useState<string[]>([])
  const [copyEntity, setCopyEntity] = useState<Entity | null>(null)

  // Get all permissions
  const allPermissions = getAllPermissions()

  // Get all employees (users)
  const employees = entities.filter((entity) => entity.type === EntityType.EMPLOYEE)

  // Update permissions when users are selected
  useEffect(() => {
    if (user1Id) {
      setUser1Permissions(getEntityPermissions(user1Id))
    } else {
      setUser1Permissions([])
    }

    if (user2Id) {
      setUser2Permissions(getEntityPermissions(user2Id))
    } else {
      setUser2Permissions([])
    }
  }, [user1Id, user2Id, getEntityPermissions])

  // Get unique permissions between both users
  const getUniquePermissions = () => {
    const allPermissionIds = [...new Set([...user1Permissions, ...user2Permissions])]
    return allPermissionIds
      .map((id) => {
        const permission = allPermissions.find((p) => p.id === id)
        if (!permission) return null

        return {
          ...permission,
          user1Has: user1Permissions.includes(id),
          user2Has: user2Permissions.includes(id),
        }
      })
      .filter(Boolean)
  }

  // Group permissions by category
  const getPermissionsByCategory = () => {
    const uniquePermissions = getUniquePermissions()
    const categories = Object.values(PermissionCategory).reduce(
      (acc, category) => {
        acc[category] = uniquePermissions.filter((p) => p?.category === category)
        return acc
      },
      {} as Record<string, any[]>,
    )

    return categories
  }

  // Copy permissions from one user to another
  const copyPermissions = (fromUserId: string, toUserId: string, permissionIds: string[]) => {
    if (!fromUserId || !toUserId) return

    const fromUser = employees.find((e) => e.id === fromUserId)
    const toUser = employees.find((e) => e.id === toUserId)

    if (!fromUser || !toUser) return

    // Apply permissions
    permissionIds.forEach((permId) => {
      addPermissionToEntity(toUserId, permId)
    })

    // Update the state
    if (toUserId === user1Id) {
      setUser1Permissions(getEntityPermissions(toUserId))
    } else {
      setUser2Permissions(getEntityPermissions(toUserId))
    }

    showNotification({
      title: "Permissions Copied",
      message: `Copied ${permissionIds.length} permissions from ${fromUser.name} to ${toUser.name}`,
      type: "success",
    })
  }

  // Sync all permissions between users
  const syncAllPermissions = (fromUserId: string, toUserId: string) => {
    if (!fromUserId || !toUserId) return

    const fromUser = employees.find((e) => e.id === fromUserId)
    const toUser = employees.find((e) => e.id === toUserId)

    if (!fromUser || !toUser) return

    const fromPermissions = fromUserId === user1Id ? user1Permissions : user2Permissions
    const toPermissions = toUserId === user1Id ? user1Permissions : user2Permissions

    // Find permissions to add (in fromUser but not in toUser)
    const permissionsToAdd = fromPermissions.filter((id) => !toPermissions.includes(id))

    // Apply permissions
    permissionsToAdd.forEach((permId) => {
      addPermissionToEntity(toUserId, permId)
    })

    // Update the state
    if (toUserId === user1Id) {
      setUser1Permissions(getEntityPermissions(toUserId))
    } else {
      setUser2Permissions(getEntityPermissions(toUserId))
    }

    showNotification({
      title: "Permissions Synchronized",
      message: `Added ${permissionsToAdd.length} permissions from ${fromUser.name} to ${toUser.name}`,
      type: "success",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Comparison</CardTitle>
        <CardDescription>Compare permissions between users and identify differences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>User 1</Label>
              <Select value={user1Id} onValueChange={setUser1Id}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id} disabled={employee.id === user2Id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {user1Id && (
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{employees.find((e) => e.id === user1Id)?.name}</span>
                  <Badge variant="outline">{user1Permissions.length} permissions</Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  {user1Permissions.length > 0 && user2Id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => syncAllPermissions(user1Id, user2Id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" /> Copy All to User 2
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const user = employees.find((e) => e.id === user1Id)
                      if (user) {
                        setCopyEntity(user)
                      }
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy User
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>User 2</Label>
              <Select value={user2Id} onValueChange={setUser2Id}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id} disabled={employee.id === user1Id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {user2Id && (
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{employees.find((e) => e.id === user2Id)?.name}</span>
                  <Badge variant="outline">{user2Permissions.length} permissions</Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  {user2Permissions.length > 0 && user1Id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => syncAllPermissions(user2Id, user1Id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" /> Copy All to User 1
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const user = employees.find((e) => e.id === user2Id)
                      if (user) {
                        setCopyEntity(user)
                      }
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy User
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {user1Id && user2Id && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Permission Comparison</h3>

            <div className="grid grid-cols-1 gap-6">
              {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => {
                if (permissions.length === 0) return null

                return (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="px-4 py-2 text-left font-medium text-sm">Permission</th>
                            <th className="px-4 py-2 text-center font-medium text-sm w-[100px]">User 1</th>
                            <th className="px-4 py-2 text-center font-medium text-sm w-[100px]">User 2</th>
                            <th className="px-4 py-2 text-center font-medium text-sm w-[100px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {permissions.map((permission) => (
                            <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3">
                                <div className="font-medium text-sm">{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permission.user1Has ? (
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permission.user2Has ? (
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center space-x-1">
                                  {permission.user1Has && !permission.user2Has && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => copyPermissions(user1Id, user2Id, [permission.id])}
                                      title="Copy to User 2"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {!permission.user1Has && permission.user2Has && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 rotate-180"
                                      onClick={() => copyPermissions(user2Id, user1Id, [permission.id])}
                                      title="Copy to User 1"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {permission.user1Has && permission.user2Has && (
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-500" disabled>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setUser1Permissions(getEntityPermissions(user1Id))
                  setUser2Permissions(getEntityPermissions(user2Id))
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Comparison
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {copyEntity && <CopyUserDialog isOpen={!!copyEntity} onClose={() => setCopyEntity(null)} entity={copyEntity} />}
    </Card>
  )
}

function Label({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`font-medium text-sm ${className || ""}`} {...props}>
      {children}
    </div>
  )
}
