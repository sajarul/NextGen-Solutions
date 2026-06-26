import type { PortfolioCategoryKey, PricingPlan } from "@/lib/types";

export const NAV_LINKS = [
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "pricing", label: "Pricing" },
  { id: "estimator", label: "Estimator" },
  { id: "testimonials", label: "Testimonials" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" }
];

export const SERVICE_CARDS: {
  title: string;
  description: string;
  category: PortfolioCategoryKey;
  preview: string;
}[] = [
  {
    title: "Poster Design",
    description: "Campaign posters built for instant visual impact and brand recall.",
    category: "poster",
    preview: "/services/poster.svg"
  },
  {
    title: "Social Media Posts",
    description: "High-conversion static and carousel creatives optimized for engagement.",
    category: "social",
    preview: "/services/social.svg"
  },
  {
    title: "YouTube Thumbnails",
    description: "Scroll-stopping thumbnails engineered for stronger click-through rates.",
    category: "thumbnail",
    preview: "/services/thumbnail.svg"
  },
  {
    title: "Business Card Design",
    description: "Premium identity cards crafted to leave a lasting first impression.",
    category: "business_card",
    preview: "/services/business-card.svg"
  },
  {
    title: "Wedding Card Design",
    description: "Elegant invitations balancing timeless aesthetics with modern details.",
    category: "wedding_card",
    preview: "/services/wedding-card.svg"
  },
  {
    title: "Book Cover Design",
    description: "Cover systems that translate story tone into a market-ready visual.",
    category: "book_cover",
    preview: "/services/book-cover.svg"
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    code: "basic",
    name: "Basic Plan",
    price: "₹1,999",
    subtitle: "For single creative needs",
    revisions: "2 revisions",
    delivery: "2-3 days",
    services: ["1 Design Concept", "High-resolution export", "Web + social format"],
    recommended: false
  },
  {
    code: "standard",
    name: "Standard Plan",
    price: "₹4,999",
    subtitle: "For active brands",
    revisions: "5 revisions",
    delivery: "3-5 days",
    services: [
      "Up to 3 design assets",
      "Brand-aligned creative direction",
      "Priority support",
      "Editable source file"
    ],
    recommended: true
  },
  {
    code: "premium",
    name: "Premium Plan",
    price: "₹9,999",
    subtitle: "For campaigns and launches",
    revisions: "Unlimited revisions",
    delivery: "5-7 days",
    services: [
      "Up to 8 design assets",
      "Creative strategy consultation",
      "Campaign-ready export pack",
      "Dedicated revision window"
    ],
    recommended: false
  }
];

export const PORTFOLIO_LABELS: Record<PortfolioCategoryKey, string> = {
  poster: "Poster Design",
  social: "Social Media",
  thumbnail: "YouTube Thumbnails",
  business_card: "Business Cards",
  wedding_card: "Wedding Cards",
  book_cover: "Book Covers"
};
