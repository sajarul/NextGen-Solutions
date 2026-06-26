"use client";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#02040a] px-4 pb-10 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <h3 className="max-w-4xl font-[var(--font-poppins)] text-3xl font-semibold uppercase leading-[0.98] sm:text-6xl">
          The Right Creative Partner
          <span className="stroke-hero block">For Your Brand</span>
        </h3>

        <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Email</p>
            <a href="mailto:sksajarulhoque@gmail.com" className="mt-3 block text-sm hover:text-brand-300">
              sksajarulhoque@gmail.com
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Phone</p>
            <a href="tel:+917076529970" className="mt-3 block text-sm hover:text-brand-300">
              +91 7076529970
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Social</p>
            <div className="mt-3 space-y-2 text-sm">
              <a href="https://www.instagram.com/nextgensolutlons/" target="_blank" rel="noreferrer" className="block hover:text-brand-300">
                Instagram
              </a>
              <a href="https://wa.me/917076529970" target="_blank" rel="noreferrer" className="block hover:text-brand-300">
                WhatsApp
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Services</p>
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">
              Posters, Social Posts, YouTube Thumbnails, Business Cards, Wedding Cards, Book Covers.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
          <p>© {new Date().getFullYear()} NextGen Solutions. All rights reserved.</p>
          <a href="#home" className="hover:text-white">
            Back to Top
          </a>
        </div>
      </div>
    </footer>
  );
}
