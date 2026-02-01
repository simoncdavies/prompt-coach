export type AnalyticsEventParams = Record<string, unknown>;

export function trackEvent(action: string, params: AnalyticsEventParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = (
    window as typeof window & {
      gtag?: (command: "config" | "event" | "js", ...args: unknown[]) => void;
    }
  ).gtag;

  if (typeof gtag !== "function") {
    return;
  }

  gtag("event", action, params);
}
