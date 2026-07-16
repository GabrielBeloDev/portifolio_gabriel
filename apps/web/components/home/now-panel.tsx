const NOW_ENTRIES = [
  { label: "construindo", value: "este site" },
  { label: "aprendendo", value: "Kubernetes · Terraform" },
  { label: "escrevendo", value: "o pipeline deste blog" },
] as const;

export function NowPanel() {
  return (
    <section className="rounded-xl border border-line p-[18px]">
      <h2 className="mb-3.5 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-ok uppercase">
        <span
          aria-hidden
          className="home-pulse h-[7px] w-[7px] rounded-full bg-ok"
        />
        agora
      </h2>
      <dl>
        {NOW_ENTRIES.map((entry) => (
          <div
            key={entry.label}
            className="flex justify-between gap-4 py-[5px] text-sm"
          >
            <dt className="text-muted-2">{entry.label}</dt>
            <dd className="text-right">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
