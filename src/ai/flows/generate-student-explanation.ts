
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
  explanation: z.string().describe('Direct conceptual explanation of why the answer was wrong.'),
  story: z.string().describe('A 2-3 sentence relatable story or analogy to simplify the concept.'),
  visualDescription: z.string().describe('Text description for an illustrative image (e.g., "A city power plant with trucks delivering fuel").'),
  mindmap: z.array(z.string()).describe('3-4 key points showing the relationship between concepts.'),
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
  prompt: `You are an empathetic educator creating a "Learning Bridge" for a student who missed a question.
Your goal is to provide a multi-modal explanation that uses analogies, visuals, and conceptual maps.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}
{{#if context}}Context: {{{context}}}{{/if}}

Instructions:
1. Provide a clear, non-judgmental explanation.
2. Create a short story or analogy that makes the concept feel "real".
3. Describe a simple visual that could represent this concept.
4. Provide a 4-point mindmap summary of the key conceptual links.

Return the result as a JSON object matching the output schema.`,
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
