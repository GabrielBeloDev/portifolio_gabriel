const BUILD_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-8 font-mono text-xs text-muted">
        <span>© {BUILD_YEAR} gabriel belo</span>
        <a
          href="https://github.com/GabrielBeloDev/portifolio_gabriel"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent"
        >
          código deste site ↗
        </a>
      </div>
    </footer>
  );
}
