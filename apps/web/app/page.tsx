import { FadeUp } from "@/components/home/fade-up";
import { HeroCtas } from "@/components/home/hero-ctas";
import { NowPanel } from "@/components/home/now-panel";
import { PhotoCard } from "@/components/home/photo-card";
import { RecentPosts } from "@/components/home/recent-posts";
import { TerminalPrompt } from "@/components/home/terminal-prompt";

export default function HomePage() {
  return (
    <div className="grid min-h-full lg:grid-cols-[1.5fr_0.95fr]">
      <section className="px-6 py-10 sm:px-10 lg:border-r lg:border-line-2 lg:p-14">
        <FadeUp delay={0.05} className="mb-[30px]">
          <TerminalPrompt />
        </FadeUp>
        <FadeUp delay={0.85} className="mb-[22px]">
          <h1 className="font-display text-[44px] leading-[0.98] font-bold tracking-[-0.03em] sm:text-[60px]">
            Aprendo em
            <br />
            voz alta — e
            <br />
            <span className="text-accent">anoto tudo.</span>
          </h1>
        </FadeUp>
        <FadeUp delay={1} className="mb-[34px]">
          <p className="max-w-[470px] text-lg leading-[1.65] text-muted">
            Sou o Gabriel, dev e curioso crônico. Este é meu caderno público:
            estudos, decisões de arquitetura e projetos que construo — escritos
            pra fazerem sentido daqui a um ano, não pra render like.
          </p>
        </FadeUp>
        <FadeUp delay={1.15} className="mb-12">
          <HeroCtas />
        </FadeUp>
        <FadeUp delay={1.3} className="mb-1">
          <p className="font-mono text-xs tracking-[0.1em] text-faint">
            // escrito recentemente
          </p>
        </FadeUp>
        <FadeUp delay={1.4}>
          <RecentPosts />
        </FadeUp>
      </section>
      <aside className="flex flex-col gap-6 border-t border-line-2 px-6 py-10 sm:px-10 lg:border-t-0 lg:px-11 lg:py-14">
        <FadeUp delay={0.55}>
          <PhotoCard />
        </FadeUp>
        <FadeUp delay={0.7}>
          <NowPanel />
        </FadeUp>
        <FadeUp delay={0.85}>
          <p className="font-serif text-base leading-[1.6] text-muted italic">
            "escrever é a forma mais honesta de descobrir que eu não entendi de
            verdade."
          </p>
        </FadeUp>
      </aside>
    </div>
  );
}
