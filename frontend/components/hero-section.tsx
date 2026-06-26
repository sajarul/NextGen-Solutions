"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { StartProjectModal } from "@/components/start-project-modal";

const HERO_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1800&q=80",
    title: "We Create",
    stroke: "Premium",
    suffix: "Design Systems"
  },
  {
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1800&q=80",
    title: "Bold Visuals",
    stroke: "For Fast",
    suffix: "Brand Growth"
  },
  {
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80",
    title: "Creative Strategy",
    stroke: "Meets",
    suffix: "Business Results"
  }
];

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const slide = useMemo(() => HERO_SLIDES[active], [active]);

  return (
    <section id="home" className="section-anchor relative min-h-[100svh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundImage: `linear-gradient(rgba(3,5,10,.58), rgba(3,5,10,.68)), url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(159,203,92,.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,.12),transparent_38%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-[95%] max-w-7xl flex-col justify-center pb-10 pt-20 sm:justify-end sm:pb-24 sm:pt-32">
        <motion.p
          key={`meta-${active}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xs uppercase tracking-[0.25em] text-brand-300"
        >
          NextGen Solutions • Creative Design Agency
        </motion.p>

        <motion.h1
          key={`title-${active}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-5xl font-[var(--font-poppins)] text-4xl font-semibold uppercase leading-[0.95] text-white sm:text-6xl lg:text-8xl"
        >
          {slide.title}
          <span className="stroke-hero block">{slide.stroke}</span>
          {slide.suffix}
        </motion.h1>

        <motion.div
          key={`cta-${active}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
        >
          <Link
            href="/portfolio"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black sm:w-auto"
          >
            Our Portfolio
            <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setProjectModalOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-full border border-brand-400/60 px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand-200 transition hover:bg-brand-500 hover:text-slate-950 sm:w-auto"
          >
            Start Project
          </button>
        </motion.div>

        <div className="mt-5 flex items-center gap-2 sm:mt-7">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={`bullet-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition ${active === index ? "w-10 bg-brand-400" : "w-4 bg-white/45"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <StartProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
    </section>
  );
}
