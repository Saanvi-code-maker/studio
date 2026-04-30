import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for ShikshaSetu.
 * Using a stable configuration for the Google AI plugin.
 */
export const ai = genkit({
  plugins: [
    googleAI()
  ],
});
