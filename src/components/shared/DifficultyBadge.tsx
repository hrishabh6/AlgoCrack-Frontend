import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VARIANT = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
} as const;

interface DifficultyBadgeProps {
  difficulty: string | null | undefined;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  if (!difficulty) return null;
  const variant = VARIANT[difficulty as keyof typeof VARIANT] ?? "muted";
  return (
    <Badge variant={variant} className={cn("font-medium", className)}>
      {difficulty}
    </Badge>
  );
}

/** Text color class for inline difficulty labels and progress bars. */
export const DIFFICULTY_TEXT = {
  Easy: "text-success",
  Medium: "text-warning",
  Hard: "text-destructive",
} as const;

export const DIFFICULTY_BAR = {
  Easy: "bg-success",
  Medium: "bg-warning",
  Hard: "bg-destructive",
} as const;
