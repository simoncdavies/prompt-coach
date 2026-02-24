import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { generateContent, GoogleGenAI } = vi.hoisted(() => ({
  generateContent: vi.fn(),
  GoogleGenAI: vi.fn(function GoogleGenAIConstructor() {
    return {
      models: {
        generateContent,
      },
    };
  }),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI,
}));

const metadata = {
  targetModel: 'OpenAI',
  outputStyle: 'diff',
  verbosity: 'normal',
} as const;

const analysisJson = JSON.stringify({
  overall_score: 8,
  scores: {
    goal_clarity: 4,
    context: 4,
    constraints: 4,
    output_format: 4,
    examples_tests: 4,
    ambiguity: 4,
    safety_secrets: 4,
  },
  issues: [],
  questions_to_ask: [],
  rewrite_plan: ['step 1'],
});

const rewriteJson = JSON.stringify({
  revised_prompt: '# Revised',
  minimal_prompt: 'Revised minimal',
  questions_needed: [],
});

describe('ai client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('throws on import when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(import('@/lib/ai/client')).rejects.toThrow(
      'Missing GEMINI_API_KEY environment variable',
    );
  });

  it('analyzes and rewrites using JSON responses', async () => {
    generateContent
      .mockResolvedValueOnce({
        candidates: [
          {
            content: {
              parts: [{ text: `\`\`\`json\n${analysisJson}\n\`\`\`` }],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ text: rewriteJson }] } }],
      });

    const mod = await import('@/lib/ai/client');

    const analysis = await mod.analyzePromptAI(
      'Prompt with enough length',
      metadata,
    );
    expect(analysis.overall_score).toBe(8);

    const rewrite = await mod.rewritePromptAI(
      'Prompt with enough length',
      analysis,
      metadata,
    );
    expect(rewrite.revised_prompt).toBe('# Revised');
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('throws when model output is not parseable JSON', async () => {
    generateContent.mockResolvedValue({
      candidates: [{ content: { parts: [{ text: 'not-json' }] } }],
    });

    const mod = await import('@/lib/ai/client');

    await expect(
      mod.analyzePromptAI('Prompt with enough length', metadata),
    ).rejects.toThrow('Failed to parse AI response as JSON');
  });
});
