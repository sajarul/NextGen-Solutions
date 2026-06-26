"use client";

import { MessageCircleMore } from "lucide-react";

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/917076529970"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircleMore size={18} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
