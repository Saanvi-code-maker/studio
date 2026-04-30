'use server';
/**
 * @fileOverview Summarizes common classroom misconceptions for the Educator Dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeInputSchema = z.object({
  topic: z.string(),
  studentResponses: z.array(z.string()),
});

const SummarizeOutputSchema = z.object({
  commonMisconceptions: z.array(z.string()),
  summaryExplanation: z.string(),
  suggestedTeachingPoints: z.array(z.string()),
});

export async function summarizeCommonMisconceptions(input: z.infer<typeof SummarizeInputSchema>) {
  return summarizeCommonMisconceptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCommonMisconceptionsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SummarizeInputSchema },
  output: { schema: SummarizeOutputSchema },
  prompt: `You are an expert pedagogical analyst. 
Analyze these student responses for Topic: {{{topic}}}. 
Identify recurring cognitive gaps and systemic misconceptions.

Responses:
{{#each studentResponses}}- {{{this}}}{{/each}}

Instructions:
1. List 3-4 specific common misconceptions.
2. Provide an executive summary of the class's understanding.
3. Suggest 2-3 targeted teaching points for intervention.`,
});

const summarizeCommonMisconceptionsFlow = ai.defineFlow(
  {
    name: 'summarizeCommonMisconceptionsFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
  },
  async (input) => {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const { output } = await prompt(input);
        if (!output) throw new Error('AI output was empty');
        return output;
      } catch (error: any) {
        console.warn(`Genkit attempt ${retryCount + 1} failed:`, error.message);
        retryCount++;
        if (retryCount >= maxRetries) {
          // Final attempt with fallback or throw clear error
          throw new Error('Our AI Bridge is temporarily busy. Please try again in a moment.');
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    throw new Error('Failed to summarize common misconceptions.');
  }
);
