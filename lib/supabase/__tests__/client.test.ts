import { afterEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.fn(() => ({ mock: 'client' }));

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

describe('supabase client env wiring', () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    createClient.mockClear();
  });

  it('creates client when required env vars exist', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const mod = await import('@/lib/supabase/client');

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
    );
    expect(mod.supabase).toEqual({ mock: 'client' });
  });

  it('throws when env vars are missing', async () => {
    await expect(import('@/lib/supabase/client')).rejects.toThrow(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL',
    );
  });
});
