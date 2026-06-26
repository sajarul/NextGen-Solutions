"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { PRICING_PLANS } from "@/lib/constants";
import type { PricingPlan } from "@/lib/types";

function buildPricingWhatsAppLink(plan: PricingPlan): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917076529970").replace(/\D/g, "");
  const message = [
    `Hi NextGen Solutions, I want ${plan.name} (${plan.price}).`,
    "",
    "My details:",
    "Name:",
    "Phone/WhatsApp:",
    "",
    "Project requirement:",
    "Timeline:",
    "Reference links (if any):",
    "",
    "Please share next steps."
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function PricingSection() {
  return (
    <motion.section
      id="pricing"
      className="section-anchor relative border-y border-white/10 bg-[#04070e] px-4 py-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0.8, filter: "grayscale(0.9) saturate(0.7)", y: 18 }}
      whileInView={{ opacity: 1, filter: "grayscale(0) saturate(1)", y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionTitle
          eyebrow="Pricing"
          title="Flexible packages for startups, creators, and growth teams"
          description="Select a plan and send your requirement directly on WhatsApp."
          align="left"
          outlineWord="Pricing"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => (
            <Reveal key={plan.name} delay={0.08 * index}>
              <article
                className={`relative h-full rounded-2xl border p-4 sm:p-6 transition hover:-translate-y-1 ${
                  plan.recommended
                    ? "border-brand-400 bg-gradient-to-b from-brand-400/18 to-[#0f1320] shadow-glow"
                    : "glass-panel border-white/10"
                }`}
              >
                {plan.recommended ? (
                  <p className="absolute right-3 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-950 sm:right-5 sm:top-5 sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.16em]">
                    Recommended
                  </p>
                ) : null}

                <h3 className="text-lg font-semibold sm:text-2xl">{plan.name}</h3>
                <p className="mt-2 text-xs text-[color:var(--text-muted)] sm:text-sm">{plan.subtitle}</p>
                <p className="mt-4 text-2xl font-semibold sm:mt-6 sm:text-4xl">{plan.price}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-muted)] sm:mt-5 sm:gap-3 sm:text-xs sm:tracking-[0.14em]">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-center sm:px-3 sm:py-2">{plan.revisions}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-center sm:px-3 sm:py-2">{plan.delivery}</span>
                </div>

                <ul className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                  {plan.services.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs sm:gap-3 sm:text-sm">
                      <Check size={14} className="mt-0.5 shrink-0 text-brand-400 sm:size-4" />
                      <span className="text-[color:var(--text-muted)]">{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={buildPricingWhatsAppLink(plan)}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition sm:mt-8 sm:px-4 sm:py-2.5 sm:text-sm ${
                    plan.recommended
                      ? "bg-brand-500 text-slate-950 hover:shadow-glow"
                      : "border border-white/20 hover:border-brand-400 hover:text-brand-300"
                  }`}
                >
                  Choose {plan.name}
                  <ArrowUpRight size={15} />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
