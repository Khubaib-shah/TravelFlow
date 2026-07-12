"use client";

import { sidebarNav } from "@/constants/nav";
import { SidebarItem } from "./SidebarItem";
import { useAuthStore } from "@/store/auth.store";

interface SidebarNavProps {
  isOpen: boolean;
}

export function SidebarNav({ isOpen }: SidebarNavProps) {
  const { user } = useAuthStore();
  const role = user?.role || "agent";

  return (
    <nav className="flex flex-col gap-6 px-3">
      {sidebarNav.map((group, index) => {
        const filteredItems = group.items.filter((item) => {
          if (!item.roles) return true;
          return item.roles.includes(role);
        });

        if (filteredItems.length === 0) return null;

        return (
          <div key={index} className="flex flex-col gap-1">
            {isOpen && (
              <div className="mb-1 px-3">
                <span className="tf-overline text-tf-text-muted">
                  {group.label}
                </span>
              </div>
            )}
            {filteredItems.map((item) => (
              <SidebarItem key={item.href} item={item} isOpen={isOpen} />
            ))}
          </div>
        );
      })}
    </nav>
  );
}
