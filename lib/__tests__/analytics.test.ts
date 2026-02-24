import { describe, expect, it, vi } from 'vitest';
import { AnalyticsEvent, trackEvent } from '@/lib/analytics';

describe('trackEvent', () => {
  it('does nothing when gtag is unavailable', () => {
    const noGtagWindow = window as typeof window & {
      gtag?: (...args: unknown[]) => void;
    };

    noGtagWindow.gtag = undefined;

    expect(() => trackEvent('test_action', { a: 1 })).not.toThrow();
  });

  it('calls gtag with event payload when available', () => {
    const gtag = vi.fn();
    (window as typeof window & { gtag?: typeof gtag }).gtag = gtag;

    trackEvent(AnalyticsEvent.PromptEnhancementCreated, { source: 'ui' });

    expect(gtag).toHaveBeenCalledWith('event', 'prompt_enhancement_created', {
      source: 'ui',
    });
  });
});
