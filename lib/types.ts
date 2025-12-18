import { z } from 'zod';

// --- Shared Options ---

export const TARGET_MODELS = ['OpenAI', 'Claude', 'Gemini'] as const;
export const OUTPUT_STYLES = ['diff', 'full files', 'plan + code + tests'] as const;
export const VERBOSITY_LEVELS = ['concise', 'normal', 'thorough'] as const;

export type TargetModel = typeof TARGET_MODELS[number];
export type OutputStyle = typeof OUTPUT_STYLES[number];
export type VerbosityLevel = typeof VERBOSITY_LEVELS[number];

export const PromptMetadataSchema = z.object({
  targetModel: z.enum(TARGET_MODELS),
  outputStyle: z.enum(OUTPUT_STYLES),
  verbosity: z.enum(VERBOSITY_LEVELS),
});

export type PromptMetadata = z.infer<typeof PromptMetadataSchema>;

// --- API Request Schema ---

export const RunAnalysisSchema = z.object({
  prompt: z.string().min(10, "Prompt is too short"),
  metadata: PromptMetadataSchema,
  save: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export type RunAnalysisRequest = z.infer<typeof RunAnalysisSchema>;

// --- AI Response Schemas ---

export const IssueSchema = z.object({
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  evidence: z.string(),
  recommendation: z.string(),
});

export const ScoringSchema = z.object({
  goal_clarity: z.number().int().min(0).max(5),
  context: z.number().int().min(0).max(5),
  constraints: z.number().int().min(0).max(5),
  output_format: z.number().int().min(0).max(5),
  examples_tests: z.number().int().min(0).max(5),
  ambiguity: z.number().int().min(0).max(5),
  safety_secrets: z.number().int().min(0).max(5),
});

export const HighlightSuggestionSchema = z.object({
  label: z.string(),
  insert_text: z.string(),
});

export const AnalyzerResultSchema = z.object({
  overall_score: z.number().int().min(0).max(10),
  scores: ScoringSchema,
  issues: z.array(IssueSchema),
  questions_to_ask: z.array(z.string()),
  rewrite_plan: z.array(z.string()),
  highlight_suggestions: z.array(HighlightSuggestionSchema).optional(),
});

export type AnalyzerResult = z.infer<typeof AnalyzerResultSchema>;

export const RewriterResultSchema = z.object({
  revised_prompt: z.string(),
  minimal_prompt: z.string(),
  questions_needed: z.array(z.string()).optional(),
});

export type RewriterResult = z.infer<typeof RewriterResultSchema>;

// --- Combined Response ---

export interface RunResponse {
  analysis: AnalyzerResult;
  rewrite: RewriterResult;
  runId?: string;
  error?: string;
  prompt_original?: string;
  metadata?: PromptMetadata;
}


// --- Database Row Interface (Supabase) ---
export interface PromptRunRow {
  id: string;
  created_at: string;
  prompt_original: string;
  analysis_json: AnalyzerResult;
  prompt_rewritten: string;
  overall_score: number;
  metadata: PromptMetadata;
  is_public: boolean;
}
