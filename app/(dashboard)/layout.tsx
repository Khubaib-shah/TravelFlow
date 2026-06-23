"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarStore } from "@/store/sidebar.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex h-screen w-full bg-[var(--tf-bg)]">
      <Sidebar />
      <div 
        className={`flex flex-col flex-1 transition-all duration-300 ease-out ${
          isOpen ? "ml-[var(--tf-sidebar-width)]" : "ml-[var(--tf-sidebar-collapsed-width)]"
        }`}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[var(--tf-bg)] p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
