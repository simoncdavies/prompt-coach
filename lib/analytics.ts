export type AnalyticsEventParams = Record<string, unknown>;

export const AnalyticsEvent = {
  CookieAccept: 'cookie_accept',
  CookieReject: 'cookie_reject',
  EnhancerQuotaBlocked: 'enhancer_quota_blocked',
  PromptEnhancementCreated: 'prompt_enhancement_created',
  EnhancerAuthGateShown: 'enhancer_auth_gate_shown',
  EnhancerAuthConversion: 'enhancer_auth_conversion',
  SavedPromptOpenClicked: 'saved_prompt_open_clicked',
  SavedPromptViewed: 'saved_prompt_viewed',
  FooterLinkClick: 'footer_link_click',
  MenuLinkClick: 'menu_link_click',
  MenuSignInClick: 'menu_sign_in_click',
  MenuSignOutClick: 'menu_sign_out_click',
  AuthSignInSubmit: 'auth_sign_in_submit',
  AuthSignInSuccess: 'auth_sign_in_success',
  AuthSignInFailed: 'auth_sign_in_failed',
  AuthCreateAccountSubmit: 'auth_create_account_submit',
  AuthCreateAccountSuccess: 'auth_create_account_success',
  AuthCreateAccountFailed: 'auth_create_account_failed',
  AuthModalShown: 'auth_modal_shown',
  SearchResultOpened: 'search_result_opened',
  SearchFilterChanged: 'search_filter_changed',
  SearchLoadMoreClicked: 'search_load_more_clicked',
  SearchAuthCtaClicked: 'search_auth_cta_clicked',
  RewriteCopied: 'rewrite_copied',
  RewriteTabChanged: 'rewrite_tab_changed',
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export function trackEvent(
  action: AnalyticsEventName | (string & {}),
  params: AnalyticsEventParams = {},
) {
  if (typeof window === 'undefined') {
    return;
  }

  const analyticsWindow = window as typeof window & {
    gtag?: (command: 'config' | 'event' | 'js', ...args: unknown[]) => void;
    google_tag_manager?: unknown;
    dataLayer?: Array<unknown>;
  };
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  const dataLayer = analyticsWindow.dataLayer;
  const hasGoogleTagManager = Boolean(analyticsWindow.google_tag_manager);

  if (hasGoogleTagManager) {
    dataLayer.push({ event: action, ...params });
    return;
  }

  if (typeof analyticsWindow.gtag === 'function') {
    analyticsWindow.gtag('event', action, params);
    return;
  }

  dataLayer.push(['event', action, params]);
}
