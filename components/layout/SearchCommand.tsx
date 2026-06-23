"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
// Would integrate with cmdk here. For Phase 1, just the trigger button.

export function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const router = import("next/navigation").then(m => m.useRouter);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleAction = (href: string) => {
    setIsOpen(false);
    window.location.href = href;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-lg border border-[var(--tf-border)] bg-[var(--tf-surface-2)] px-3 text-sm text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface)] transition-colors hover:border-[var(--tf-border-strong)]"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search in TravelFlow...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-1.5 font-mono text-[10px] font-medium text-[var(--tf-text-secondary)]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[10vh] backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-[600px] rounded-xl bg-[var(--tf-surface)] shadow-2xl border border-[var(--tf-border)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center border-b border-[var(--tf-border)] px-4 py-3">
              <Search className="h-5 w-5 text-[var(--tf-text-muted)] mr-3" />
              <input 
                autoFocus
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command or search..." 
                className="flex-1 bg-transparent text-[var(--tf-text-primary)] outline-none placeholder-[var(--tf-text-muted)] tf-body"
              />
              <kbd className="ml-2 inline-flex h-6 items-center gap-1 rounded bg-[var(--tf-surface-2)] px-2 font-mono text-[10px] font-medium text-[var(--tf-text-muted)] cursor-pointer" onClick={() => setIsOpen(false)}>
                ESC
              </kbd>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-[var(--tf-text-muted)]">QUICK ACTIONS</div>
              <div 
                className="px-2 py-2 text-sm text-[var(--tf-text-primary)] hover:bg-[var(--tf-primary-soft)] hover:text-[var(--tf-primary)] rounded-md cursor-pointer flex items-center gap-2"
                onClick={() => handleAction("/bookings")}
              >
                Create New Booking
              </div>
              <div 
                className="px-2 py-2 text-sm text-[var(--tf-text-primary)] hover:bg-[var(--tf-primary-soft)] hover:text-[var(--tf-primary)] rounded-md cursor-pointer flex items-center gap-2"
                onClick={() => handleAction("/leads")}
              >
                Add New Lead
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
