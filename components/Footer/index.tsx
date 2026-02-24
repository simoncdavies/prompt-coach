'use client';

import { FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { AnalyticsEvent, trackEvent } from '@/lib/analytics';

function trackFooterLinkClick(href: string, label: string) {
  trackEvent(AnalyticsEvent.FooterLinkClick, {
    href,
    label,
    location: 'footer',
  });
}

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-bright-green/10 bg-primary-dark pt-16 pb-12 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-bright-green/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-2xl font-bold tracking-tight text-off-white">
                Prompt <span className="text-bright-green">Coach</span>
              </span>
            </div>
            <p className="text-off-white/60 text-sm max-w-md leading-relaxed">
              Write clearer prompts and get better coding results from AI. Built
              for developers by{' '}
              <a
                href="https://dvlpr.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold leading-none tracking-tighter text-bright-green group no-underline"
                onClick={() =>
                  trackFooterLinkClick(
                    'https://dvlpr.co.uk',
                    'dvlpr_brand_link',
                  )
                }
              >
                <span className="group-hover:underline">dvlpr</span>
                <span className="animate-pulse">&gt;_</span>
              </a>
              .
            </p>
            <p className="text-off-white/40 text-xs">
              © 2026{' '}
              <a
                href="https://dvlpr.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold leading-none tracking-tighter text-bright-green group no-underline"
                onClick={() =>
                  trackFooterLinkClick(
                    'https://dvlpr.co.uk',
                    'dvlpr_copyright_link',
                  )
                }
              >
                <span className="group-hover:underline">dvlpr</span>
                <span className="animate-pulse">&gt;_</span>
              </a>
              . All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/dvlpr-ltd/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl bg-off-white/5 border border-off-white/10 text-off-white hover:border-bright-green/50 hover:bg-bright-green/5 transition-all duration-300"
                aria-label="Visit DVLPR on LinkedIn"
                onClick={() =>
                  trackFooterLinkClick(
                    'https://www.linkedin.com/company/dvlpr-ltd/',
                    'linkedin',
                  )
                }
              >
                <FaLinkedin className="w-6 h-6 group-hover:scale-110 transition-transform text-off-white/80 group-hover:text-bright-green" />
              </a>
              <a
                href="https://www.x.com/dvlprltd"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl bg-off-white/5 border border-off-white/10 text-off-white hover:border-bright-green/50 hover:bg-bright-green/5 transition-all duration-300"
                aria-label="Visit DVLPR on X"
                onClick={() =>
                  trackFooterLinkClick('https://www.x.com/dvlprltd', 'x')
                }
              >
                <FaXTwitter className="w-6 h-6 group-hover:scale-110 transition-transform text-off-white/80 group-hover:text-bright-green" />
              </a>
              <a
                href="https://www.instagram.com/dvlpr.ltd/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl bg-off-white/5 border border-off-white/10 text-off-white hover:border-bright-green/50 hover:bg-bright-green/5 transition-all duration-300"
                aria-label="Visit DVLPR on Instagram"
                onClick={() =>
                  trackFooterLinkClick(
                    'https://www.instagram.com/dvlpr.ltd/',
                    'instagram',
                  )
                }
              >
                <FaInstagram className="w-6 h-6 group-hover:scale-110 transition-transform text-off-white/80 group-hover:text-bright-green" />
              </a>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-off-white/5 border border-off-white/10">
              <div className="w-2 h-2 rounded-full bg-bright-green animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-off-white/60 font-medium">
                All systems running
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
