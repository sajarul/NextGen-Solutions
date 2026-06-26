"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-2 flex w-[95%] max-w-7xl items-center justify-between rounded-full border border-white/15 bg-black/45 px-4 py-2.5 backdrop-blur-2xl sm:mt-4 sm:px-6 sm:py-3">
          <Logo className="h-10 w-[190px] sm:h-12 sm:w-[300px]" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[color:var(--text)] transition hover:scale-105 sm:h-10 sm:w-10"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.aside
            className="fixed inset-0 z-[70] bg-[#05070e]/95 backdrop-blur-xl"
            initial={{ opacity: 0, clipPath: "circle(0% at 96% 6%)" }}
            animate={{ opacity: 1, clipPath: "circle(140% at 96% 6%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 96% 6%)" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto flex h-full w-[95%] max-w-7xl flex-col justify-between overflow-y-auto py-6 sm:py-8">
              <div className="flex items-center justify-between">
                <Logo className="h-11 w-[205px] sm:h-16 sm:w-[380px]" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="grid gap-3 py-6 sm:gap-5 sm:py-0">
                {NAV_LINKS.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + 0.07 * index, duration: 0.45 }}
                    className="group inline-flex items-end gap-3 border-b border-white/10 pb-3 text-2xl font-semibold uppercase tracking-[0.08em] text-white sm:text-5xl"
                  >
                    <span className="text-base text-brand-300 sm:text-lg">0{index + 1}</span>
                    <span className="relative transition group-hover:translate-x-2">
                      {item.label}
                      <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-brand-300 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </motion.a>
                ))}
              </nav>

              <div className="flex flex-wrap items-start justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[color:var(--text-muted)] sm:items-center sm:text-sm">
                <p>info@nextgensolutions.design</p>
                <div className="flex items-center gap-4">
                  <a href="https://www.instagram.com/nextgensolutlons/" target="_blank" rel="noreferrer" className="hover:text-white">
                    Instagram
                  </a>
                  <a href="https://wa.me/917076529970" target="_blank" rel="noreferrer" className="hover:text-white">
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
