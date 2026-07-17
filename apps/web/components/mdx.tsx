import type { MDXComponents } from "mdx/types";
import { Children, isValidElement } from "react";
import * as runtime from "react/jsx-runtime";
import { cn } from "@gabriel/ui";
import { CopyCodeButton } from "./copy-code-button";
import { Mermaid } from "./mermaid";
import { ZoomImage } from "./zoom-image";

type MDXComponent = React.ComponentType<{ components?: MDXComponents }>;

// velite compiles MDX to a function-body string; evaluate it with the JSX runtime.
// SECURITY BOUNDARY: `code` comes exclusively from velite compiling MDX files
// committed to this repo at build time — never from user input. If this site
// ever renders third-party MDX, this must be replaced with a sandboxed evaluator.
// The cache keeps component identity stable across renders.
const componentCache = new Map<string, MDXComponent>();

function getMDXComponent(code: string): MDXComponent {
  const cached = componentCache.get(code);
  if (cached) return cached;
  const fn = new Function(code);
  const component = (fn({ ...runtime }) as { default: MDXComponent }).default;
  componentCache.set(code, component);
  return component;
}

function isElementOfType(
  node: React.ReactNode,
  type: string,
): node is React.ReactElement<{ children?: React.ReactNode }> {
  return isValidElement(node) && node.type === type;
}

function countFootnoteItems(children: React.ReactNode): number {
  const list = Children.toArray(children).find((child) =>
    isElementOfType(child, "ol"),
  );
  if (!list) return 0;
  return Children.toArray(list.props.children).filter((item) =>
    isElementOfType(item, "li"),
  ).length;
}

// remark-gfm emits footnotes as a trailing <section data-footnotes>; restyled
// here as a collapsible panel in the IDE language (like revisões/outline).
// The sr-only h2#footnote-label stays inside: every footnote ref points at it
// via aria-describedby.
function FootnotesPanel({ children }: { children?: React.ReactNode }) {
  const noteCount = countFootnoteItems(children);
  return (
    <details
      data-footnotes
      className="rounded-md border border-line bg-surface px-4 py-3"
    >
      <summary className="cursor-pointer font-mono text-xs tracking-[0.1em] text-muted-2">
        <span aria-hidden="true">{"// "}</span>notas ({noteCount})
      </summary>
      <div className="mt-3.5">{children}</div>
    </details>
  );
}

const sharedComponents: MDXComponents = {
  Mermaid,
  // rehype-pretty-code draws the title bar via CSS only, so the copy button
  // is mounted here, absolutely positioned over that bar
  figure: ({
    className,
    children,
    ...props
  }: React.ComponentProps<"figure">) => {
    const isCodeFigure = "data-rehype-pretty-code-figure" in props;
    if (!isCodeFigure) {
      return (
        <figure className={className} {...props}>
          {children}
        </figure>
      );
    }
    return (
      <figure className={cn("relative", className)} {...props}>
        {children}
        <CopyCodeButton />
      </figure>
    );
  },
  a: ({ href = "", ...props }: React.ComponentProps<"a">) => {
    const isExternal = href.startsWith("http");
    return (
      <a
        href={href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...props}
      />
    );
  },
  img: ZoomImage,
  section: ({ children, ...props }: React.ComponentProps<"section">) => {
    const isFootnotesSection = "data-footnotes" in props;
    if (isFootnotesSection) return <FootnotesPanel>{children}</FootnotesPanel>;
    return <section {...props}>{children}</section>;
  },
};

export function MDXContent({
  code,
  components,
}: {
  code: string;
  components?: MDXComponents;
}) {
  // Server component rendering build-compiled MDX; identity is stable via the
  // module-level cache above, so the "resets state" concern doesn't apply.
  const Component = getMDXComponent(code);
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={{ ...sharedComponents, ...components }} />;
}
