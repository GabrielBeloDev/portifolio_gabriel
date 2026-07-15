import { cn } from "../lib/cn";

/**
 * The site's signature element (ADR-0004): a code-editor-style line-number
 * gutter that numbers page sections via pure CSS counters. Styles live in
 * styles.css under `.ruled-*`.
 */
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
