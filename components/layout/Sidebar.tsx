"use client";

import { useSidebarStore } from "@/store/sidebar.store";
import { SidebarNav } from "./SidebarNav";
import { Plane, PanelLeftClose, PanelRightClose, Building, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Sidebar() {
  const { isOpen, toggle } = useSidebarStore();
  const [isAgencyOpen, setIsAgencyOpen] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--tf-border)] bg-[var(--tf-sidebar-bg)] transition-all duration-300 ease-out ${
        isOpen ? "w-[var(--tf-sidebar-width)]" : "w-[var(--tf-sidebar-collapsed-width)]"
      }`}
    >
      {/* Logo Area */}
      <div className="flex h-[var(--tf-topbar-height)] shrink-0 items-center justify-between border-b border-[var(--tf-border)] px-4">
        <Link href="/dashboard" className={`flex items-center gap-2 ${!isOpen && "justify-center w-full"}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--tf-primary)] text-white">
            <Plane className="h-5 w-5" />
          </div>
          {isOpen && <span className="tf-h4 text-[var(--tf-text-primary)]">TravelFlow</span>}
        </Link>
        {isOpen && (
          <button
            onClick={toggle}
            className="rounded-md p-1.5 text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)] transition-colors"
            aria-label="Collapse Sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* When Collapsed, show expand button here occasionally, or just rely on Topbar hamburger */}
      {!isOpen && (
        <div className="flex justify-center p-2 border-b border-[var(--tf-border)]">
           <button
            onClick={toggle}
            className="rounded-md p-2 text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)] transition-colors"
            aria-label="Expand Sidebar"
          >
            <PanelRightClose className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Agency Switcher */}
      <div className={`border-b border-[var(--tf-border)] ${isOpen ? "p-4" : "p-2"}`}>
        <button 
          onClick={() => setIsAgencyOpen(!isAgencyOpen)}
          className={`flex w-full items-center gap-3 rounded-lg border border-[var(--tf-border)] bg-[var(--tf-surface)] p-2 hover:bg-[var(--tf-surface-2)] transition-colors ${!isOpen && "justify-center"}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--tf-primary-soft)] text-[var(--tf-primary)]">
            <Building className="h-4 w-4" />
          </div>
          {isOpen && (
            <>
              <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                <span className="tf-body-sm w-full truncate font-semibold text-[var(--tf-text-primary)]">Prestige Travel HQ</span>
                <span className="tf-caption w-full truncate text-[var(--tf-text-muted)]">Karachi</span>
              </div>
              <ChevronDown className="h-4 w-4 text-[var(--tf-text-muted)] shrink-0" />
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-4">
        <SidebarNav isOpen={isOpen} />
      </div>

      {/* User Profile */}
      <div className="border-t border-[var(--tf-border)] p-4">
        <div className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}>
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[var(--tf-surface-2)] border border-[var(--tf-border)] flex items-center justify-center font-semibold text-[var(--tf-text-secondary)]">
            AK
          </div>
          {isOpen && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="tf-body-sm truncate font-semibold text-[var(--tf-text-primary)]">Ahmad Khan</span>
              <span className="tf-caption truncate text-[var(--tf-text-muted)]">Agency Owner</span>
            </div>
          )}
          {isOpen && (
            <button className="shrink-0 rounded-md p-2 text-[var(--tf-text-muted)] hover:bg-[var(--tf-danger-soft)] hover:text-[var(--tf-danger)] transition-colors" aria-label="Sign Out">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
