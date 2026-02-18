import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession, onAuthStateChange, signInWithPassword, signUp, signOut } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession,
      onAuthStateChange,
      signInWithPassword,
      signUp,
      signOut,
    },
  },
}));

import {
  authFetch,
  getAccessToken,
  getAuthHeaders,
  getCurrentUser,
  signOut as logout,
  onAuthChange,
  signUp as register,
  signInWithPassword as signIn,
} from '@/lib/auth/client';

describe('auth client helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCurrentUser returns normalized user', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1', email: 'u1@example.com' } } },
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: 'u1',
      email: 'u1@example.com',
    });
  });

  it('onAuthChange subscribes, emits current session, and unsubscribes', async () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();

    onAuthStateChange.mockImplementation(
      (
        handler: (
          event: string,
          session: { user?: { id: string; email?: string | null } } | null,
        ) => void,
      ) => {
        handler('SIGNED_IN', { user: { id: 'u2', email: 'u2@example.com' } });
        return { data: { subscription: { unsubscribe } } };
      },
    );

    getSession.mockResolvedValue({
      data: { session: { user: { id: 'u3', email: 'u3@example.com' } } },
    });

    const stop = onAuthChange(callback);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith({
      id: 'u2',
      email: 'u2@example.com',
    });
    expect(callback).toHaveBeenCalledWith({
      id: 'u3',
      email: 'u3@example.com',
    });

    stop();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('signIn/signUp return expected flags and signOut delegates', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'token' },
        user: { email: 'in@example.com' },
      },
      error: null,
    });
    signUp.mockResolvedValue({
      data: { session: null, user: { email: 'new@example.com' } },
      error: null,
    });

    await expect(signIn('in@example.com', 'pw')).resolves.toEqual({
      signedIn: true,
      needsEmailConfirmation: false,
      email: 'in@example.com',
    });

    await expect(register('new@example.com', 'pw')).resolves.toEqual({
      signedIn: false,
      needsEmailConfirmation: true,
      email: 'new@example.com',
    });

    await logout();
    expect(signOut).toHaveBeenCalled();
  });

  it('adds bearer token to headers and uses authFetch', async () => {
    getSession.mockResolvedValue({
      data: { session: { access_token: 'abc123' } },
    });

    const headers = await getAuthHeaders({ 'X-Test': '1' });
    expect(headers.get('Authorization')).toBe('Bearer abc123');
    expect(headers.get('X-Test')).toBe('1');

    await expect(getAccessToken()).resolves.toBe('abc123');

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await authFetch('/api/demo', { method: 'POST' });

    expect(fetchSpy).toHaveBeenCalled();
    const [, init] = fetchSpy.mock.calls[0];
    const requestHeaders = new Headers(init?.headers);
    expect(requestHeaders.get('Authorization')).toBe('Bearer abc123');

    fetchSpy.mockRestore();
  });
});
