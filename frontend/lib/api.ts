import type {
  AuthUser,
  ContactMessage,
  ManualPaymentCreateResponse,
  ManualPaymentSubmitPayload,
  ManualPaymentSubmitResponse,
  PaymentOrder,
  PaymentOrderCreatePayload,
  PaymentOrderCreateResponse,
  PaymentVerifyPayload,
  PortfolioItem,
  ServiceItem,
  SiteContent,
  Testimonial
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const withBase = (path: string) => `${API_BASE}${path}`;

function extractErrorMessage(payload: unknown): string {
  if (!payload) {
    return "Request failed";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload !== "object") {
    return "Request failed";
  }

  const objectPayload = payload as Record<string, unknown>;
  if (typeof objectPayload.detail === "string") {
    return objectPayload.detail;
  }

  const firstKey = Object.keys(objectPayload)[0];
  if (!firstKey) {
    return "Request failed";
  }

  const firstValue = objectPayload[firstKey];
  if (Array.isArray(firstValue) && firstValue.length > 0) {
    const message = firstValue[0];
    return typeof message === "string" ? message : JSON.stringify(message);
  }

  if (typeof firstValue === "string") {
    return firstValue;
  }

  return "Request failed";
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = extractErrorMessage(data);
    } catch {
      detail = res.statusText;
    }
    throw new Error(detail);
  }

  return (await res.json()) as T;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const parts = document.cookie.split(";").map((item) => item.trim());
  const match = parts.find((item) => item.startsWith(`${name}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.substring(name.length + 1));
}

export async function ensureCsrf(): Promise<string | null> {
  await fetch(withBase("/auth/csrf/"), {
    method: "GET",
    credentials: "include"
  });

  return getCookie("csrftoken");
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(withBase(path), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  return parseResponse<T>(res);
}

export async function apiSend<T>(
  path: string,
  options: {
    method: "POST" | "PATCH" | "PUT" | "DELETE";
    body?: FormData | Record<string, unknown>;
  }
): Promise<T> {
  const token = await ensureCsrf();
  const headers: Record<string, string> = {
    "X-CSRFToken": token ?? ""
  };

  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(withBase(path), {
    method: options.method,
    credentials: "include",
    headers,
    body
  });

  if (res.status === 204) {
    return {} as T;
  }

  return parseResponse<T>(res);
}

export const api = {
  getPortfolio: (category?: string) =>
    apiGet<{ results: PortfolioItem[] }>(
      `/portfolio/items/${category ? `?category=${category}` : ""}`
    ),
  getServices: () => apiGet<{ results: ServiceItem[] }>("/services/items/"),
  getSiteContent: () => apiGet<SiteContent>("/site/content/"),
  getPortfolioCategories: () => apiGet<{ results: { key: string; label: string }[] }>("/portfolio/categories/"),
  getTestimonials: () => apiGet<{ results: Testimonial[] }>("/testimonials/items/"),
  sendContactMessage: (payload: { name: string; email: string; message: string }) =>
    apiSend<{ detail: string; notification_sent?: boolean }>("/contacts/messages/", {
      method: "POST",
      body: payload
    }),
  login: (payload: { username: string; password: string }) =>
    apiSend<{ user: AuthUser }>("/auth/login/", { method: "POST", body: payload }),
  logout: () => apiSend<{ detail: string }>("/auth/logout/", { method: "POST" }),
  me: () => apiGet<{ user: AuthUser }>("/auth/me/"),
  forgotPasswordRequest: (email: string) =>
    apiSend<{ detail: string }>("/auth/forgot-password/request/", {
      method: "POST",
      body: { email }
    }),
  forgotPasswordConfirm: (payload: { email: string; code: string; new_password: string }) =>
    apiSend<{ detail: string }>("/auth/forgot-password/confirm/", {
      method: "POST",
      body: payload
    }),
  adminPortfolioList: () => apiGet<{ results: PortfolioItem[] }>("/portfolio/admin/items/"),
  adminPortfolioCreate: (payload: FormData) =>
    apiSend<PortfolioItem>("/portfolio/admin/items/", { method: "POST", body: payload }),
  adminPortfolioUpdate: (id: number, payload: FormData) =>
    apiSend<PortfolioItem>(`/portfolio/admin/items/${id}/`, { method: "PATCH", body: payload }),
  adminPortfolioDelete: (id: number) => apiSend(`/portfolio/admin/items/${id}/`, { method: "DELETE" }),
  adminServiceList: () => apiGet<{ results: ServiceItem[] }>("/services/admin/items/"),
  adminServiceCreate: (payload: FormData) =>
    apiSend<ServiceItem>("/services/admin/items/", { method: "POST", body: payload }),
  adminServiceUpdate: (id: number, payload: FormData) =>
    apiSend<ServiceItem>(`/services/admin/items/${id}/`, { method: "PATCH", body: payload }),
  adminServiceDelete: (id: number) => apiSend(`/services/admin/items/${id}/`, { method: "DELETE" }),
  adminTestimonialList: () => apiGet<{ results: Testimonial[] }>("/testimonials/admin/items/"),
  adminTestimonialCreate: (payload: FormData) =>
    apiSend<Testimonial>("/testimonials/admin/items/", { method: "POST", body: payload }),
  adminTestimonialUpdate: (id: number, payload: FormData) =>
    apiSend<Testimonial>(`/testimonials/admin/items/${id}/`, { method: "PATCH", body: payload }),
  adminTestimonialDelete: (id: number) => apiSend(`/testimonials/admin/items/${id}/`, { method: "DELETE" }),
  adminMessageList: () => apiGet<{ results: ContactMessage[] }>("/contacts/admin/messages/"),
  adminMessageUpdate: (id: number, payload: Record<string, unknown>) =>
    apiSend<ContactMessage>(`/contacts/admin/messages/${id}/`, { method: "PATCH", body: payload }),
  adminMessageDelete: (id: number) => apiSend(`/contacts/admin/messages/${id}/`, { method: "DELETE" }),
  adminSiteContentGet: () => apiGet<SiteContent>("/site/admin/content/"),
  adminSiteContentUpdate: (payload: FormData) =>
    apiSend<SiteContent>("/site/admin/content/", { method: "PATCH", body: payload }),
  adminPaymentOrderList: () => apiGet<{ results: PaymentOrder[] }>("/payments/admin/orders/"),
  adminPaymentOrderUpdate: (id: number, payload: Record<string, unknown>) =>
    apiSend<PaymentOrder>(`/payments/admin/orders/${id}/`, { method: "PATCH", body: payload }),
  adminPaymentOrderDelete: (id: number) => apiSend(`/payments/admin/orders/${id}/`, { method: "DELETE" }),
  createManualPaymentOrder: (payload: PaymentOrderCreatePayload) =>
    apiSend<ManualPaymentCreateResponse>("/payments/manual/create/", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>
    }),
  submitManualPayment: (payload: ManualPaymentSubmitPayload) =>
    apiSend<ManualPaymentSubmitResponse>("/payments/manual/submit/", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>
    }),
  createPaymentOrder: (payload: PaymentOrderCreatePayload) =>
    apiSend<PaymentOrderCreateResponse>("/payments/create-order/", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>
    }),
  verifyPayment: (payload: PaymentVerifyPayload) =>
    apiSend<{ detail: string; status: string; notification_sent?: boolean }>("/payments/verify/", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>
    })
};
