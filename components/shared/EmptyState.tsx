import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[var(--tf-border-strong)] bg-[var(--tf-surface-2)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tf-surface)] text-[var(--tf-text-muted)] mb-4 shadow-sm">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="tf-h3 text-[var(--tf-text-primary)] mb-2">{title}</h3>
      <p className="tf-body text-[var(--tf-text-secondary)] max-w-md mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-[var(--tf-primary)] px-4 py-2 font-medium text-white shadow-sm hover:bg-[var(--tf-primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tf-primary)] focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
