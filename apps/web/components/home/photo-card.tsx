import Image from "next/image";

import { GITHUB_PROFILE_URL } from "@/lib/site";

import gabrielPhoto from "./gabriel.jpg";

export function PhotoCard() {
  return (
    <div className="relative">
      <Image
        src={gabrielPhoto}
        alt="Gabriel Belo"
        placeholder="blur"
        className="aspect-[4/5] rounded-xl border border-line object-cover"
        sizes="(min-width:1024px) 320px, 100vw"
      />
      <a
        href={GITHUB_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute -bottom-[13px] left-4 rounded-lg bg-accent-fill px-[13px] py-[7px] font-mono text-xs font-bold text-on-accent transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
      >
        @GabrielBeloDev
      </a>
    </div>
  );
}
