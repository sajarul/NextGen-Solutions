export type PortfolioCategoryKey =
  | "poster"
  | "social"
  | "thumbnail"
  | "business_card"
  | "wedding_card"
  | "book_cover";

export interface PortfolioItem {
  id: number;
  title: string;
  category: PortfolioCategoryKey;
  category_label: string;
  description: string;
  client: string;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  category_label: string;
  badge_text: string;
  tier_text: string;
  cta_text: string;
  image_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  rating: number;
  review: string;
  client_role: string;
  profile_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type PaymentStatus = "created" | "submitted" | "paid" | "failed" | "cancelled";

export interface PaymentOrder {
  id: number;
  plan_code: PaymentPlanCode;
  plan_name: string;
  amount_paise: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_details: string;
  payment_mode: string;
  payer_name: string;
  transaction_reference: string;
  status: PaymentStatus;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  failure_reason: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export type PaymentPlanCode = "basic" | "standard" | "premium";

export interface PricingPlan {
  code: PaymentPlanCode;
  name: string;
  price: string;
  subtitle: string;
  revisions: string;
  delivery: string;
  services: string[];
  recommended: boolean;
}

export interface PaymentOrderCreatePayload {
  plan_code: PaymentPlanCode;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_details?: string;
}

export interface PaymentOrderCreateResponse {
  local_order_id: number;
  razorpay_order_id: string;
  key_id: string;
  amount: number;
  currency: string;
  plan_name: string;
  contact_commitment: string;
}

export interface PaymentVerifyPayload {
  local_order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ManualPaymentCreateResponse {
  local_order_id: number;
  plan_name: string;
  amount: number;
  currency: string;
  amount_rupees: string;
  upi_uri: string;
  qr_image_url: string;
  detail: string;
}

export interface ManualPaymentSubmitPayload {
  local_order_id: number;
  transaction_reference: string;
  payer_name?: string;
}

export interface ManualPaymentSubmitResponse {
  detail: string;
  status: string;
  receipt_id: string;
  transaction_reference: string;
  notification_sent?: boolean;
}

export interface SiteContent {
  id: number;
  about_video_url: string | null;
  about_primary_image_url: string | null;
  about_secondary_image_url: string | null;
  updated_at: string;
}
