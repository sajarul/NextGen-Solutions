"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import type { Testimonial } from "@/lib/types";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <motion.section
      id="testimonials"
      className="section-anchor relative border-y border-white/10 bg-[#0b0f18] px-4 py-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0.8, filter: "grayscale(0.9) saturate(0.7)", y: 18 }}
      whileInView={{ opacity: 1, filter: "grayscale(0) saturate(1)", y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionTitle
          eyebrow="Testimonials"
          title="Trusted by founders, creators, and growth teams"
          description="Real feedback from clients who partnered with NextGen Solutions for high-performing graphic design."
          align="left"
          outlineWord="Reviews"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.id} delay={0.07 * (index % 4)}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--panel)] p-4 sm:p-6 transition hover:-translate-y-1">
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-brand-500/12 via-transparent to-cyan-400/10" />
                </div>

                <div className="relative mb-4 flex items-center gap-3">
                  {item.profile_image_url ? (
                    <Image
                      src={item.profile_image_url}
                      alt={item.client_name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/25 text-sm font-semibold text-brand-200">
                      {item.client_name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium sm:text-base">{item.client_name}</h3>
                    <p className="text-xs text-[color:var(--text-muted)]">{item.client_role || "Client"}</p>
                  </div>
                </div>

                <div className="relative mb-4 flex gap-1">
                  {new Array(5).fill(null).map((_, i) => (
                    <Star
                      key={`${item.id}-star-${i}`}
                      size={15}
                      className={i < item.rating ? "fill-brand-400 text-brand-400" : "text-slate-500"}
                    />
                  ))}
                </div>

                <p className="relative text-xs leading-relaxed text-[color:var(--text-muted)] sm:text-sm">"{item.review}"</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
