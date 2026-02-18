import { describe, expect, it } from 'vitest';
import { formatDateUTC, redactSecrets } from '@/lib/utils';

describe('formatDateUTC', () => {
  it('returns empty string for invalid dates', () => {
    expect(formatDateUTC('not-a-date')).toBe('');
  });

  it('formats a valid ISO date in UTC', () => {
    expect(formatDateUTC('2026-02-18T00:00:00.000Z')).toBe('18 Feb 2026');
  });
});

describe('redactSecrets', () => {
  it('redacts common secret formats', () => {
    const input =
      'token sk-abcdefghijklmnopqrstuvwxyz1234 and ghp_abcdefghijklmnopqrstuvwxyz1234';

    const output = redactSecrets(input);

    expect(output).not.toContain('sk-');
    expect(output).not.toContain('ghp_');
    expect(output).toContain('<REDACTED_SECRET>');
  });
});
