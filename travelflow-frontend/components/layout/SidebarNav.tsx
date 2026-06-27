"use client";

import { sidebarNav } from "@/constants/nav";
import { SidebarItem } from "./SidebarItem";

interface SidebarNavProps {
  isOpen: boolean;
}

export function SidebarNav({ isOpen }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-6 px-3">
      {sidebarNav.map((group, index) => (
        <div key={index} className="flex flex-col gap-1">
          {isOpen && (
            <div className="mb-1 px-3">
              <span className="tf-overline text-[var(--tf-text-muted)]">{group.label}</span>
            </div>
          )}
          {group.items.map((item) => (
            <SidebarItem key={item.href} item={item} isOpen={isOpen} />
          ))}
        </div>
      ))}
    </nav>
  );
}
