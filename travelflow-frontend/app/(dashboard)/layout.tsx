"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarStore } from "@/store/sidebar.store";
import { useAuthStore } from "@/store/auth.store";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Button } from "@/components/ui/button";

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
  const { user, isAuthenticated, isLoading, serverError } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (serverError) return;
    if (isLoading) return; // Wait for initial auth check

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
  }, [isAuthenticated, user, isLoading, pathname, router, serverError]);

  // Show server error state if backend is down
  if (serverError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--tf-bg)]">
        <div className="text-tf-text-primary flex flex-col items-center gap-4 text-center max-w-md p-6">
          <div className="w-16 h-16 bg-[var(--tf-danger)]/10 text-[var(--tf-danger)] rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Server Offline</h2>
          <p className="text-tf-text-secondary">{serverError}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-tf-primary text-white hover:bg-tf-primary-hover">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Don't render layout until auth is confirmed, but show a spinner instead of blank page
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--tf-bg)]">
        <div className="text-tf-text-secondary flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-tf-primary border-t-transparent"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
