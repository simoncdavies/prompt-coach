'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Footer } from '@/components/Footer';
import { HeaderSmall } from '@/components/HeaderSmall';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AnalyticsEvent, trackEvent } from '@/lib/analytics';
import { getAccessToken, getAuthHeaders } from '@/lib/auth/client';
import { formatDateUTC } from '@/lib/utils';

interface SearchRun {
  id: string;
  created_at: string;
  overall_score: number;
  prompt_original: string;
  is_public: boolean;
  metadata: {
    targetModel?: string;
  };
}

export default function SearchPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<SearchRun[]>([]);
  const [page, setPage] = useState(1);
  const [onlyMine, setOnlyMine] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(true);

  const fetchPage = useCallback(
    async (nextPage: number, replace = false) => {
      const token = await getAccessToken();
      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          onlyMine: String(onlyMine),
        });
        const res = await fetch(`/api/search?${params.toString()}`, {
          headers: await getAuthHeaders(),
          cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Could not load prompt history');
        }
        const nextRuns = (json.runs ?? []) as SearchRun[];
        setRuns((prev) => (replace ? nextRuns : [...prev, ...nextRuns]));
        setPage(nextPage);
        setHasMore(Boolean(json.hasMore));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [onlyMine],
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  return (
    <main className="min-h-screen bg-[#FCFFFC]">
      <HeaderSmall />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#040F0F]">Prompt History</h1>
          <p className="text-[#2D3A3A] text-sm">
            Browse your saved reviews and public prompts, 20 at a time.
          </p>
        </div>

        {!authorized ? (
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="text-sm text-[#2D3A3A]">
                Sign in to view and search prompt history.
              </p>
              <Button
                onClick={() => {
                  trackEvent(AnalyticsEvent.SearchAuthCtaClicked, {
                    source: 'search_page',
                    href: '/auth?returnTo=/search',
                  });
                  router.push('/auth?returnTo=/search');
                }}
              >
                Sign in / Create account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <input
                id="onlyMine"
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => {
                  trackEvent(AnalyticsEvent.SearchFilterChanged, {
                    source: 'search_page',
                    onlyMine: e.target.checked,
                  });
                  setOnlyMine(e.target.checked);
                }}
                className="rounded border-[#2D3A3A]/40 text-[#2BA84A] focus:ring-[#2BA84A]"
              />
              <label htmlFor="onlyMine" className="text-sm text-[#2D3A3A]">
                Only show my prompts
              </label>
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runs.map((run) => (
                <Card
                  key={run.id}
                  className="hover:shadow-md transition-all cursor-pointer border-[#2D3A3A]/20 hover:border-[#2BA84A] group"
                  onClick={() => {
                    trackEvent(AnalyticsEvent.SearchResultOpened, {
                      source: 'search_page',
                      runId: run.id,
                      page,
                      onlyMine,
                    });
                    router.push(`/prompt/${run.id}`);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge
                        variant={
                          run.overall_score >= 8
                            ? 'success'
                            : run.overall_score >= 5
                              ? 'warning'
                              : 'destructive'
                        }
                      >
                        Score {run.overall_score}/10
                      </Badge>
                      <span className="text-xs text-[#2D3A3A]/70">
                        {formatDateUTC(run.created_at)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-[#2D3A3A] line-clamp-3 font-mono mb-2">
                      {run.prompt_original}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-[10px]">
                        {run.metadata?.targetModel || 'Not set'}
                      </Badge>
                      <Badge
                        variant={run.is_public ? 'success' : 'outline'}
                        className="text-[10px]"
                      >
                        {run.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="pt-2">
                <Button
                  onClick={() => {
                    trackEvent(AnalyticsEvent.SearchLoadMoreClicked, {
                      source: 'search_page',
                      fromPage: page,
                      onlyMine,
                    });
                    fetchPage(page + 1);
                  }}
                  isLoading={loading}
                >
                  Load 20 more results
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
