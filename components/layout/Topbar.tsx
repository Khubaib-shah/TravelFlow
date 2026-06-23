"use client";

import { useSidebarStore } from "@/store/sidebar.store";
import { Breadcrumbs } from "./Breadcrumbs";
import { SearchCommand } from "./SearchCommand";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserMenu } from "./UserMenu";
import { Focus, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Topbar() {
  const { toggle, isOpen, setIsOpen } = useSidebarStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const handleFocusMode = () => {
    const next = !isFocusMode;
    setIsFocusMode(next);
    // Focus mode collapses the sidebar to give maximum working space
    setIsOpen(!next);
    toast(next ? "Focus mode enabled — sidebar collapsed" : "Focus mode off", {
      icon: next ? "🎯" : "↩️",
      duration: 2000,
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[var(--tf-topbar-height)] shrink-0 items-center gap-4 border-b border-[var(--tf-border)] bg-[var(--tf-header-bg)] px-4 sm:px-6 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="lg:hidden rounded-md p-2 text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)] transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-1 items-center justify-center lg:justify-start lg:pl-8 xl:justify-center">
        <SearchCommand />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Focus Mode */}
        <button
          onClick={handleFocusMode}
          className={`hidden sm:flex rounded-md p-2 transition-colors ${
            isFocusMode
              ? "bg-[var(--tf-primary-soft)] text-[var(--tf-primary)]"
              : "text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)]"
          }`}
          aria-label="Toggle Focus Mode"
          title="Focus Mode — collapses sidebar"
        >
          <Focus className="h-5 w-5" />
        </button>

        <NotificationsDropdown />

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-md p-2 text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)] transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        <div className="ml-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
