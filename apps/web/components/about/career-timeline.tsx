import { CAREER_TIMELINE } from "./owner-content";

export function CareerTimeline() {
  return (
    <ol className="ml-1 space-y-4 border-l border-line pl-6">
      {CAREER_TIMELINE.map((entry) => (
        <li key={entry.year} className="relative">
          <span
            aria-hidden
            className="absolute top-[7px] -left-[29px] h-[7px] w-[7px] rounded-full border border-line-2 bg-surface"
          />
          <p className="font-mono text-xs text-accent">{entry.year}</p>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
            {entry.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
