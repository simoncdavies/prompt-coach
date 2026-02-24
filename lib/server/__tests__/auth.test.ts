import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    auth: {
      getUser,
    },
  },
}));

import { getUserFromRequest } from '@/lib/server/auth';

function makeRequest(authorization?: string): NextRequest {
  return {
    headers: new Headers(authorization ? { authorization } : undefined),
  } as unknown as NextRequest;
}

describe('getUserFromRequest', () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it('returns null when authorization header is missing or invalid', async () => {
    await expect(getUserFromRequest(makeRequest())).resolves.toBeNull();
    await expect(
      getUserFromRequest(makeRequest('Basic abc')),
    ).resolves.toBeNull();
  });

  it('returns null when supabase rejects token', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('bad'),
    });

    await expect(
      getUserFromRequest(makeRequest('Bearer token123')),
    ).resolves.toBeNull();
  });

  it('returns normalized auth user when token is valid', async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'dev@example.com',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      },
      error: null,
    });

    await expect(
      getUserFromRequest(makeRequest('Bearer token123')),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'dev@example.com',
      created_at: '2026-01-01T00:00:00.000Z',
    });
  });
});
