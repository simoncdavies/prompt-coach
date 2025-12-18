import { GoogleGenAI } from '@google/genai';
import { ANALYSIS_SYSTEM_PROMPT, REWRITE_SYSTEM_PROMPT } from './prompts';
import { AnalyzerResult, AnalyzerResultSchema, RewriterResult, RewriterResultSchema, PromptMetadata } from '../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
}

// Initialize the new GenAI client
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// const MODEL_NAME = 'gemini-1.5-flash';
const MODEL_NAME = 'gemini-3-flash-preview'; // Using Gemini 3 Flash to bypass the restricted 2.x quotas


// Helper: Clean raw output if it contains markdown blocks
function parseJSON(text: string | null | undefined) {
    if (!text) throw new Error('Empty response from AI');
    try {
        // Remove markdown code blocks if present
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Error on text:", text);
        throw new Error('Failed to parse AI response as JSON');
    }
}

export async function analyzePromptAI(prompt: string, metadata: PromptMetadata): Promise<AnalyzerResult> {
    const fullPrompt = `
    ${ANALYSIS_SYSTEM_PROMPT}

    User Metadata:
    Target: ${metadata.targetModel}
    Style: ${metadata.outputStyle}

    User Prompt to Analyze:
    """
    ${prompt}
    """
  `;

    const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
        }
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = parseJSON(text);

    // Validate with Zod
    const validated = AnalyzerResultSchema.parse(data);
    return validated;
}

export async function rewritePromptAI(originalPrompt: string, analysis: AnalyzerResult, metadata: PromptMetadata): Promise<RewriterResult> {
    const fullPrompt = `
    ${REWRITE_SYSTEM_PROMPT}

    Original Prompt:
    """
    ${originalPrompt}
    """

    Analysis Issues to Fix:
    ${JSON.stringify(analysis.issues)}

    Rewrite Plan:
    ${JSON.stringify(analysis.rewrite_plan)}

    Metadata:
    Verbosity: ${metadata.verbosity}
  `;

    const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
        }
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = parseJSON(text);
    const validated = RewriterResultSchema.parse(data);
    return validated;
}
