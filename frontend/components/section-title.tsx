"use client";

import { Reveal } from "@/components/reveal";

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  outlineWord?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
  outlineWord
}: SectionTitleProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={`relative mb-12 max-w-4xl ${centered ? "mx-auto text-center" : "text-left"}`}
      delay={0.05}
    >
      {outlineWord ? (
        <p
          aria-hidden
          className={`outline-heading pointer-events-none absolute -top-14 z-0 select-none font-[var(--font-poppins)] text-[clamp(3.1rem,11vw,9rem)] font-semibold uppercase leading-none opacity-35 ${
            centered ? "left-1/2 -translate-x-1/2" : "left-0"
          }`}
        >
          {outlineWord}
        </p>
      ) : null}

      <div className="relative z-10">
        <div className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 ${centered ? "mx-auto" : ""}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-300">{eyebrow}</p>
        </div>
        <h2 className="mb-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="max-w-3xl text-base text-[color:var(--text-muted)] sm:text-lg">{description}</p>
      </div>
    </Reveal>
  );
}
