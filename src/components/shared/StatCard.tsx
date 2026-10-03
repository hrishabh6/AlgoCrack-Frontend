import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, helper, icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-subtle-foreground [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </div>
      {helper && <div className="mt-0.5 text-xs text-muted-foreground">{helper}</div>}
    </div>
  );
}
