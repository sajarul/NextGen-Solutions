"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeIndianRupee, Calculator, Clock3, MessageCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";

type Mode = "one_time" | "monthly";
type ServiceKey = "social" | "thumbnail" | "poster" | "business_card" | "wedding_card" | "book_cover";
type Complexity = "simple" | "standard" | "premium";
type DeliverySpeed = "regular" | "priority" | "urgent";

interface DiscountRule {
  minQty: number;
  percent: number;
}

interface ServiceRule {
  label: string;
  unitPrice: number;
  bulkDiscounts: DiscountRule[];
  baseDeliveryDays: number;
  batchSize: number;
}

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917076529970").replace(/\D/g, "");

const SERVICE_RULES: Record<ServiceKey, ServiceRule> = {
  social: {
    label: "Social Media Post",
    unitPrice: 200,
    bulkDiscounts: [{ minQty: 10, percent: 50 }],
    baseDeliveryDays: 1,
    batchSize: 5
  },
  thumbnail: {
    label: "YouTube Thumbnail",
    unitPrice: 1000,
    bulkDiscounts: [{ minQty: 10, percent: 30 }],
    baseDeliveryDays: 2,
    batchSize: 4
  },
  poster: {
    label: "Poster Design",
    unitPrice: 700,
    bulkDiscounts: [{ minQty: 8, percent: 20 }, { minQty: 15, percent: 30 }],
    baseDeliveryDays: 2,
    batchSize: 4
  },
  business_card: {
    label: "Business Card Design",
    unitPrice: 500,
    bulkDiscounts: [{ minQty: 10, percent: 20 }, { minQty: 20, percent: 30 }],
    baseDeliveryDays: 2,
    batchSize: 10
  },
  wedding_card: {
    label: "Wedding Card Design",
    unitPrice: 1200,
    bulkDiscounts: [{ minQty: 6, percent: 15 }, { minQty: 12, percent: 25 }],
    baseDeliveryDays: 3,
    batchSize: 4
  },
  book_cover: {
    label: "Book Cover Design",
    unitPrice: 1500,
    bulkDiscounts: [{ minQty: 5, percent: 15 }, { minQty: 10, percent: 25 }],
    baseDeliveryDays: 3,
    batchSize: 3
  }
};

const COMPLEXITY_MULTIPLIER: Record<Complexity, number> = {
  simple: 0.95,
  standard: 1,
  premium: 1.15
};

const DELIVERY_MULTIPLIER: Record<DeliverySpeed, number> = {
  regular: 1,
  priority: 1.1,
  urgent: 1.22
};

const DELIVERY_TIME_FACTOR: Record<DeliverySpeed, number> = {
  regular: 1,
  priority: 0.78,
  urgent: 0.6
};

function roundToNearest50(value: number): number {
  return Math.max(0, Math.round(value / 50) * 50);
}

function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getBulkDiscountPercent(rules: DiscountRule[], quantity: number): number {
  let best = 0;
  for (const rule of rules) {
    if (quantity >= rule.minQty && rule.percent > best) {
      best = rule.percent;
    }
  }
  return best;
}

export function InstantPriceEstimatorSection() {
  const [mode, setMode] = useState<Mode>("one_time");

  const [service, setService] = useState<ServiceKey>("social");
  const [quantity, setQuantity] = useState(1);
  const [complexity, setComplexity] = useState<Complexity>("standard");
  const [speed, setSpeed] = useState<DeliverySpeed>("regular");
  const [revisions, setRevisions] = useState(2);

  const [monthlyWorks, setMonthlyWorks] = useState(20);
  const [monthlyComplexity, setMonthlyComplexity] = useState<Complexity>("standard");
  const [monthlyRegular, setMonthlyRegular] = useState(true);
  const [monthlySpeed, setMonthlySpeed] = useState<DeliverySpeed>("regular");

  const oneTimeEstimate = useMemo(() => {
    const rule = SERVICE_RULES[service];
    const cleanQty = Math.max(1, quantity);

    const base = rule.unitPrice * cleanQty;
    const bulkDiscountPct = getBulkDiscountPercent(rule.bulkDiscounts, cleanQty);
    const discountAmount = Math.round((base * bulkDiscountPct) / 100);
    const discounted = base - discountAmount;

    const revisionMultiplier = 1 + Math.max(0, revisions - 2) * 0.03;
    const aiMultiplier =
      COMPLEXITY_MULTIPLIER[complexity] * DELIVERY_MULTIPLIER[speed] * revisionMultiplier;

    const smartQuote = roundToNearest50(discounted * aiMultiplier);
    const variance = Math.max(100, roundToNearest50(smartQuote * 0.08));
    const rangeMin = Math.max(100, roundToNearest50(smartQuote - variance));
    const rangeMax = roundToNearest50(smartQuote + variance);

    const qtyFactor = Math.ceil(cleanQty / rule.batchSize);
    const deliveryDays = Math.max(
      1,
      Math.ceil(rule.baseDeliveryDays * qtyFactor * DELIVERY_TIME_FACTOR[speed])
    );

    return {
      rule,
      cleanQty,
      base,
      bulkDiscountPct,
      discountAmount,
      smartQuote,
      rangeMin,
      rangeMax,
      deliveryDays,
      aiAdjustmentAmount: smartQuote - (base - discountAmount)
    };
  }, [complexity, quantity, revisions, service, speed]);

  const monthlyEstimate = useMemo(() => {
    const cleanWorks = Math.max(8, monthlyWorks);
    let slabPrice = 3000;
    let slabLabel = "Starter Retainer (around 20 works/month)";

    if (cleanWorks > 35) {
      slabPrice = 8000;
      slabLabel = "Scale Retainer (35+ works/month)";
    } else if (cleanWorks >= 25) {
      slabPrice = 5000;
      slabLabel = "Growth Retainer (around 30 works/month)";
    }

    const regularMultiplier = monthlyRegular ? 1 : 1.2;
    const aiMultiplier =
      COMPLEXITY_MULTIPLIER[monthlyComplexity] *
      DELIVERY_MULTIPLIER[monthlySpeed] *
      regularMultiplier;

    const smartQuote = roundToNearest50(slabPrice * aiMultiplier);
    const variance = Math.max(150, roundToNearest50(smartQuote * 0.1));
    const rangeMin = Math.max(1000, roundToNearest50(smartQuote - variance));
    const rangeMax = roundToNearest50(smartQuote + variance);

    const dailyAverage = Math.max(1, Math.ceil(cleanWorks / 22));
    const deliveryPace =
      monthlySpeed === "urgent"
        ? "Same-day / next-day batches"
        : monthlySpeed === "priority"
        ? "2-3 day batch cycles"
        : "Weekly delivery cycles";

    return {
      cleanWorks,
      slabPrice,
      slabLabel,
      smartQuote,
      rangeMin,
      rangeMax,
      deliveryPace,
      dailyAverage,
      aiAdjustmentAmount: smartQuote - slabPrice
    };
  }, [monthlyComplexity, monthlyRegular, monthlySpeed, monthlyWorks]);

  const estimateText = useMemo(() => {
    if (mode === "one_time") {
      return [
        `Hi NextGen Solutions, I used your estimator.`,
        `Service: ${oneTimeEstimate.rule.label}`,
        `Quantity: ${oneTimeEstimate.cleanQty}`,
        `Estimated Price: ${formatINR(oneTimeEstimate.smartQuote)} (range ${formatINR(oneTimeEstimate.rangeMin)} - ${formatINR(oneTimeEstimate.rangeMax)})`,
        `Estimated Delivery: ${oneTimeEstimate.deliveryDays} day(s)`,
        `Please confirm final quote and timeline.`
      ].join("\n");
    }

    return [
      `Hi NextGen Solutions, I used your monthly estimator.`,
      `Monthly Works: ${monthlyEstimate.cleanWorks}`,
      `Suggested Plan: ${monthlyEstimate.slabLabel}`,
      `Estimated Monthly Price: ${formatINR(monthlyEstimate.smartQuote)} (range ${formatINR(monthlyEstimate.rangeMin)} - ${formatINR(monthlyEstimate.rangeMax)})`,
      `Delivery Pace: ${monthlyEstimate.deliveryPace}`,
      `Please confirm final monthly package.`
    ].join("\n");
  }, [mode, monthlyEstimate, oneTimeEstimate]);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(estimateText)}`;

  return (
    <motion.section
      id="estimator"
      className="section-anchor relative border-y border-white/10 bg-[#050a14] px-4 py-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0.8, filter: "grayscale(0.9) saturate(0.7)", y: 18 }}
      whileInView={{ opacity: 1, filter: "grayscale(0) saturate(1)", y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionTitle
          eyebrow="Estimator"
          title="Instant Price Estimator"
          description="Smart estimate engine with your custom discounts and monthly retainer prediction."
          align="left"
          outlineWord="Estimate"
        />

        <Reveal className="mb-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-brand-300">Social Media Post</p>
              <p className="mt-2 text-xs text-[color:var(--text-muted)] sm:text-sm">₹200 per post</p>
              <p className="text-xs text-[color:var(--text-muted)] sm:text-sm">10+ posts: 50% off</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-brand-300">YouTube Thumbnail</p>
              <p className="mt-2 text-xs text-[color:var(--text-muted)] sm:text-sm">₹1000 per thumbnail</p>
              <p className="text-xs text-[color:var(--text-muted)] sm:text-sm">10+ thumbnails: 30% off</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-brand-300">Monthly (20 works approx)</p>
              <p className="mt-2 text-xs text-[color:var(--text-muted)] sm:text-sm">Starting ₹3000</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-brand-300">Monthly Scale</p>
              <p className="mt-2 text-xs text-[color:var(--text-muted)] sm:text-sm">~30 works: ₹5000</p>
              <p className="text-xs text-[color:var(--text-muted)] sm:text-sm">35+ works: ₹8000</p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="glass-panel rounded-3xl p-6 sm:p-7">
              <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setMode("one_time")}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                    mode === "one_time" ? "bg-brand-500 text-slate-950" : "text-[color:var(--text-muted)]"
                  }`}
                >
                  One-Time
                </button>
                <button
                  type="button"
                  onClick={() => setMode("monthly")}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                    mode === "monthly" ? "bg-brand-500 text-slate-950" : "text-[color:var(--text-muted)]"
                  }`}
                >
                  Monthly
                </button>
              </div>

              {mode === "one_time" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm">Service</span>
                    <select
                      value={service}
                      onChange={(event) => setService(event.target.value as ServiceKey)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    >
                      {Object.entries(SERVICE_RULES).map(([key, rule]) => (
                        <option key={key} value={key}>
                          {rule.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm">Quantity</span>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => setQuantity(Number(event.target.value || 1))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm">Revisions</span>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={revisions}
                      onChange={(event) => setRevisions(Number(event.target.value || 1))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm">Complexity</span>
                    <select
                      value={complexity}
                      onChange={(event) => setComplexity(event.target.value as Complexity)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    >
                      <option value="simple">Simple</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm">Delivery Speed</span>
                    <select
                      value={speed}
                      onChange={(event) => setSpeed(event.target.value as DeliverySpeed)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    >
                      <option value="regular">Regular</option>
                      <option value="priority">Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm">Works per Month</span>
                    <input
                      type="number"
                      min={8}
                      max={120}
                      value={monthlyWorks}
                      onChange={(event) => setMonthlyWorks(Number(event.target.value || 8))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm">Complexity</span>
                    <select
                      value={monthlyComplexity}
                      onChange={(event) => setMonthlyComplexity(event.target.value as Complexity)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    >
                      <option value="simple">Simple</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm">Delivery Pace</span>
                    <select
                      value={monthlySpeed}
                      onChange={(event) => setMonthlySpeed(event.target.value as DeliverySpeed)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    >
                      <option value="regular">Regular</option>
                      <option value="priority">Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm">Regular Monthly Collaboration</span>
                    <select
                      value={monthlyRegular ? "yes" : "no"}
                      onChange={(event) => setMonthlyRegular(event.target.value === "yes")}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass-panel rounded-3xl p-6 sm:p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/35 bg-brand-500/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-brand-300">
                <Sparkles size={14} />
                Smart Estimate
              </div>

              {mode === "one_time" ? (
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">{formatINR(oneTimeEstimate.smartQuote)}</h3>
                  <p className="text-sm text-[color:var(--text-muted)]">
                    Expected range: {formatINR(oneTimeEstimate.rangeMin)} - {formatINR(oneTimeEstimate.rangeMax)}
                  </p>

                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Base</span>
                      <span>{formatINR(oneTimeEstimate.base)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Bulk Discount</span>
                      <span>
                        {oneTimeEstimate.bulkDiscountPct}% ({formatINR(oneTimeEstimate.discountAmount)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Smart AI Adjustment</span>
                      <span>{formatINR(oneTimeEstimate.aiAdjustmentAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Estimated Delivery</span>
                      <span>{oneTimeEstimate.deliveryDays} day(s)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">{formatINR(monthlyEstimate.smartQuote)} / month</h3>
                  <p className="text-sm text-[color:var(--text-muted)]">
                    Expected range: {formatINR(monthlyEstimate.rangeMin)} - {formatINR(monthlyEstimate.rangeMax)}
                  </p>
                  <p className="text-sm text-brand-300">{monthlyEstimate.slabLabel}</p>

                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Slab Base</span>
                      <span>{formatINR(monthlyEstimate.slabPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Smart AI Adjustment</span>
                      <span>{formatINR(monthlyEstimate.aiAdjustmentAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Expected Pace</span>
                      <span>{monthlyEstimate.deliveryPace}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-[color:var(--text-muted)]">Daily Avg Volume</span>
                      <span>{monthlyEstimate.dailyAverage} works/day</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:shadow-glow"
                >
                  <MessageCircle size={16} />
                  Get Final Quote
                </a>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:border-brand-400/40"
                >
                  <Calculator size={16} />
                  Discuss Requirement
                </Link>
              </div>

              <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-[color:var(--text-muted)]">
                <p className="inline-flex items-center gap-2">
                  <BadgeIndianRupee size={14} className="text-brand-300" />
                  Estimates are instant and based on your selected quantity, complexity, and timeline.
                </p>
                <p className="inline-flex items-center gap-2">
                  <Clock3 size={14} className="text-brand-300" />
                  Final quote may vary slightly after reviewing exact references and scope.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-6">
          <div className="glass-panel rounded-3xl p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-brand-300">All Service Base Rates</p>
            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
              {Object.values(SERVICE_RULES).map((rule) => (
                <div key={rule.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-medium text-white sm:text-sm">{rule.label}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)] sm:text-sm">
                    Base: {formatINR(rule.unitPrice)} each
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    Bulk:{" "}
                    {rule.bulkDiscounts
                      .map((item) => `${item.minQty}+ → ${item.percent}% off`)
                      .join(" | ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </motion.section>
  );
}
