"use client";

import { Search, LayoutDashboard, UserPlus, Users, Plane, Building2, CreditCard, BarChart3, GitBranch, UserCog, Settings, Plus, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withCreateDrawer } from "@/constants/create-drawer";
import { useCreateDrawerStore } from "@/store/create-drawer.store";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
  keywords?: string[];
}

export function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const requestCreateDrawer = useCreateDrawerStore((state) => state.requestOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((href: string) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(href);
  }, [router]);

  const navigateAndCreate = useCallback((href: string) => {
    setIsOpen(false);
    setSearchQuery("");
    requestCreateDrawer();
    router.push(withCreateDrawer(href));
  }, [router, requestCreateDrawer]);

  const allItems: CommandItem[] = [
    // Navigation
    { id: "nav-dashboard", label: "Dashboard", description: "Overview and KPIs", icon: LayoutDashboard, action: () => navigate("/dashboard"), group: "Navigate", keywords: ["home", "overview"] },
    { id: "nav-leads", label: "Leads", description: "Sales pipeline", icon: UserPlus, action: () => navigate("/leads"), group: "Navigate", keywords: ["pipeline", "crm"] },
    { id: "nav-customers", label: "Customers", description: "Customer database", icon: Users, action: () => navigate("/customers"), group: "Navigate", keywords: ["clients"] },
    { id: "nav-bookings", label: "Bookings", description: "Flight & package bookings", icon: Plane, action: () => navigate("/bookings"), group: "Navigate", keywords: ["flights", "tickets", "pnr"] },
    { id: "nav-suppliers", label: "Suppliers", description: "B2B partners & airlines", icon: Building2, action: () => navigate("/suppliers"), group: "Navigate", keywords: ["vendors", "airlines"] },
    { id: "nav-expenses", label: "Expenses", description: "Operational costs", icon: CreditCard, action: () => navigate("/expenses"), group: "Navigate", keywords: ["costs", "finance"] },
    { id: "nav-reports", label: "Reports", description: "Analytics & insights", icon: BarChart3, action: () => navigate("/reports"), group: "Navigate", keywords: ["analytics"] },
    { id: "nav-branches", label: "Branches", description: "Office locations", icon: GitBranch, action: () => navigate("/branches"), group: "Navigate", keywords: ["offices"] },
    { id: "nav-users", label: "Users", description: "Staff management", icon: UserCog, action: () => navigate("/users"), group: "Navigate", keywords: ["agents", "staff"] },
    { id: "nav-settings", label: "Settings", description: "System configuration", icon: Settings, action: () => navigate("/settings"), group: "Navigate", keywords: ["config", "preferences"] },
    // Quick Actions
    { id: "act-new-lead", label: "Add New Lead", description: "Create a lead inquiry", icon: Plus, action: () => navigateAndCreate("/leads"), group: "Quick Actions", keywords: ["create lead", "new lead"] },
    { id: "act-new-customer", label: "Add Customer", description: "Register a new customer", icon: Plus, action: () => navigateAndCreate("/customers"), group: "Quick Actions", keywords: ["create customer", "new customer"] },
    { id: "act-new-booking", label: "Create Booking", description: "New flight/package booking", icon: Plus, action: () => navigateAndCreate("/bookings"), group: "Quick Actions", keywords: ["new booking", "flight"] },
    { id: "act-new-supplier", label: "Add Supplier", description: "Register a B2B partner", icon: Plus, action: () => navigateAndCreate("/suppliers"), group: "Quick Actions", keywords: ["new supplier", "vendor"] },
    { id: "act-new-expense", label: "Log Expense", description: "Record an operational cost", icon: Plus, action: () => navigateAndCreate("/expenses"), group: "Quick Actions", keywords: ["add expense", "new expense"] },
  ];

  const filtered = searchQuery.trim()
    ? allItems.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.keywords?.some(k => k.includes(q))
        );
      })
    : allItems;

  // Group filtered items
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatFiltered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && flatFiltered[selectedIndex]) {
        flatFiltered[selectedIndex].action();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, flatFiltered, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  let globalIndex = 0;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-lg border-[var(--tf-border)] bg-[var(--tf-surface-2)] px-3 text-sm font-normal text-[var(--tf-text-muted)] hover:bg-[var(--tf-surface)] hover:border-[var(--tf-border-strong)] normal-case tracking-normal justify-start"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">Search or jump to...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-1.5 font-mono text-[10px] font-medium text-[var(--tf-text-secondary)]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[8vh] backdrop-blur-sm"
          onClick={() => { setIsOpen(false); setSearchQuery(""); }}
        >
          <div
            className="w-full max-w-[620px] rounded-xl bg-[var(--tf-surface)] shadow-2xl border border-[var(--tf-border)] overflow-hidden mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-[var(--tf-border)] px-4 py-3">
              <Search className="h-5 w-5 text-[var(--tf-text-muted)] mr-3 shrink-0" />
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or type a command..."
                className="flex-1 border-0 bg-transparent shadow-none text-[var(--tf-text-primary)] placeholder:text-[var(--tf-text-muted)] text-sm focus-visible:ring-0"
                aria-label="Command search"
              />
              <kbd
                className="ml-2 inline-flex h-6 items-center gap-1 rounded bg-[var(--tf-surface-2)] px-2 font-mono text-[10px] font-medium text-[var(--tf-text-muted)] cursor-pointer hover:bg-[var(--tf-border)]"
                onClick={() => { setIsOpen(false); setSearchQuery(""); }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[420px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--tf-text-muted)]">
                  No results for "{searchQuery}"
                </div>
              ) : (
                Object.entries(groups).map(([groupName, items]) => (
                  <div key={groupName} className="mb-3">
                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--tf-text-muted)]">
                      {groupName}
                    </div>
                    {items.map((item) => {
                      const idx = globalIndex++;
                      const isSelected = idx === selectedIndex;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          data-index={idx}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                            isSelected
                              ? "bg-[var(--tf-primary)] text-white"
                              : "text-[var(--tf-text-primary)] hover:bg-[var(--tf-surface-2)]"
                          }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                            isSelected ? "bg-white/20 text-white" : "bg-[var(--tf-surface-2)] text-[var(--tf-text-secondary)]"
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-[var(--tf-text-primary)]"}`}>
                              {item.label}
                            </div>
                            {item.description && (
                              <div className={`text-xs truncate ${isSelected ? "text-white/70" : "text-[var(--tf-text-muted)]"}`}>
                                {item.description}
                              </div>
                            )}
                          </div>
                          <ArrowRight className={`h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? "text-white opacity-100" : "text-[var(--tf-text-muted)]"}`} />
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--tf-border)] px-4 py-2 flex items-center gap-4 text-xs text-[var(--tf-text-muted)]">
              <span className="flex items-center gap-1"><kbd className="bg-[var(--tf-surface-2)] px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-[var(--tf-surface-2)] px-1.5 py-0.5 rounded text-[10px]">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="bg-[var(--tf-surface-2)] px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
