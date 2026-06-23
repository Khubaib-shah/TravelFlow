"use client";

import { useSidebarStore } from "@/store/sidebar.store";
import { Breadcrumbs } from "./Breadcrumbs";
import { SearchCommand } from "./SearchCommand";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserMenu } from "./UserMenu";
import { Maximize, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

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
        <button className="hidden sm:flex rounded-md p-2 text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)] transition-colors" aria-label="Fullscreen">
          <Maximize className="h-5 w-5" />
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
