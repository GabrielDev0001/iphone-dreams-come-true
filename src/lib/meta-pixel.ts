const STORAGE_EVENT_ID_PURCHASE = "meta_event_id_purchase";
const STORAGE_EVENT_ID_LEAD = "meta_event_id_lead";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export function pixelId(): string | undefined {
  return import.meta.env["VITE_META_PIXEL_ID"] as string | undefined;
}

export function pixelAtivo(): boolean {
  return Boolean(pixelId() && typeof window !== "undefined" && typeof window.fbq === "function");
}

export function lerCookie(nome: string): string | null {
  if (typeof document === "undefined") return null;
  const prefixo = `${nome}=`;
  for (const parte of document.cookie.split(";")) {
    const p = parte.trim();
    if (p.startsWith(prefixo)) return decodeURIComponent(p.slice(prefixo.length));
  }
  return null;
}

export function cookiesMeta(): { fbp: string | null; fbc: string | null } {
  return { fbp: lerCookie("_fbp"), fbc: lerCookie("_fbc") };
}

export function novoEventId(): string {
  return crypto.randomUUID();
}

export function guardarEventIdPurchase(eventId: string) {
  try {
    sessionStorage.setItem(STORAGE_EVENT_ID_PURCHASE, eventId);
  } catch {
    // private mode / quota
  }
}

export function lerEventIdPurchase(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_EVENT_ID_PURCHASE);
  } catch {
    return null;
  }
}

export function guardarEventIdLead(eventId: string) {
  try {
    sessionStorage.setItem(STORAGE_EVENT_ID_LEAD, eventId);
  } catch {
    // ignore
  }
}

type PixelParams = Record<string, string | number | string[] | undefined>;

export function trackPixel(
  eventName: string,
  params?: PixelParams,
  eventId?: string,
) {
  if (!pixelAtivo()) return;
  if (eventId) {
    window.fbq!("track", eventName, params ?? {}, { eventID: eventId });
  } else {
    window.fbq!("track", eventName, params ?? {});
  }
}

export function trackViewContent(content: {
  content_name: string;
  content_ids: string[];
  value?: number;
  currency?: string;
}) {
  trackPixel("ViewContent", {
    content_name: content.content_name,
    content_ids: content.content_ids,
    content_type: "product",
    value: content.value,
    currency: content.currency ?? "BRL",
  });
}

export function trackLead(eventId: string, value?: number) {
  trackPixel(
    "Lead",
    { value: value ?? 0, currency: "BRL" },
    eventId,
  );
}

export function trackInitiateCheckout(value: number, eventId?: string) {
  trackPixel(
    "InitiateCheckout",
    { value, currency: "BRL", content_type: "product" },
    eventId,
  );
}

export function trackPurchase(value: number, eventId: string) {
  trackPixel("Purchase", { value, currency: "BRL" }, eventId);
}
