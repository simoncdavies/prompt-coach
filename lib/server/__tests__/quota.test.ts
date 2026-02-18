import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpc, getUserById, from } = vi.hoisted(() => ({
  rpc: vi.fn(),
  getUserById: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    rpc,
    from,
    auth: {
      admin: {
        getUserById,
      },
    },
  },
}));

import { consumeQuota, getQuotaStatus } from '@/lib/server/quota';

function mockFallbackQueries(options: {
  used: number;
  limit: number;
  isUnlimited: boolean;
}) {
  from.mockImplementation((table: string) => {
    if (table === 'user_plans') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                monthly_limit: options.limit,
                is_unlimited: options.isUnlimited,
              },
            }),
          }),
        }),
      };
    }

    if (table === 'prompt_enhancer_usage') {
      return {
        select: () => ({
          eq: () => ({
            eq: async () => ({ count: options.used, error: null }),
          }),
        }),
        insert: async () => ({ error: null }),
      };
    }

    if (table === 'prompt_enhancer_attempts') {
      return {
        insert: async () => ({ error: null }),
      };
    }

    return {
      insert: async () => ({ error: null }),
    };
  });
}

describe('quota helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserById.mockResolvedValue({
      data: { user: { created_at: '2026-01-31T10:00:00.000Z' } },
      error: null,
    });
  });

  it('normalizes rpc payload from getQuotaStatus', async () => {
    rpc.mockResolvedValue({
      data: {
        allowed: 1,
        is_unlimited: 0,
        used: '2',
        limit: '5',
        remaining: '3',
        reset_at: '2026-03-01T00:00:00.000Z',
      },
      error: null,
    });

    await expect(getQuotaStatus('user-1')).resolves.toEqual({
      allowed: true,
      is_unlimited: false,
      used: 2,
      limit: 5,
      remaining: 3,
      reset_at: '2026-03-01T00:00:00.000Z',
    });
  });

  it('falls back when rpc fails in getQuotaStatus', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('rpc unavailable') });
    mockFallbackQueries({ used: 2, limit: 5, isUnlimited: false });

    const result = await getQuotaStatus('user-1');

    expect(result.allowed).toBe(true);
    expect(result.used).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.remaining).toBe(3);
    expect(result.reset_at).toMatch(/T00:00:00.000Z$/);
  });

  it('falls back in consumeQuota and records attempt', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('rpc unavailable') });
    mockFallbackQueries({ used: 1, limit: 3, isUnlimited: false });

    const result = await consumeQuota('user-1', { source: 'test' });

    expect(result.allowed).toBe(true);
    expect(from).toHaveBeenCalledWith('prompt_enhancer_attempts');
    expect(from).toHaveBeenCalledWith('prompt_enhancer_usage');
  });
});
