import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
  Newsreader,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import {
  CONTENT_SCROLL_CONTAINER_ID,
  IdeShell,
} from "@/components/ide/ide-shell";
import { publishedCaseStudies, publishedPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-bricolage",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gabriel Belo",
    template: "%s · Gabriel Belo",
  },
  description: "Dev. Escrevo sobre o que construo e estudo.",
  openGraph: {
    siteName: "Gabriel Belo",
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    title: "Gabriel Belo",
    description: "Dev. Escrevo sobre o que construo e estudo.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// The palette searches post bodies without shipping the whole MDX source to
// the client: strip code fences and markdown syntax, then truncate.
const SEARCH_TEXT_MAX_LENGTH = 4000;

function toSearchText(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_>~]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SEARCH_TEXT_MAX_LENGTH);
}

const explorerPosts = publishedPosts.map(({ slug, title, raw }) => ({
  slug,
  title,
  searchText: toSearchText(raw),
}));

const paletteCaseStudies = publishedCaseStudies.map(({ slug, title, raw }) => ({
  slug,
  title,
  searchText: toSearchText(raw),
}));

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolageGrotesque.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Dark is the native theme (ADR-0009): an IDE boots dark */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href={`#${CONTENT_SCROLL_CONTAINER_ID}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:border focus:border-accent focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-xs"
          >
            pular para o conteúdo
          </a>
          <IdeShell posts={explorerPosts} caseStudies={paletteCaseStudies}>
            {children}
          </IdeShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
