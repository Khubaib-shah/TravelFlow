"use client";

import { useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-[var(--tf-surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tf-primary)] focus:ring-offset-2"
        aria-label="User menu"
      >
        <div className="h-8 w-8 rounded-full bg-[var(--tf-primary-soft)] text-[var(--tf-primary)] flex items-center justify-center border border-[var(--tf-border)]">
          <span className="text-sm font-semibold">AK</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-lg overflow-hidden z-50">
          <div className="border-b border-[var(--tf-border)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--tf-text-primary)]">Ahmad Khan</p>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5 truncate">ahmad@prestigetravel.com</p>
          </div>
          <div className="p-1">
            <Link href="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--tf-text-secondary)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)]">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--tf-text-secondary)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)]">
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </div>
          <div className="border-t border-[var(--tf-border)] p-1">
            <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--tf-danger)] hover:bg-[var(--tf-danger-soft)]">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}
