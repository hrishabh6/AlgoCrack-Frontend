import { AlertTriangle, CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getVerdictMeta, type Tone } from "@/lib/verdict";
import { cn } from "@/lib/utils";

const ICONS: Record<Tone, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Loader2,
  muted: CircleDashed,
};

interface StatusBadgeProps {
  verdict?: string | null;
  status?: string | null;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ verdict, status, className, showIcon = true }: StatusBadgeProps) {
  const { label, tone } = getVerdictMeta(verdict, status);
  const Icon = ICONS[tone];
  return (
    <Badge variant={tone} className={cn("gap-1", className)}>
      {showIcon && (
        <Icon className={cn(tone === "info" && "animate-spin")} aria-hidden="true" />
      )}
      {label}
    </Badge>
  );
}

/** Plain colored text for dense rows where a chip would be too heavy. */
export const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
  info: "text-info",
  muted: "text-muted-foreground",
};
