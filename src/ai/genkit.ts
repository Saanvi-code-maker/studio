import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for ShikshaSetu.
 * We use the type-safe model references from the googleAI plugin
 * to ensure correct API versioning and model identifiers.
 */
export const ai = genkit({
  plugins: [
    googleAI()
  ],
  model: gemini15Flash,
});
