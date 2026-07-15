import { cn } from "../lib/cn";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-surface p-5 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

type CardTitleProps = React.ComponentProps<"h3"> & {
  as?: "h2" | "h3";
};

export function CardTitle({ className, as: Tag = "h3", ...props }: CardTitleProps) {
  return (
    <Tag
      className={cn("text-base leading-snug font-semibold", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn("mt-1.5 text-sm text-muted", className)} {...props} />;
}
