"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarStore } from "@/store/sidebar.store";
import { useAuthStore } from "@/store/auth.store";

// Pages that are restricted by role
const ROLE_RESTRICTIONS: Record<string, string[]> = {
  "/dashboard": ["admin", "manager"],
  "/settings": ["admin", "manager"],
  "/users": ["admin", "manager"],
  "/roles": ["admin", "manager"],
  "/reports": ["admin", "manager"],
  "/expenses": ["admin", "manager"],
  "/branches": ["admin", "manager"],
  "/quotations": ["admin", "manager"],
};

function getRequiredRoles(path: string): string[] | null {
  // Check exact match first, then prefix match
  for (const [route, roles] of Object.entries(ROLE_RESTRICTIONS)) {
    if (path === route || path.startsWith(route + "/")) {
      return roles;
    }
  }
  return null; // No restriction
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebarStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    // Enforce role-based page access
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      // Redirect to leads page (agents' default landing page)
      router.replace("/leads");
    }
  }, [isAuthenticated, user, pathname, router]);

  // Don't render layout until auth is confirmed
  if (!isAuthenticated || !user) return null;

  // Check if current page is allowed for this user
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && !requiredRoles.includes(user.role)) return null;

  return (
    <div className="flex h-screen w-full bg-[var(--tf-bg)]">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-out ${
          isOpen
            ? "ml-[var(--tf-sidebar-width)]"
            : "ml-[var(--tf-sidebar-collapsed-width)]"
        }`}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[var(--tf-bg)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
