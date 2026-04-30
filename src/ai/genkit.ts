import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for ShikshaSetu.
 * Using type-safe model references from googleAI plugin to prevent 404 errors.
 */
export const ai = genkit({
  plugins: [
    googleAI()
  ],
  model: gemini15Flash,
});
