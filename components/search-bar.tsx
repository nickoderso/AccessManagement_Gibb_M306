"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useOrgStore } from "@/lib/store"
import { EntityType } from "@/lib/types"
import { useNotification } from "@/components/notification-provider"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { entities, setActiveView } = useOrgStore()
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; type: EntityType; role?: string }>
  >([])
  const searchRef = useRef<HTMLDivElement>(null)
  const { showNotification } = useNotification()

  // Handle search results
  useEffect(() => {
    if (value.length >= 2) {
      const results = entities
        .filter(
          (entity) =>
            entity.name.toLowerCase().includes(value.toLowerCase()) ||
            (entity.role && entity.role.toLowerCase().includes(value.toLowerCase())),
        )
        .slice(0, 5) // Limit to 5 results

      setSearchResults(results)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [value, entities])

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleResultClick = (entityType: EntityType) => {
    setShowResults(false)

    // Set the appropriate view based on entity type
    if (entityType === EntityType.EMPLOYEE) {
      setActiveView(ViewType.USERS)
      showNotification({
        title: "Ansicht gewechselt",
        message: "Zur Benutzeransicht gewechselt",
        type: "info",
        duration: 3000,
      })
    } else {
      setActiveView(ViewType.ORGANIZATION)
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
      <Input
        type="search"
        placeholder="Suche nach Mitarbeitern, Teams oder Rollen..."
        className="pl-10 pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      )}

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-secondary rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          <ul className="py-1">
            {searchResults.map((result) => (
              <li key={result.id}>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                  onClick={() => handleResultClick(result.type)}
                >
                  <div>
                    <span className="block text-sm">{result.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {getEntityTypeName(result.type)}
                      {result.role && ` • ${result.role}`}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function getEntityTypeName(type: EntityType): string {
  switch (type) {
    case EntityType.COMPANY:
      return "Unternehmen"
    case EntityType.SUBCOMPANY:
      return "Tochterunternehmen"
    case EntityType.DEPARTMENT:
      return "Abteilung"
    case EntityType.TEAM:
      return "Team"
    case EntityType.EMPLOYEE:
      return "Mitarbeiter"
    default:
      return ""
  }
}

enum ViewType {
  ORGANIZATION = "organization",
  USERS = "users",
  PERMISSIONS = "permissions",
  SETTINGS = "settings",
  HELP = "help",
}
