const NOW_ENTRIES = [
  {
    label: "construindo",
    value: "este site — cada feature nova vira um post no blog",
  },
  {
    label: "aprendendo",
    value:
      "Kubernetes e Terraform — a meta é migrar este site pra um cluster meu",
  },
  {
    label: "escrevendo",
    value: "“o pipeline deste blog”",
  },
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
      <dl className="space-y-3">
        {NOW_ENTRIES.map((entry) => (
          <div key={entry.label}>
            <dt className="font-mono text-xs text-muted-2">{entry.label}</dt>
            <dd className="mt-0.5 text-sm leading-relaxed">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
