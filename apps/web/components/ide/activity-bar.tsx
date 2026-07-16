import { cn } from "@gabriel/ui";

const TOP_ICONS = ["🗂", "⌕", "⑂", "◉"] as const;
const BOTTOM_ICONS = ["◐", "⚙"] as const;

function ActivityIcon({ icon, active = false }: { icon: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center text-lg",
        active ? "-ml-0.5 border-l-2 border-accent text-accent" : "text-faint",
      )}
    >
      {icon}
    </span>
  );
}

export function ActivityBar() {
  return (
    <aside
      aria-hidden="true"
      className="hidden w-[52px] shrink-0 flex-col items-center gap-1.5 border-r border-line bg-background-2 py-3.5 md:flex"
    >
      {TOP_ICONS.map((icon, index) => (
        <ActivityIcon key={icon} icon={icon} active={index === 0} />
      ))}
      <span className="mt-auto flex flex-col gap-1.5">
        {BOTTOM_ICONS.map((icon) => (
          <ActivityIcon key={icon} icon={icon} />
        ))}
      </span>
    </aside>
  );
}
