export function TerminalPrompt() {
  return (
    <p className="font-mono text-sm text-faint">
      <span aria-hidden className="text-accent">
        ➜
      </span>{" "}
      <span aria-hidden className="text-ok">
        ~
      </span>{" "}
      <span className="home-typing">cat sobre-mim.md</span>
      <span
        aria-hidden
        className="home-cursor ml-0.5 inline-block h-[18px] w-[9px] bg-accent-fill align-bottom"
      />
    </p>
  );
}
