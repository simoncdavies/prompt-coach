import { afterEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.fn(() => ({ mock: 'server' }));

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

describe('supabase server env wiring', () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    createClient.mockClear();
  });

  it('creates server client when required env vars exist', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const mod = await import('@/lib/supabase/server');

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'service-role-key',
    );
    expect(mod.supabaseServer).toEqual({ mock: 'server' });
  });

  it('throws when service role key is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';

    await expect(import('@/lib/supabase/server')).rejects.toThrow(
      'Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY',
    );
  });
});
