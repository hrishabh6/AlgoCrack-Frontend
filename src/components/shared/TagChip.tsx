import { cn } from "@/lib/utils";

interface TagChipProps extends React.ComponentProps<"span"> {
  mono?: boolean;
}

export function TagChip({ mono, className, ...props }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-md border border-border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground",
        mono && "font-mono",
        className
      )}
      {...props}
    />
  );
}
