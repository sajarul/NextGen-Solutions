"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { PORTFOLIO_LABELS } from "@/lib/constants";
import type { ContactMessage, PaymentOrder, PortfolioItem, ServiceItem, SiteContent, Testimonial } from "@/lib/types";

type TabKey = "portfolio" | "services" | "testimonials" | "site_media" | "messages" | "payments";

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as { results: T[] }).results;
  }

  return [];
}

const initialPortfolioForm = {
  id: null as number | null,
  title: "",
  category: "poster",
  description: "",
  client: "",
  is_featured: false,
  is_published: true,
  image: null as File | null
};

const initialTestimonialForm = {
  id: null as number | null,
  client_name: "",
  client_role: "",
  rating: 5,
  review: "",
  is_featured: false,
  is_published: true,
  profile_image: null as File | null
};

const initialServiceForm = {
  id: null as number | null,
  title: "",
  category: "",
  description: "",
  is_published: true,
  image: null as File | null,
  remove_image: false
};

const SERVICE_PREVIEW_FALLBACK: Record<string, string> = {
  poster: "/services/poster.svg",
  social: "/services/social.svg",
  thumbnail: "/services/thumbnail.svg",
  business_card: "/services/business-card.svg",
  wedding_card: "/services/wedding-card.svg",
  book_cover: "/services/book-cover.svg"
};

const KNOWN_SERVICE_CATEGORIES = Object.entries(PORTFOLIO_LABELS).map(([key, label]) => ({
  key,
  label
}));

function normalizeCategoryKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_").replace(/&/g, "and");
}

function getServicePreviewForCategory(category: string): string {
  const key = normalizeCategoryKey(category);
  return SERVICE_PREVIEW_FALLBACK[key] || "/services/social.svg";
}

const initialSiteMediaForm = {
  about_video: null as File | null,
  about_primary_image: null as File | null,
  about_secondary_image: null as File | null
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("portfolio");
  const [error, setError] = useState<string | null>(null);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

  const [portfolioForm, setPortfolioForm] = useState(initialPortfolioForm);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonialForm);
  const [siteMediaForm, setSiteMediaForm] = useState(initialSiteMediaForm);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await api.me();
        await loadAll();
        setReady(true);
      } catch {
        router.replace("/admin/login");
      }
    };

    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const [portfolioData, serviceData, testimonialData, messageData, paymentData, siteContentData] = await Promise.all([
        api.adminPortfolioList(),
        api.adminServiceList(),
        api.adminTestimonialList(),
        api.adminMessageList(),
        api.adminPaymentOrderList(),
        api.adminSiteContentGet()
      ]);

      setPortfolioItems(asList<PortfolioItem>(portfolioData));
      setServiceItems(asList<ServiceItem>(serviceData));
      setTestimonials(asList<Testimonial>(testimonialData));
      setMessages(asList<ContactMessage>(messageData));
      setPaymentOrders(asList<PaymentOrder>(paymentData));
      setSiteContent(siteContentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.append("title", portfolioForm.title);
    data.append("category", portfolioForm.category);
    data.append("description", portfolioForm.description);
    data.append("client", portfolioForm.client);
    data.append("is_featured", String(portfolioForm.is_featured));
    data.append("is_published", String(portfolioForm.is_published));
    if (portfolioForm.image) {
      data.append("image", portfolioForm.image);
    }

    try {
      if (portfolioForm.id) {
        await api.adminPortfolioUpdate(portfolioForm.id, data);
      } else {
        await api.adminPortfolioCreate(data);
      }
      setPortfolioForm(initialPortfolioForm);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save portfolio item.");
    }
  };

  const saveService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.append("title", serviceForm.title);
    data.append("category", serviceForm.category);
    data.append("description", serviceForm.description);
    data.append("is_published", String(serviceForm.is_published));
    data.append("remove_image", String(serviceForm.remove_image));
    if (serviceForm.image) {
      data.append("image", serviceForm.image);
    }

    try {
      if (serviceForm.id) {
        await api.adminServiceUpdate(serviceForm.id, data);
      } else {
        await api.adminServiceCreate(data);
      }
      setServiceForm(initialServiceForm);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service.");
    }
  };

  const saveTestimonial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.append("client_name", testimonialForm.client_name);
    data.append("client_role", testimonialForm.client_role);
    data.append("rating", String(testimonialForm.rating));
    data.append("review", testimonialForm.review);
    data.append("is_featured", String(testimonialForm.is_featured));
    data.append("is_published", String(testimonialForm.is_published));
    if (testimonialForm.profile_image) {
      data.append("profile_image", testimonialForm.profile_image);
    }

    try {
      if (testimonialForm.id) {
        await api.adminTestimonialUpdate(testimonialForm.id, data);
      } else {
        await api.adminTestimonialCreate(data);
      }
      setTestimonialForm(initialTestimonialForm);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save testimonial.");
    }
  };

  const saveSiteMedia = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();

    if (siteMediaForm.about_video) {
      data.append("about_video", siteMediaForm.about_video);
    }
    if (siteMediaForm.about_primary_image) {
      data.append("about_primary_image", siteMediaForm.about_primary_image);
    }
    if (siteMediaForm.about_secondary_image) {
      data.append("about_secondary_image", siteMediaForm.about_secondary_image);
    }

    if (Array.from(data.keys()).length === 0) {
      setError("Please choose at least one file to upload.");
      return;
    }

    try {
      await api.adminSiteContentUpdate(data);
      setSiteMediaForm(initialSiteMediaForm);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update site media.");
    }
  };

  const unreadCount = useMemo(() => messages.filter((item) => !item.is_read).length, [messages]);
  const paidOrdersCount = useMemo(
    () => paymentOrders.filter((item) => item.status === "paid").length,
    [paymentOrders]
  );

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      router.replace("/admin/login");
    }
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[color:var(--text-muted)]">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-400">NextGen Admin</p>
            <h1 className="text-xl font-semibold sm:text-2xl">Dashboard Management</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-brand-400 hover:text-brand-300"
          >
            Logout
          </button>
        </header>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {[
            ["portfolio", `Portfolio (${portfolioItems.length})`],
            ["services", `Services (${serviceItems.length})`],
            ["testimonials", `Testimonials (${testimonials.length})`],
            ["site_media", "Site Media"],
            ["messages", `Messages (${messages.length}) • Unread ${unreadCount}`],
            ["payments", `Payments (${paymentOrders.length}) • Paid ${paidOrdersCount}`]
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as TabKey)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                activeTab === key
                  ? "bg-brand-500 text-slate-950"
                  : "glass-panel text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {loading ? <p className="text-sm text-[color:var(--text-muted)]">Refreshing data...</p> : null}

        {activeTab === "portfolio" ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={savePortfolio} className="glass-panel rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold">{portfolioForm.id ? "Edit" : "Add"} Portfolio Item</h2>
              <div className="space-y-3">
                <input
                  placeholder="Title"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <select
                  value={portfolioForm.category}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                >
                  {Object.entries(PORTFOLIO_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Client"
                  value={portfolioForm.client}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, client: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPortfolioForm((prev) => ({
                      ...prev,
                      image: e.target.files && e.target.files[0] ? e.target.files[0] : null
                    }))
                  }
                  className="w-full text-sm"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={portfolioForm.is_featured}
                    onChange={(e) => setPortfolioForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  Featured
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={portfolioForm.is_published}
                    onChange={(e) => setPortfolioForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                  />
                  Published
                </label>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950">
                    {portfolioForm.id ? "Update" : "Create"}
                  </button>
                  {portfolioForm.id ? (
                    <button
                      type="button"
                      onClick={() => setPortfolioForm(initialPortfolioForm)}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {portfolioItems.map((item) => (
                <article key={item.id} className="glass-panel rounded-2xl p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.title} width={84} height={84} className="h-20 w-20 rounded-xl object-cover" />
                      ) : (
                        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-brand-500/40 to-cyan-500/40" />
                      )}
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-xs text-[color:var(--text-muted)]">{item.category_label}</p>
                        <p className="mt-1 text-xs text-[color:var(--text-muted)]">{item.client || "No client"}</p>
                      </div>
                    </div>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setPortfolioForm({
                            id: item.id,
                            title: item.title,
                            category: item.category,
                            description: item.description,
                            client: item.client,
                            is_featured: item.is_featured,
                            is_published: item.is_published,
                            image: null
                          })
                        }
                        className="flex-1 rounded-full border border-white/20 px-3 py-1.5 text-xs sm:flex-none"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.adminPortfolioDelete(item.id);
                            await loadAll();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to delete portfolio item.");
                          }
                        }}
                        className="flex-1 rounded-full border border-rose-400/40 px-3 py-1.5 text-xs text-rose-300 sm:flex-none"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "services" ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={saveService} className="glass-panel rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold">{serviceForm.id ? "Edit" : "Add"} Service</h2>
              <div className="space-y-3">
                <input
                  placeholder="Service title"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <input
                  list="service-category-suggestions"
                  placeholder="Category (e.g. Branding, Web Design, Social Media)"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <datalist id="service-category-suggestions">
                  {KNOWN_SERVICE_CATEGORIES.map((category) => (
                    <option key={category.key} value={category.label} />
                  ))}
                </datalist>
                <textarea
                  placeholder="Service description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      image: e.target.files && e.target.files[0] ? e.target.files[0] : null,
                      remove_image: false
                    }))
                  }
                  className="w-full text-sm"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={serviceForm.is_published}
                    onChange={(e) => setServiceForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                  />
                  Published
                </label>

                {serviceForm.id ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={serviceForm.remove_image}
                      onChange={(e) =>
                        setServiceForm((prev) => ({
                          ...prev,
                          remove_image: e.target.checked,
                          image: e.target.checked ? null : prev.image
                        }))
                      }
                    />
                    Remove current image
                  </label>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950">
                    {serviceForm.id ? "Update" : "Create"}
                  </button>
                  {serviceForm.id ? (
                    <button
                      type="button"
                      onClick={() => setServiceForm(initialServiceForm)}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {serviceItems.map((item) => (
                <article key={item.id} className="glass-panel rounded-2xl p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <Image
                        src={item.image_url || getServicePreviewForCategory(item.category)}
                        alt={item.title}
                        width={84}
                        height={84}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-xs text-[color:var(--text-muted)]">
                          {item.category_label} • Order {item.display_order}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                          {item.is_published ? "Published" : "Draft"}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setServiceForm({
                            id: item.id,
                            title: item.title,
                            category: item.category,
                            description: item.description,
                            is_published: item.is_published,
                            image: null,
                            remove_image: false
                          })
                        }
                        className="flex-1 rounded-full border border-white/20 px-3 py-1.5 text-xs sm:flex-none"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.adminServiceDelete(item.id);
                            await loadAll();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to delete service.");
                          }
                        }}
                        className="flex-1 rounded-full border border-rose-400/40 px-3 py-1.5 text-xs text-rose-300 sm:flex-none"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "testimonials" ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={saveTestimonial} className="glass-panel rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold">{testimonialForm.id ? "Edit" : "Add"} Testimonial</h2>
              <div className="space-y-3">
                <input
                  placeholder="Client name"
                  value={testimonialForm.client_name}
                  onChange={(e) => setTestimonialForm((prev) => ({ ...prev, client_name: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <input
                  placeholder="Client role"
                  value={testimonialForm.client_role}
                  onChange={(e) => setTestimonialForm((prev) => ({ ...prev, client_role: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={testimonialForm.rating}
                  onChange={(e) => setTestimonialForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <textarea
                  placeholder="Review"
                  value={testimonialForm.review}
                  onChange={(e) => setTestimonialForm((prev) => ({ ...prev, review: e.target.value }))}
                  rows={4}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setTestimonialForm((prev) => ({
                      ...prev,
                      profile_image: e.target.files && e.target.files[0] ? e.target.files[0] : null
                    }))
                  }
                  className="w-full text-sm"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={testimonialForm.is_featured}
                    onChange={(e) => setTestimonialForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  Featured
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={testimonialForm.is_published}
                    onChange={(e) => setTestimonialForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                  />
                  Published
                </label>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950">
                    {testimonialForm.id ? "Update" : "Create"}
                  </button>
                  {testimonialForm.id ? (
                    <button
                      type="button"
                      onClick={() => setTestimonialForm(initialTestimonialForm)}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {testimonials.map((item) => (
                <article key={item.id} className="glass-panel rounded-2xl p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-medium">{item.client_name}</h3>
                      <p className="text-xs text-[color:var(--text-muted)]">{item.client_role || "Client"}</p>
                      <p className="mt-2 text-sm text-[color:var(--text-muted)]">{item.review}</p>
                    </div>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setTestimonialForm({
                            id: item.id,
                            client_name: item.client_name,
                            client_role: item.client_role,
                            rating: item.rating,
                            review: item.review,
                            is_featured: item.is_featured,
                            is_published: item.is_published,
                            profile_image: null
                          })
                        }
                        className="flex-1 rounded-full border border-white/20 px-3 py-1.5 text-xs sm:flex-none"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.adminTestimonialDelete(item.id);
                            await loadAll();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to delete testimonial.");
                          }
                        }}
                        className="flex-1 rounded-full border border-rose-400/40 px-3 py-1.5 text-xs text-rose-300 sm:flex-none"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "site_media" ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={saveSiteMedia} className="glass-panel rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold">Update About Section Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                    About Loop Video (.mp4)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    onChange={(e) =>
                      setSiteMediaForm((prev) => ({
                        ...prev,
                        about_video: e.target.files && e.target.files[0] ? e.target.files[0] : null
                      }))
                    }
                    className="w-full text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                    About Image 1
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSiteMediaForm((prev) => ({
                        ...prev,
                        about_primary_image: e.target.files && e.target.files[0] ? e.target.files[0] : null
                      }))
                    }
                    className="w-full text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                    About Image 2
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSiteMediaForm((prev) => ({
                        ...prev,
                        about_secondary_image: e.target.files && e.target.files[0] ? e.target.files[0] : null
                      }))
                    }
                    className="w-full text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Save Site Media
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <article className="glass-panel rounded-2xl p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-300">
                  Current About Video
                </h3>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  {siteContent?.about_video_url ? (
                    <video
                      key={siteContent.about_video_url}
                      src={siteContent.about_video_url}
                      controls
                      loop
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      className="h-48 w-full object-cover"
                    >
                    </video>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-[color:var(--text-muted)]">
                      No video uploaded yet.
                    </div>
                  )}
                </div>
              </article>

              <article className="glass-panel rounded-2xl p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-300">
                  Current About Images
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative h-36 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                    {siteContent?.about_primary_image_url ? (
                      <Image
                        src={siteContent.about_primary_image_url}
                        alt="About image 1"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[color:var(--text-muted)]">
                        Image 1 not uploaded
                      </div>
                    )}
                  </div>
                  <div className="relative h-36 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                    {siteContent?.about_secondary_image_url ? (
                      <Image
                        src={siteContent.about_secondary_image_url}
                        alt="About image 2"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[color:var(--text-muted)]">
                        Image 2 not uploaded
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {activeTab === "messages" ? (
          <section className="space-y-4">
            {messages.length === 0 ? (
              <p className="glass-panel rounded-2xl p-4 text-sm text-[color:var(--text-muted)]">No contact messages yet.</p>
            ) : null}

            {messages.map((item) => (
              <article key={item.id} className="glass-panel rounded-2xl p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-xs text-[color:var(--text-muted)]">{item.email}</p>
                    <p className="mt-3 text-sm text-[color:var(--text-muted)]">{item.message}</p>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.adminMessageUpdate(item.id, { is_read: !item.is_read });
                          await loadAll();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Failed to update message state.");
                        }
                      }}
                      className="flex-1 rounded-full border border-white/20 px-3 py-1.5 text-xs sm:flex-none"
                    >
                      Mark as {item.is_read ? "Unread" : "Read"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.adminMessageDelete(item.id);
                          await loadAll();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Failed to delete message.");
                        }
                      }}
                      className="flex-1 rounded-full border border-rose-400/40 px-3 py-1.5 text-xs text-rose-300 sm:flex-none"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {activeTab === "payments" ? (
          <section className="space-y-4">
            {paymentOrders.length === 0 ? (
              <p className="glass-panel rounded-2xl p-4 text-sm text-[color:var(--text-muted)]">
                No payment orders yet.
              </p>
            ) : null}

            {paymentOrders.map((item) => (
              <article key={item.id} className="glass-panel rounded-2xl p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">
                      {item.plan_name} • ₹{(item.amount_paise / 100).toLocaleString("en-IN")}
                    </h3>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      {item.customer_name} • {item.customer_email} • {item.customer_phone}
                    </p>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      Status:{" "}
                      <span
                        className={
                          item.status === "paid"
                            ? "text-brand-300"
                            : item.status === "submitted"
                            ? "text-sky-300"
                            : item.status === "failed"
                            ? "text-rose-300"
                            : "text-amber-300"
                        }
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs text-[color:var(--text-muted)]">Mode: {item.payment_mode || "N/A"}</p>
                    {item.transaction_reference ? (
                      <p className="text-xs text-[color:var(--text-muted)]">
                        Txn ID: {item.transaction_reference}
                      </p>
                    ) : null}
                    <p className="text-xs text-[color:var(--text-muted)]">
                      Created: {new Date(item.created_at).toLocaleString("en-IN")}
                    </p>
                    {item.paid_at ? (
                      <p className="text-xs text-[color:var(--text-muted)]">
                        Paid: {new Date(item.paid_at).toLocaleString("en-IN")}
                      </p>
                    ) : null}
                    {item.project_details ? (
                      <p className="mt-2 text-sm text-[color:var(--text-muted)]">{item.project_details}</p>
                    ) : null}
                    {item.failure_reason ? (
                      <p className="text-xs text-rose-300">Failure: {item.failure_reason}</p>
                    ) : null}
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    {item.status === "submitted" ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.adminPaymentOrderUpdate(item.id, {
                              status: "paid",
                              failure_reason: ""
                            });
                            await loadAll();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to approve payment.");
                          }
                        }}
                        className="flex-1 rounded-full border border-brand-400/40 px-3 py-1.5 text-xs text-brand-300 sm:flex-none"
                      >
                        Mark Paid
                      </button>
                    ) : null}
                    {item.status === "submitted" || item.status === "created" ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.adminPaymentOrderUpdate(item.id, {
                              status: "failed",
                              failure_reason: "Rejected during manual verification"
                            });
                            await loadAll();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to reject payment.");
                          }
                        }}
                        className="flex-1 rounded-full border border-amber-400/40 px-3 py-1.5 text-xs text-amber-300 sm:flex-none"
                      >
                        Reject
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.adminPaymentOrderDelete(item.id);
                          await loadAll();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Failed to delete payment order.");
                        }
                      }}
                      className="flex-1 rounded-full border border-rose-400/40 px-3 py-1.5 text-xs text-rose-300 sm:flex-none"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
