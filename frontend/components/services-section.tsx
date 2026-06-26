"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookText,
  ImageIcon,
  LayoutGrid,
  Megaphone,
  Presentation,
  Tv
} from "lucide-react";

import { Reveal } from "@/components/reveal";
import { PORTFOLIO_LABELS, SERVICE_CARDS } from "@/lib/constants";
import type { PortfolioCategoryKey, ServiceItem } from "@/lib/types";

const ICONS: Record<PortfolioCategoryKey, typeof LayoutGrid> = {
  poster: Presentation,
  social: LayoutGrid,
  thumbnail: Tv,
  business_card: ImageIcon,
  wedding_card: Megaphone,
  book_cover: BookText
};

const SERVICE_FALLBACK_IMAGES: Record<PortfolioCategoryKey, string> = {
  poster: "/services/poster.svg",
  social: "/services/social.svg",
  thumbnail: "/services/thumbnail.svg",
  business_card: "/services/business-card.svg",
  wedding_card: "/services/wedding-card.svg",
  book_cover: "/services/book-cover.svg"
};

const FALLBACK_SERVICE_ITEMS: ServiceItem[] = SERVICE_CARDS.map((card, index) => ({
  id: index + 1,
  title: card.title,
  description: card.description,
  category: card.category,
  category_label: PORTFOLIO_LABELS[card.category],
  badge_text: "Design Service",
  tier_text: "Premium",
  cta_text: "Request this service",
  image_url: card.preview,
  is_published: true,
  display_order: index,
  created_at: ""
}));

const CARD_LAYOUTS = [
  "md:col-span-1 md:row-span-2 xl:col-span-2 xl:row-span-3",
  "md:col-span-1 md:row-span-2 xl:col-span-2 xl:row-span-2",
  "md:col-span-2 md:row-span-2 xl:col-span-2 xl:row-span-2",
  "md:col-span-2 md:row-span-2 xl:col-span-4 xl:row-span-2",
  "md:col-span-1 md:row-span-2 xl:col-span-2 xl:row-span-2",
  "md:col-span-1 md:row-span-2 xl:col-span-2 xl:row-span-2"
];

function buildServiceWhatsAppLink(service: {
  title: string;
  description: string;
  category: string;
  category_label: string;
}): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917076529970").replace(/\D/g, "");
  const categoryLabel = service.category_label || service.category;
  const text = `Hi NextGen Solutions, I need ${service.title} (${categoryLabel}) service. Please share pricing and delivery timeline.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function normalizeCategoryKey(category: string): PortfolioCategoryKey | null {
  const normalized = category.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized in PORTFOLIO_LABELS) {
    return normalized as PortfolioCategoryKey;
  }
  if (normalized.includes("social")) {
    return "social";
  }
  if (normalized.includes("thumbnail") || normalized.includes("youtube")) {
    return "thumbnail";
  }
  if (normalized.includes("business") && normalized.includes("card")) {
    return "business_card";
  }
  if (normalized.includes("wedding")) {
    return "wedding_card";
  }
  if (normalized.includes("book")) {
    return "book_cover";
  }
  if (normalized.includes("poster")) {
    return "poster";
  }
  return null;
}

interface ServicesSectionProps {
  items: ServiceItem[];
}

export function ServicesSection({ items }: ServicesSectionProps) {
  const itemsToRender = items.length > 0 ? items : FALLBACK_SERVICE_ITEMS;

  return (
    <section id="services" className="section-anchor relative border-y border-white/10 bg-[#04070e] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0.85, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-brand-300/80">Our Expertise</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            <span className="font-[var(--font-playfair)] italic">Creative</span>{" "}
            <span className="font-[var(--font-poppins)]">services</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:auto-rows-[180px] md:gap-4 xl:auto-rows-[170px] xl:grid-cols-6">
          {itemsToRender.map((service, index) => {
            const normalizedCategory = normalizeCategoryKey(service.category);
            const Icon = normalizedCategory ? ICONS[normalizedCategory] : LayoutGrid;
            const layoutClass = CARD_LAYOUTS[index % CARD_LAYOUTS.length];
            const imageSource = service.image_url || (normalizedCategory ? SERVICE_FALLBACK_IMAGES[normalizedCategory] : "/services/social.svg");

            return (
              <Reveal key={service.id} delay={0.04 * index} className={`${layoutClass} h-[230px] sm:h-[280px] md:h-auto`}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#070c19] shadow-panel"
                >
                  <Image
                    src={imageSource}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/85" />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="h-full w-full bg-gradient-to-br from-brand-500/20 via-transparent to-cyan-300/15" />
                  </div>

                  <div className="relative z-10 flex h-full flex-col p-3 sm:p-5 md:p-6">
                    <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-brand-300 backdrop-blur-sm sm:gap-2 sm:px-3 sm:text-[11px]">
                        <Icon size={11} />
                        <span className="truncate">{service.badge_text}</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.14em] text-white/70 sm:text-[10px] sm:tracking-[0.16em]">{service.tier_text}</span>
                    </div>

                    <h3 className="max-w-[98%] text-[1.35rem] font-semibold leading-tight text-white sm:max-w-[95%] sm:text-[1.65rem] md:text-[1.9rem]">
                      {service.title}
                    </h3>
                    <p className="mt-1 max-w-[98%] text-xs leading-relaxed text-white/80 sm:mt-2 sm:max-w-[96%] sm:text-sm md:mt-3 md:text-[1.04rem]">
                      {service.description}
                    </p>

                    <div className="mt-auto pt-3 sm:pt-4 md:pt-5">
                      <a
                        href={buildServiceWhatsAppLink(service)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-white underline decoration-white/55 underline-offset-4 transition hover:text-brand-200 sm:text-sm md:text-lg"
                      >
                        {service.cta_text}
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
