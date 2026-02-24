'use client';

import { Code2, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnalyticsEvent, trackEvent } from '@/lib/analytics';
import { onAuthChange, signOut } from '@/lib/auth/client';
import { LetterGlitch } from '../LetterGlitch';

const HeaderSmall = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const menuPanelRef = useRef<HTMLElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) =>
      setUserEmail(user?.email ?? null),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus();
        lastFocusedElementRef.current = null;
      }
      return;
    }

    document.body.style.overflow = 'hidden';
    lastFocusedElementRef.current =
      document.activeElement as HTMLElement | null;
    const focusables = menuPanelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !menuPanelRef.current) {
        return;
      }

      const elements = Array.from(
        menuPanelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));

      if (elements.length === 0) {
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const logout = async () => {
    trackEvent(AnalyticsEvent.MenuSignOutClick, {
      location: 'header_menu',
      label: 'sign_out',
    });
    await signOut();
    setMenuOpen(false);
    router.push('/');
  };

  const trackMenuLinkClick = (href: string, label: string) => {
    trackEvent(AnalyticsEvent.MenuLinkClick, {
      href,
      label,
      location: 'header_menu',
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg transition-all duration-500">
        <div className="absolute inset-0 -z-10 opacity-50">
          <LetterGlitch
            glitchColors={[
              '#040F0F',
              '#248232',
              '#2BA84A',
              '#2D3A3A',
              '#FCFFFC',
            ]}
            glitchSpeed={50}
            centerVignette={false}
            outerVignette={false}
            smooth={true}
            characters="dvlprDVLPR!@#$&*()-_+=/[]{};:<>.,"
          />
        </div>
        <div className="relative z-10 h-16 md:h-20 w-full max-w-7xl mx-auto px-6 flex flex-row items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity group"
            onClick={() => trackMenuLinkClick('/', 'brand_home')}
          >
            <div className="bg-[#2BA84A] p-2 rounded-lg text-[#FCFFFC] shadow-md shadow-[#2BA84A]/30">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-[#FCFFFC] tracking-tight">
              Prompt Coach by{' '}
              <span className="font-mono text-xl font-bold leading-none tracking-tighter text-bright-green">
                <span className="group-hover:underline">dvlpr</span>
                <span className="animate-pulse">&gt;_</span>
              </span>
            </h1>
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-white/20 bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-60 overflow-hidden"
          aria-hidden={!menuOpen}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/25 backdrop-blur-md"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
          />

          <nav
            id="primary-nav"
            ref={menuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation menu"
            className="absolute right-0 top-0 h-full w-[min(90vw,22rem)] bg-white shadow-2xl border-l border-[#2D3A3A]/15 p-6"
          >
            <div className="flex items-center justify-between border-b border-[#2D3A3A]/15 pb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2D3A3A]">
                Menu
              </h2>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#2D3A3A]/20 p-2 text-[#2D3A3A] hover:bg-[#2D3A3A]/5"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="space-y-4 text-base text-[#040F0F] pt-6">
              <li>
                <Link
                  href="/#recent-prompts"
                  onClick={() => {
                    trackMenuLinkClick('/#recent-prompts', 'recent_analyses');
                    setMenuOpen(false);
                  }}
                  className="hover:text-[#248232]"
                >
                  Recent analyses
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  onClick={() => {
                    trackMenuLinkClick('/', 'prompt_editor');
                    setMenuOpen(false);
                  }}
                  className="hover:text-[#248232]"
                >
                  Prompt editor
                </Link>
              </li>
              {userEmail && (
                <li>
                  <Link
                    href="/search"
                    onClick={() => {
                      trackMenuLinkClick('/search', 'search_history');
                      setMenuOpen(false);
                    }}
                    className="hover:text-[#248232]"
                  >
                    Search history
                  </Link>
                </li>
              )}
              {!userEmail && (
                <li>
                  <Link
                    href="/auth?returnTo=/"
                    onClick={() => {
                      trackEvent(AnalyticsEvent.MenuSignInClick, {
                        location: 'header_menu',
                        label: 'sign_in',
                        href: '/auth?returnTo=/',
                      });
                      trackMenuLinkClick('/auth?returnTo=/', 'sign_in');
                      setMenuOpen(false);
                    }}
                    className="hover:text-[#248232]"
                  >
                    Sign in / Create account
                  </Link>
                </li>
              )}
              {userEmail && (
                <>
                  <li className="text-sm text-[#2D3A3A] break-all">
                    Signed in as: {userEmail}
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      className="hover:text-[#248232]"
                    >
                      Sign out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};
export { HeaderSmall };
