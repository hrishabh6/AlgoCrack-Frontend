import { cn } from "@/lib/utils";

/**
 * Application shell: one max width (1600px) and one horizontal padding scale for the navbar,
 * every page and the footer, so their edges line up. Constrain readable text inside it separately.
 */
export const SHELL_CLASS = "mx-auto w-full max-w-shell px-4 sm:px-6 lg:px-8 2xl:px-10";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(SHELL_CLASS, className)} {...props} />;
}
