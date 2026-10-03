import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  tone?: "default" | "error";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  tone = "default",
}: EmptyStateProps) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-lg border [&_svg]:size-5",
          tone === "error"
            ? "border-destructive/25 bg-destructive/10 text-destructive"
            : "border-border bg-muted text-muted-foreground"
        )}
      >
        {icon ?? <AlertCircle />}
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-1 flex items-center gap-2">{action}</div>}
    </div>
  );
}
