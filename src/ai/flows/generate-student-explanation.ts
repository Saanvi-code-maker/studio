'use server';
/**
 * @fileOverview Generates personalized "Learning Bridges" for students.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudentExplanationInputSchema = z.object({
  question: z.string().describe('The question asked.'),
  studentAnswer: z.string().describe('The student answer.'),
  correctAnswer: z.string().describe('The correct answer.'),
  context: z.string().optional(),
});
export type GenerateStudentExplanationInput = z.infer<typeof GenerateStudentExplanationInputSchema>;

const GenerateStudentExplanationOutputSchema = z.object({
  explanation: z.string().describe('Direct conceptual explanation.'),
  story: z.string().describe('A 2-3 sentence relatable story or analogy.'),
  visualDescription: z.string().describe('Text for an illustrative image.'),
  mindmap: z.array(z.string()).describe('3-4 key concept relationship points.'),
});
export type GenerateStudentExplanationOutput = z.infer<typeof GenerateStudentExplanationOutputSchema>;

export async function generateStudentExplanation(input: GenerateStudentExplanationInput): Promise<GenerateStudentExplanationOutput> {
  return generateStudentExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentExplanationPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateStudentExplanationInputSchema },
  output: { schema: GenerateStudentExplanationOutputSchema },
  config: { temperature: 0.7 },
  prompt: `You are an empathetic educator creating "Learning Bridges".
Provide a clear explanation, a short story/analogy, a visual description, and 3-4 mindmap points.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}
{{#if context}}Context: {{{context}}}{{/if}}`,
});

const generateStudentExplanationFlow = ai.defineFlow(
  {
    name: 'generateStudentExplanationFlow',
    inputSchema: GenerateStudentExplanationInputSchema,
    outputSchema: GenerateStudentExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate explanation.');
    return output;
  }
);
