"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import type { PortfolioItem } from "@/lib/types";

interface PortfolioSectionProps {
  items: PortfolioItem[];
  categories: { key: string; label: string }[];
}

const INITIAL_VISIBLE_ITEMS = 6;

export function PortfolioSection({ items, categories }: PortfolioSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const categoryFilters = useMemo(
    () => [{ key: "all", label: "All Projects" }, ...categories],
    [categories]
  );

  const filtered = useMemo(() => {
    if (activeCategory === "all") {
      return items;
    }
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    });
    return counts;
  }, [items]);

  const visibleItems = useMemo(() => {
    if (showAll) {
      return filtered;
    }
    return filtered.slice(0, INITIAL_VISIBLE_ITEMS);
  }, [filtered, showAll]);

  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  return (
    <motion.section
      id="portfolio"
      className="section-anchor relative border-y border-white/10 bg-[#0b0f18] px-4 py-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0.8, filter: "grayscale(0.9) saturate(0.7)", y: 18 }}
      whileInView={{ opacity: 1, filter: "grayscale(0) saturate(1)", y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionTitle
          eyebrow="Portfolio"
          title="Clean, category-wise showcase of recent design work"
          description="Pick a category and browse projects in a simple visual grid."
          align="left"
          outlineWord="Projects"
        />

        <Reveal className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-brand-400/40 hover:text-white"
          >
            Open Full Portfolio Page
            <ArrowRight size={14} />
          </Link>
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            {filtered.length} works
          </div>
        </Reveal>

        <Reveal className="mb-8">
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {categoryFilters.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-500 text-slate-950 shadow-glow"
                      : "glass-panel text-[color:var(--text-muted)] hover:border-brand-400/40 hover:text-[color:var(--text)]"
                  }`}
                >
                  {category.label} ({categoryCount[category.key] ?? 0})
                </button>
              );
            })}
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <Reveal>
            <div className="glass-panel rounded-2xl p-8 text-center">
              <p className="text-sm text-[color:var(--text-muted)]">No projects in this category yet.</p>
            </div>
          </Reveal>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {visibleItems.map((item, index) => (
                <Reveal key={item.id} delay={0.03 * (index % 8)}>
                  <motion.article
                    whileHover={{ y: -4 }}
                    className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f1320] text-left"
                  >
                    <div className="relative aspect-[4/5]">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover saturate-95 transition duration-500 group-hover:scale-105 group-hover:saturate-110"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-brand-500/40 via-slate-900 to-cyan-500/35" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#04060c] via-[#04060c]/25 to-transparent" />
                      <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-brand-300">
                        {item.category_label}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <h3 className="font-[var(--font-poppins)] text-base font-semibold sm:text-xl">{item.title}</h3>
                        <p className="mt-1 text-xs text-slate-300/80">{item.client || "NextGen Portfolio"}</p>
                      </div>
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>

            {filtered.length > INITIAL_VISIBLE_ITEMS ? (
              <Reveal className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="w-full rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-brand-400/40 hover:text-white sm:w-auto"
            >
              {showAll ? "Show Less" : `Show All ${filtered.length} Projects`}
            </button>
              </Reveal>
            ) : null}
          </>
        )}
      </div>
    </motion.section>
  );
}
