import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Newsreader,
  Onest,
  Space_Grotesk,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import {
  CONTENT_SCROLL_CONTAINER_ID,
  IdeShell,
} from "@/components/ide/ide-shell";
import { publishedCaseStudies, publishedPosts } from "@/lib/content";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
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
  title: {
    default: "Gabriel Belo",
    template: "%s · Gabriel Belo",
  },
  description: "Dev. Escrevo sobre o que construo e estudo.",
};

const explorerPosts = publishedPosts.map(({ slug, title }) => ({
  slug,
  title,
}));

const paletteCaseStudies = publishedCaseStudies.map(({ slug, title }) => ({
  slug,
  title,
}));

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${onest.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${newsreader.variable}`}
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
