import { Dashboard } from "@/components/dashboard";
import { SidebarWrapper } from "@/components/sidebar-new";
import { NotificationProvider } from "@/components/notification-provider";
import { AuthGuard } from "@/components/auth-guard";
import React from "react";

export default function DashboardPage() {
  return (
    <AuthGuard children={undefined}>
      <NotificationProvider children={undefined}>
        <SidebarWrapper children={undefined}>
          <Dashboard />
        </SidebarWrapper>
      </NotificationProvider>
    </AuthGuard>
  );
}
