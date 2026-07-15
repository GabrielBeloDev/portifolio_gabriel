import { cn } from "../lib/cn";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs text-muted",
        className,
      )}
      {...props}
    />
  );
}
