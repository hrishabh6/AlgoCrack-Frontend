import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  showWordmark?: boolean;
}

export function BrandMark({ className, showWordmark = true }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
      >
        <ChevronRight className="size-4" strokeWidth={3} />
      </span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Algo<span className="text-primary">Crack</span>
        </span>
      )}
    </span>
  );
}
