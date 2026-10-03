import { cn } from "@/lib/utils";
import { SHELL_CLASS } from "./Container";

interface PageContainerProps extends React.ComponentProps<"div"> {
  /** `narrow` is for centered single-message pages (empty, error, sign-in prompts). */
  size?: "default" | "narrow";
}

export function PageContainer({ size = "default", className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        size === "narrow" ? "mx-auto w-full max-w-3xl px-4 sm:px-6" : SHELL_CLASS,
        "py-6 md:py-8",
        className
      )}
      {...props}
    />
  );
}
