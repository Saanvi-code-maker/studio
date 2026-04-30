import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for ShikshaSetu.
 * Configured with Google AI plugin using the stable Gemini 1.5 Flash model.
 * The 'googleai/' prefix is required for correct model resolution in Genkit 1.x.
 */
export const ai = genkit({
  plugins: [
    googleAI()
  ],
  model: 'googleai/gemini-1.5-flash',
});
