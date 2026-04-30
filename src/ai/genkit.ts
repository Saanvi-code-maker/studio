import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for ShikshaSetu.
 * Explicitly setting apiVersion to 'v1' to ensure stable model resolution
 * and avoid 404 errors associated with v1beta endpoint mismatches.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiVersion: 'v1' })
  ],
  model: 'googleai/gemini-1.5-flash',
});
