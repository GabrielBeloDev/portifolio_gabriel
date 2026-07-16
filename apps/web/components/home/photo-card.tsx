export function PhotoCard() {
  return (
    <div className="relative">
      <div className="flex aspect-[4/5] items-center justify-center rounded-xl border border-line bg-linear-150 from-surface to-background-2 text-center font-mono text-xs leading-[1.7] text-faint">
        <span>
          sua foto
          <br />
          aqui
        </span>
      </div>
      <a
        href="https://github.com/GabrielBeloDev"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute -bottom-[13px] left-4 rounded-lg bg-accent-fill px-[13px] py-[7px] font-mono text-xs font-bold text-on-accent transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
      >
        @GabrielBeloDev
      </a>
    </div>
  );
}
