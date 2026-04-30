'use server';

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
  prompt: `Analyze these student responses for Topic: {{{topic}}}. Identify misconceptions.
Responses:
{{#each studentResponses}}- {{{this}}}{{/each}}`,
});

const summarizeCommonMisconceptionsFlow = ai.defineFlow(
  {
    name: 'summarizeCommonMisconceptionsFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to summarize');
    return output;
  }
);
