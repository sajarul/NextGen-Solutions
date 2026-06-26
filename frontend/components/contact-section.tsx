"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Instagram, MessageCircle, PhoneCall } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { api } from "@/lib/api";

const INSTAGRAM_URL = "https://www.instagram.com/nextgensolutlons/";
const WHATSAPP_LINK = "https://wa.me/917076529970";
const PHONE_NUMBER = "+91 7076529970";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const isValid = name.trim().length >= 2 && email.trim().length > 3 && message.trim().length >= 5;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await api.sendContactMessage({ name, email, message });
      setStatus({
        type: "success",
        message: response.notification_sent
          ? "Thank you! Message sent successfully. We will reach out soon."
          : "Thank you! Message received successfully. We will contact you shortly."
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Message could not be sent.";
      setStatus({ type: "error", message: messageText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      id="contact"
      className="section-anchor relative border-y border-white/10 bg-[#0a0e16] px-4 pb-24 pt-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0.8, filter: "grayscale(0.9) saturate(0.7)", y: 18 }}
      whileInView={{ opacity: 1, filter: "grayscale(0) saturate(1)", y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionTitle
          eyebrow="Contact"
          title="Let’s build standout creative assets for your brand"
          description="Share your requirements and I’ll respond with the best plan to deliver your project quickly and professionally."
          align="left"
          outlineWord="Contact"
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <form onSubmit={onSubmit} className="glass-panel rounded-2xl p-6 sm:p-8">
              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                Average response time: under 2 hours
              </div>
              <div className="grid gap-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-brand-400"
                    placeholder="Your full name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-brand-400"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">Message</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-brand-400"
                    placeholder="Tell me about your design requirement"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
                {!isValid ? (
                  <p className="text-xs text-[color:var(--text-muted)]">
                    Fill all fields properly to send your message.
                  </p>
                ) : null}

                {status ? (
                  <p className={`text-sm ${status.type === "success" ? "text-brand-300" : "text-rose-300"}`}>
                    {status.message}
                  </p>
                ) : null}
              </div>
            </form>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="glass-panel flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-1 sm:gap-4 sm:p-5"
              >
                <span className="rounded-xl bg-emerald-500/20 p-3 text-emerald-300">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">WhatsApp</p>
                  <p className="text-sm font-medium sm:text-base">Chat Instantly</p>
                  <p className="text-[11px] text-[color:var(--text-muted)] sm:text-xs">Fastest way to get project estimate</p>
                </div>
              </a>

              <a
                href={`tel:${PHONE_NUMBER.replace(/\s+/g, "")}`}
                className="glass-panel flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-1 sm:gap-4 sm:p-5"
              >
                <span className="rounded-xl bg-cyan-500/20 p-3 text-cyan-300">
                  <PhoneCall size={20} />
                </span>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Phone</p>
                  <p className="text-sm font-medium sm:text-base">{PHONE_NUMBER}</p>
                  <p className="text-[11px] text-[color:var(--text-muted)] sm:text-xs">For urgent design requirements</p>
                </div>
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="glass-panel col-span-2 flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-1 sm:gap-4 sm:p-5 lg:col-span-1"
              >
                <span className="rounded-xl bg-fuchsia-500/20 p-3 text-fuchsia-300">
                  <Instagram size={20} />
                </span>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Instagram</p>
                  <p className="text-sm font-medium sm:text-base">@nextgensolutlons</p>
                  <p className="text-[11px] text-[color:var(--text-muted)] sm:text-xs">See latest design drops and updates</p>
                </div>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </motion.section>
  );
}
