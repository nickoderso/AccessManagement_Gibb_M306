import { UserProfile } from "@/components/user-profile"
import { SidebarWrapper } from "@/components/sidebar-new"
import { AuthGuard } from "@/components/auth-guard"

export default function ProfilePage() {
  return (
    <AuthGuard>
      <SidebarWrapper>
        <div className="p-6 bg-background min-h-screen">
          <h1 className="text-2xl font-bold mb-6 text-foreground">Mein Profil</h1>
          <UserProfile />
        </div>
      </SidebarWrapper>
    </AuthGuard>
  )
}
