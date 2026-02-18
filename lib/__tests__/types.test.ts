import { describe, expect, it } from 'vitest';
import {
  AnalyzerResultSchema,
  RunAnalysisSchema,
  TARGET_MODELS,
  VERBOSITY_LEVELS,
} from '@/lib/types';

describe('types schemas', () => {
  it('exports expected model and verbosity options', () => {
    expect(TARGET_MODELS).toEqual(['OpenAI', 'Claude', 'Gemini']);
    expect(VERBOSITY_LEVELS).toEqual(['concise', 'normal', 'thorough']);
  });

  it('applies defaults in RunAnalysisSchema', () => {
    const parsed = RunAnalysisSchema.parse({
      prompt: 'Write tests for this route handler',
      metadata: {
        targetModel: 'OpenAI',
        outputStyle: 'diff',
        verbosity: 'normal',
      },
    });

    expect(parsed.save).toBe(false);
    expect(parsed.isPublic).toBe(false);
  });

  it('validates AnalyzerResultSchema score boundaries', () => {
    expect(() =>
      AnalyzerResultSchema.parse({
        overall_score: 11,
        scores: {
          goal_clarity: 5,
          context: 5,
          constraints: 5,
          output_format: 5,
          examples_tests: 5,
          ambiguity: 5,
          safety_secrets: 5,
        },
        issues: [],
        questions_to_ask: [],
        rewrite_plan: [],
      }),
    ).toThrow();
  });
});
