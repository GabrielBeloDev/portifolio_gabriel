import { cn } from "../lib/cn";

// Section numbers come from CSS counters in styles.css (.ruled-*), not props
export function RuledPage({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ruled-page", className)} {...props} />;
}

export function RuledSection({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("ruled-section", className)} {...props}>
      <span aria-hidden="true" className="ruled-num" />
      <div className="ruled-body">{children}</div>
    </section>
  );
}

export function SectionHeading({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return <h2 className={cn("section-heading", className)} {...props} />;
}
