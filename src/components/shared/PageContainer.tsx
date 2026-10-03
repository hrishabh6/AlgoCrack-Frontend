import { cn } from "@/lib/utils";

interface PageContainerProps extends React.ComponentProps<"div"> {
  size?: "default" | "wide" | "narrow";
}

const SIZES = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export function PageContainer({ size = "default", className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 py-6 sm:px-6 md:py-8", SIZES[size], className)}
      {...props}
    />
  );
}
