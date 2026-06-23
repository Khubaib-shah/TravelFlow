"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-md p-2 text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-[var(--tf-danger)]"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 rounded-lg border border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between border-b border-[var(--tf-border)] px-4 py-3">
            <span className="font-semibold text-[var(--tf-text-primary)]">Notifications</span>
            <span className="text-xs text-[var(--tf-primary)] cursor-pointer hover:underline">Mark all as read</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-0">
            <div className="px-4 py-3 border-b border-[var(--tf-border)] hover:bg-[var(--tf-surface-2)] cursor-pointer">
              <p className="text-sm font-medium text-[var(--tf-text-primary)]">New lead assigned to you</p>
              <p className="text-xs text-[var(--tf-text-muted)] mt-1">2 minutes ago</p>
            </div>
            <div className="px-4 py-3 border-b border-[var(--tf-border)] hover:bg-[var(--tf-surface-2)] cursor-pointer">
              <p className="text-sm font-medium text-[var(--tf-text-primary)]">Booking BK-2024-001 confirmed</p>
              <p className="text-xs text-[var(--tf-text-muted)] mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}
