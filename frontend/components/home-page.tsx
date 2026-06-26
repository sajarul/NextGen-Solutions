"use client";

import { useEffect, useMemo, useState } from "react";

import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { CustomCursor } from "@/components/custom-cursor";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { InstantPriceEstimatorSection } from "@/components/instant-price-estimator-section";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Navbar } from "@/components/navbar";
import { PagePreloader } from "@/components/page-preloader";
import { PortfolioSection } from "@/components/portfolio-section";
import { PricingSection } from "@/components/pricing-section";
import { ServicesSection } from "@/components/services-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { api } from "@/lib/api";
import { PORTFOLIO_LABELS, SERVICE_CARDS } from "@/lib/constants";
import type { PortfolioItem, ServiceItem, SiteContent, Testimonial } from "@/lib/types";

const fallbackPortfolio: PortfolioItem[] = [
  {
    id: 1,
    title: "Campaign Poster Concept",
    category: "poster",
    category_label: PORTFOLIO_LABELS.poster,
    description: "Dynamic event poster focused on hierarchy, impact, and premium visual rhythm.",
    client: "Demo",
    image_url: null,
    is_featured: true,
    is_published: true,
    created_at: ""
  },
  {
    id: 2,
    title: "Instagram Growth Pack",
    category: "social",
    category_label: PORTFOLIO_LABELS.social,
    description: "Carousel and static creatives optimized for high engagement and save rate.",
    client: "Demo",
    image_url: null,
    is_featured: true,
    is_published: true,
    created_at: ""
  },
  {
    id: 3,
    title: "YouTube CTR Pack",
    category: "thumbnail",
    category_label: PORTFOLIO_LABELS.thumbnail,
    description: "A/B-friendly thumbnail concepts designed for stronger click performance.",
    client: "Demo",
    image_url: null,
    is_featured: false,
    is_published: true,
    created_at: ""
  }
];

const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    client_name: "Amit Roy",
    rating: 5,
    review: "Our social media visuals looked instantly premium after working with NextGen Solutions.",
    client_role: "Founder",
    profile_image_url: null,
    is_featured: true,
    is_published: true,
    created_at: ""
  },
  {
    id: 2,
    client_name: "Mira Khan",
    rating: 5,
    review: "Fast communication, strong creative direction, and excellent final quality.",
    client_role: "Brand Manager",
    profile_image_url: null,
    is_featured: true,
    is_published: true,
    created_at: ""
  }
];

const fallbackServices: ServiceItem[] = SERVICE_CARDS.map((item, index) => ({
  id: index + 1,
  title: item.title,
  description: item.description,
  category: item.category,
  category_label: PORTFOLIO_LABELS[item.category],
  badge_text: "Design Service",
  tier_text: "Premium",
  cta_text: "Request this service",
  image_url: item.preview,
  is_published: true,
  display_order: index,
  created_at: ""
}));

const defaultCategories = Object.entries(PORTFOLIO_LABELS).map(([key, label]) => ({ key, label }));

export function HomePage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(fallbackPortfolio);
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [categories, setCategories] = useState<{ key: string; label: string }[]>(defaultCategories);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    const run = async () => {
      const [portfolioData, servicesData, categoriesData, testimonialsData, siteContentData] = await Promise.allSettled([
        api.getPortfolio(),
        api.getServices(),
        api.getPortfolioCategories(),
        api.getTestimonials(),
        api.getSiteContent()
      ]);
      const anySuccess =
        portfolioData.status === "fulfilled" ||
        servicesData.status === "fulfilled" ||
        categoriesData.status === "fulfilled" ||
        testimonialsData.status === "fulfilled" ||
        siteContentData.status === "fulfilled";
      if (!isMounted) {
        return;
      }

      setBackendOnline(anySuccess);

      if (portfolioData.status === "fulfilled") {
        const portfolioItems = Array.isArray(portfolioData.value)
          ? (portfolioData.value as unknown as PortfolioItem[])
          : portfolioData.value.results;
        if (portfolioItems.length > 0) {
          setPortfolio(portfolioItems);
        }
      }

      if (servicesData.status === "fulfilled") {
        const serviceItems = Array.isArray(servicesData.value)
          ? (servicesData.value as unknown as ServiceItem[])
          : servicesData.value.results;
        if (serviceItems.length > 0) {
          setServices(serviceItems);
        }
      }

      if (testimonialsData.status === "fulfilled") {
        const testimonialItems = Array.isArray(testimonialsData.value)
          ? (testimonialsData.value as unknown as Testimonial[])
          : testimonialsData.value.results;
        if (testimonialItems.length > 0) {
          setTestimonials(testimonialItems);
        }
      }

      if (categoriesData.status === "fulfilled" && categoriesData.value.results.length > 0) {
        setCategories(categoriesData.value.results);
      }

      if (siteContentData.status === "fulfilled") {
        setSiteContent(siteContentData.value);
      }

      if (!anySuccess) {
        retryTimer = setTimeout(() => {
          void run();
        }, 5000);
      }
    };

    void run();

    return () => {
      isMounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  const featuredTestimonials = useMemo(
    () => testimonials.filter((item) => item.is_published).slice(0, 6),
    [testimonials]
  );

  return (
    <main className="themed-scroll overflow-x-hidden">
      <PagePreloader />
      <CustomCursor />
      <Navbar />
      {!backendOnline ? (
        <div className="mx-auto mt-24 w-[95%] max-w-7xl rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Backend is not connected right now. Showing local preview content.
        </div>
      ) : null}
      <HeroSection />
      <MarqueeStrip text="Premium Graphic Design • Creative Direction • Visual Branding" />
      <ServicesSection items={services} />
      <PortfolioSection items={portfolio} categories={categories} />
      <PricingSection />
      <InstantPriceEstimatorSection />
      <MarqueeStrip text="Posters • Social Media • YouTube Thumbnails • Business Cards" reverse />
      <TestimonialsSection testimonials={featuredTestimonials} />
      <AboutSection siteContent={siteContent} />
      <ContactSection />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
