'use server';
/**
 * @fileOverview This file implements a Genkit flow to analyze student responses
 * for a given topic and identify common mistakes or areas of confusion across the class.
 *
 * - summarizeCommonMisconceptions - A function that handles the common misconception summarization process.
 * - SummarizeCommonMisconceptionsInput - The input type for the summarizeCommonMisconceptions function.
 * - SummarizeCommonMisconceptionsOutput - The return type for the summarizeCommonMisconceptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCommonMisconceptionsInputSchema = z.object({
  topic: z.string().describe('The topic or question for which students provided responses.'),
  studentResponses: z
    .array(z.string())
    .describe('A list of individual student responses related to the topic.'),
});
export type SummarizeCommonMisconceptionsInput = z.infer<typeof SummarizeCommonMisconceptionsInputSchema>;

const SummarizeCommonMisconceptionsOutputSchema = z.object({
  commonMisconceptions: z.array(z.string()).describe('A list of common mistakes, misunderstandings, or areas of confusion identified in the student responses.'),
  summaryExplanation: z.string().describe('A general explanation summarizing the observed patterns of misconceptions.'),
  suggestedTeachingPoints: z.array(z.string()).describe('Actionable suggestions or teaching points for educators to address the identified misconceptions.'),
});
export type SummarizeCommonMisconceptionsOutput = z.infer<typeof SummarizeCommonMisconceptionsOutputSchema>;

export async function summarizeCommonMisconceptions(
  input: SummarizeCommonMisconceptionsInput
): Promise<SummarizeCommonMisconceptionsOutput> {
  return summarizeCommonMisconceptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCommonMisconceptionsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: SummarizeCommonMisconceptionsInputSchema},
  output: {schema: SummarizeCommonMisconceptionsOutputSchema},
  prompt: `You are an expert educational assistant tasked with helping teachers understand student learning.

Analyze the following student responses for the topic provided and identify common misconceptions, mistakes, or areas of confusion.
Provide a clear summary of these patterns, a list of specific common misconceptions, and actionable teaching points to address them.

Topic/Question: {{{topic}}}

Student Responses:
{{#each studentResponses}}
- {{{this}}}
{{/each}}

Instructions:
1. Identify recurring errors or misunderstandings across the responses.
2. Summarize the main patterns of confusion.
3. List specific common misconceptions in a clear, concise manner.
4. Provide practical suggestions for how a teacher might address these points in future lessons.
`,
});

const summarizeCommonMisconceptionsFlow = ai.defineFlow(
  {
    name: 'summarizeCommonMisconceptionsFlow',
    inputSchema: SummarizeCommonMisconceptionsInputSchema,
    outputSchema: SummarizeCommonMisconceptionsOutputSchema,
  },
  async (input) => {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const {output} = await prompt(input);
        if (!output) throw new Error('AI output was empty');
        return output;
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        const isRetryable = errorMessage.includes('503') || 
                          errorMessage.includes('UNAVAILABLE') || 
                          errorMessage.includes('429') ||
                          errorMessage.includes('404') ||
                          errorMessage.includes('not found') ||
                          errorMessage.includes('high demand');
        
        if (isRetryable && retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Summarization failed after multiple attempts due to service issues.');
  }
);
