import { describe, expect, it } from 'vitest';
import {
  ANALYSIS_SYSTEM_PROMPT,
  REWRITE_SYSTEM_PROMPT,
} from '@/lib/ai/prompts';

describe('ai prompts', () => {
  it('analysis prompt requires strict JSON output', () => {
    expect(ANALYSIS_SYSTEM_PROMPT).toContain('STRICT valid JSON');
    expect(ANALYSIS_SYSTEM_PROMPT).toContain('overall_score');
  });

  it('rewrite prompt includes minimal prompt requirement', () => {
    expect(REWRITE_SYSTEM_PROMPT).toContain('Minimal');
    expect(REWRITE_SYSTEM_PROMPT).toContain('revised_prompt');
    expect(REWRITE_SYSTEM_PROMPT).toContain('minimal_prompt');
  });
});
