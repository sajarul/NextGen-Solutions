"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { api } from "@/lib/api";
import type { PortfolioItem } from "@/lib/types";

interface CategoryOption {
  key: string;
  label: string;
}

const FALLBACK_CATEGORIES: CategoryOption[] = [{ key: "all", label: "All Works" }];

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as { results: T[] }).results;
  }

  return [];
}

export default function PortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category") ?? "all";

  const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
  const [visibleItems, setVisibleItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(FALLBACK_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState(queryCategory);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [portfolioResult, categoriesResult] = await Promise.allSettled([
        api.getPortfolio(),
        api.getPortfolioCategories()
      ]);

      const portfolioOk = portfolioResult.status === "fulfilled";
      const categoriesOk = categoriesResult.status === "fulfilled";

      setOffline(!portfolioOk && !categoriesOk);

      if (portfolioOk) {
        const list = toList<PortfolioItem>(portfolioResult.value);
        setAllItems(list);
        setVisibleItems(list);
      }

      if (categoriesOk) {
        const list = toList<CategoryOption>(categoriesResult.value);
        setCategories([{ key: "all", label: "All Works" }, ...list]);
      }

      setLoading(false);
    };

    void load();
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allItems.length };
    allItems.forEach((item) => {
      map[item.category] = (map[item.category] ?? 0) + 1;
    });
    return map;
  }, [allItems]);

  useEffect(() => {
    setActiveCategory((prev) => (prev === queryCategory ? prev : queryCategory));
  }, [queryCategory]);

  useEffect(() => {
    if (!categories.some((item) => item.key === activeCategory)) {
      setActiveCategory("all");
    }
  }, [activeCategory, categories]);

  const handleCategorySelect = (key: string) => {
    setActiveCategory(key);

    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") {
      params.delete("category");
    } else {
      params.set("category", key);
    }

    const query = params.toString();
    router.replace(query ? `/portfolio?${query}` : "/portfolio", { scroll: false });
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (activeCategory === "all") {
      setFilterLoading(false);
      setVisibleItems(allItems);
      return;
    }

    let cancelled = false;

    const loadCategory = async () => {
      setFilterLoading(true);
      try {
        const result = await api.getPortfolio(activeCategory);
        if (!cancelled) {
          setVisibleItems(toList<PortfolioItem>(result));
        }
      } catch {
        if (!cancelled) {
          setVisibleItems(allItems.filter((item) => item.category === activeCategory));
        }
      } finally {
        if (!cancelled) {
          setFilterLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, allItems, loading]);

  return (
    <main className="min-h-screen px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/30"
        >
          <ArrowLeft size={14} />
          Back To Home
        </Link>

        <header className="glass-panel rounded-3xl border border-white/15 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-300">Portfolio Explorer</p>
          <h1 className="mt-3 max-w-4xl font-[var(--font-poppins)] text-3xl font-semibold uppercase leading-tight sm:text-5xl">
            Category-Wise Creative Work Showcase
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-[color:var(--text-muted)] sm:text-base">
            Choose a category to view all related design work. Every item on this page is dynamic and updates from your
            admin dashboard edits, image uploads, and deletes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-slate-200">
              <Filter size={13} className="text-brand-300" />
              Smart Category Filter
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-slate-200">
              <ArrowUpRight size={13} className="text-brand-300" />
              Animated Portfolio Grid
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="-mx-1 mb-6 flex gap-3 overflow-x-auto px-1 pb-2">
            {categories.map((category) => {
              const isActive = activeCategory === category.key;
              const count = counts[category.key] ?? 0;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleCategorySelect(category.key)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-500 text-slate-950 shadow-glow"
                      : "glass-panel text-[color:var(--text-muted)] hover:border-brand-400/40 hover:text-[color:var(--text)]"
                  }`}
                >
                  <span>{category.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-black/15" : "bg-white/10"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {offline ? (
            <p className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Backend unavailable right now. Showing available local preview data.
            </p>
          ) : null}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : null}

          {!loading && !filterLoading && visibleItems.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <p className="text-sm text-[color:var(--text-muted)]">No works found in this category yet.</p>
            </div>
          ) : null}

          {filterLoading ? (
            <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              Loading {categories.find((item) => item.key === activeCategory)?.label ?? "category"} works...
            </p>
          ) : null}

          <AnimatePresence mode="wait">
            {!loading && visibleItems.length > 0 ? (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className="grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[280px] sm:gap-5 xl:grid-cols-3"
              >
                {visibleItems.map((item, index) => (
                  <motion.button
                    key={`${activeCategory}-${item.id}`}
                    type="button"
                    onClick={() => setSelected(item)}
                    whileHover={{ y: -6, scale: 1.01 }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * (index % 8) }}
                    className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1320] text-left ${
                      index % 7 === 0 ? "sm:col-span-2" : ""
                    }`}
                  >
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        width={1000}
                        height={760}
                        className="h-full w-full object-cover saturate-90 transition duration-500 group-hover:scale-105 group-hover:saturate-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-brand-500/40 via-slate-900 to-cyan-500/35" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04060c] via-[#04060c]/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-brand-300">{item.category_label}</p>
                      <h3 className="mt-1 font-[var(--font-poppins)] text-lg font-semibold sm:text-2xl">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-300/85">{item.client || "NextGen Portfolio"}</p>
                      <p className="mt-3 inline-flex rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/85 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        View Details
                      </p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              className="glass-panel max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              {selected.image_url ? (
                <Image
                  src={selected.image_url}
                  alt={selected.title}
                  width={1400}
                  height={900}
                  className="h-72 w-full object-cover sm:h-[460px]"
                />
              ) : (
                <div className="h-72 w-full bg-gradient-to-br from-brand-500/50 to-cyan-500/30 sm:h-[460px]" />
              )}

              <div className="p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-300">{selected.category_label}</p>
                <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{selected.title}</h3>
                <p className="mt-4 text-[color:var(--text-muted)]">{selected.description}</p>
                {selected.client ? (
                  <p className="mt-4 text-sm text-slate-300">
                    Client: <span className="font-medium text-white">{selected.client}</span>
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
