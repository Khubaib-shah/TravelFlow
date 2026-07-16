"use client";

import { NavItem } from "@/constants/nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  item: NavItem;
  isOpen: boolean;
}

export function SidebarItem({ item, isOpen }: SidebarItemProps) {
  const pathname = usePathname();
  // Simple active check: if pathname starts with item.href, it's active
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ease-out hover:bg-tf-surface-2 ${isActive
          ? "bg-[var(--tf-sidebar-active)] text-[var(--tf-sidebar-active-text)] font-semibold border-l-[3px] border-[var(--tf-sidebar-accent)] rounded-l-none pl-[9px]"
          : "text-[var(--tf-sidebar-text)]"
        }`}
      title={!isOpen ? item.title : undefined}
    >
      <item.icon
        className={`h-5 w-5 shrink-0 ${isActive ? "text-[var(--tf-sidebar-active-text)]" : "text-tf-text-muted group-hover:text-tf-text-primary transition-colors"}`}
      />

      {isOpen && (
        <span className="flex-1 truncate tf-body-sm">{item.title}</span>
      )}

      {isOpen && item.badge && (
        <span className="shrink-0 rounded-full bg-tf-primary px-2 py-0.5 text-[10px] font-bold text-white leading-tight">
          {item.badge}
        </span>
      )}

      {/* Tooltip for collapsed state could go here, but native title attr is used above for simplicity in Phase 1 */}
    </Link>
  );
}
