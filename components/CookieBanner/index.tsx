'use client';
import { Button } from '@/components/ui/Button';
import useCookiesConsentStore from '@/hooks/useCookiesConsentStore';
import { AnalyticsEvent, trackEvent } from '@/lib/analytics';

export default function CookieBanner() {
  const { hasHydrated, hasSetPreference, setCookiesPref } =
    useCookiesConsentStore();

  if (!hasHydrated || hasSetPreference) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-2000 sm:inset-x-auto sm:right-6 sm:w-md">
      <div className="rounded-xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-sm">
        <p className="text-sm text-foreground">
          We use essential cookies to run this site. With your consent, we also
          use analytics and ad cookies.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCookiesPref(false);
              trackEvent(AnalyticsEvent.CookieReject);
            }}
          >
            Reject non-essential
          </Button>
          <Button
            type="button"
            onClick={() => {
              setCookiesPref(true);
              trackEvent(AnalyticsEvent.CookieAccept);
            }}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
