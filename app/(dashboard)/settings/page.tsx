"use client";

import { Settings, Building2, Bell, Palette } from "lucide-react";
import Link from "next/link";

const settingsCards = [
  {
    icon: Building2,
    title: "Company Settings",
    description: "Agency name, contact details, and business information.",
    href: "/settings/company",
    color: "var(--tf-card-blue)",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Palette,
    title: "Branding",
    description: "Upload your logo, set colors and customize the app appearance.",
    href: "/settings/branding",
    color: "var(--tf-card-violet)",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure email alerts and in-app notification preferences.",
    href: "/settings/notifications",
    color: "var(--tf-card-amber)",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--tf-surface-2)] flex items-center justify-center">
          <Settings className="w-5 h-5 text-[var(--tf-text-secondary)]" />
        </div>
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Settings</h1>
          <p className="tf-body text-[var(--tf-text-secondary)]">Manage your agency configuration and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="block rounded-xl border border-[var(--tf-border)] p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
              style={{ backgroundColor: card.color }}
            >
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <h3 className="tf-h4 text-[var(--tf-text-primary)] mb-2 group-hover:text-[var(--tf-primary)] transition-colors">
                {card.title}
              </h3>
              <p className="tf-body-sm text-[var(--tf-text-secondary)]">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
