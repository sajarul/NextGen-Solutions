"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SERVICES = [
  "Poster Design",
  "Social Media Post Design",
  "YouTube Thumbnail Design",
  "Business Card Design",
  "Wedding Card Design",
  "Book Cover Design"
];

interface StartProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function StartProjectModal({ open, onClose }: StartProjectModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [details, setDetails] = useState("");

  const number = useMemo(
    () => (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917076529970").replace(/\D/g, ""),
    []
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setService(SERVICES[0]);
    setBudget("");
    setTimeline("");
    setDetails("");
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = [
      "*New Project Enquiry - NextGen Solutions*",
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Email: ${email.trim()}`,
      `Service Needed: ${service}`,
      `Budget: ${budget.trim() || "Not specified"}`,
      `Timeline: ${timeline.trim() || "Not specified"}`,
      "",
      "Project Details:",
      details.trim()
    ].join("\n");

    const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
        <motion.div
          className="glass-panel w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-white/15 p-5 sm:p-8"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Start Project</p>
                <h3 className="mt-2 text-2xl font-semibold">Send Project Brief on WhatsApp</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Fill this form and it will open WhatsApp with your complete project details.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"
                aria-label="Close popup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm">Your Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                  placeholder="Enter full name"
                />
              </label>

              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm">WhatsApp Number</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                  placeholder="e.g. +91 98xxxxxx"
                />
              </label>

              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                  placeholder="you@example.com"
                />
              </label>

              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm">Service Needed</span>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                >
                  {SERVICES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm">Budget (Optional)</span>
                <input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                  placeholder="e.g. ₹5,000 - ₹10,000"
                />
              </label>

              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm">Delivery Timeline (Optional)</span>
                <input
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                  placeholder="e.g. 3 days"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm">Project Details</span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                  placeholder="Describe your design requirement"
                />
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-950 transition hover:shadow-glow"
                >
                  Send on WhatsApp
                </button>
                <p className="mt-2 text-center text-xs text-[color:var(--text-muted)]">
                  WhatsApp will open in a new tab with your message.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
