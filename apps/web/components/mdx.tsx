import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import { Mermaid } from "./mermaid";

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

const sharedComponents: MDXComponents = {
  Mermaid,
  a: ({ href = "", ...props }: React.ComponentProps<"a">) => {
    const isExternal = href.startsWith("http");
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
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
