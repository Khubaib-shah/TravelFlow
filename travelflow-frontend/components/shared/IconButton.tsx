import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  tone?: "default" | "danger";
}

export function IconButton({
  className,
  variant = "ghost",
  size = "icon-sm",
  tone = "default",
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-md text-tf-text-muted hover:bg-[var(--tf-surface-2)] hover:text-tf-text-primary",
        tone === "danger" &&
          "hover:bg-[var(--tf-danger-soft)] hover:text-[var(--tf-danger)]",
        className,
      )}
      {...props}
    />
  );
}
