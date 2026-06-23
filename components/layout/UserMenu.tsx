"use client";

import { useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const displayName = user?.name ?? "Ahmad Khan";
  const displayEmail = user?.email ?? "ahmad@prestigetravel.com";
  const initials = user?.initials ?? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-[var(--tf-surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tf-primary)] focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="h-8 w-8 rounded-full bg-[var(--tf-primary-soft)] text-[var(--tf-primary)] flex items-center justify-center border border-[var(--tf-border)]">
          <span className="text-sm font-semibold">{initials}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-lg overflow-hidden z-50">
          <div className="border-b border-[var(--tf-border)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--tf-text-primary)]">{displayName}</p>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5 truncate">{displayEmail}</p>
          </div>
          <div className="p-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--tf-text-secondary)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)] transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </div>
          <div className="border-t border-[var(--tf-border)] p-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--tf-danger)] hover:bg-[var(--tf-danger-soft)] transition-colors"
            >
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
