export enum EntityType {
  COMPANY = "company",
  SUBCOMPANY = "subcompany",
  DEPARTMENT = "department",
  TEAM = "team",
  EMPLOYEE = "employee",
}

export interface Entity {
  id: string
  name: string
  type: EntityType
  parentId: string | null
  role?: string
  permissions?: string[] // IDs der Berechtigungen
  metadata?: Record<string, any> // Zusätzliche Metadaten für erweiterte Benutzerinformationen
}

export interface View {
  id: string
  name: string
  icon: string
}

export enum ViewType {
  ORGANIZATION = "organization",
  USERS = "users",
  PERMISSIONS = "permissions",
  STATISTICS = "statistics",
  SETTINGS = "settings",
  HELP = "help",
}
