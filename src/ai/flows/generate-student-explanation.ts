
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized stories and visual explanations for students.
 *
 * - generateStudentExplanation - A function that handles the generation of a personalized story-based explanation.
 * - GenerateStudentExplanationInput - The input type for the generateStudentExplanation function.
 * - GenerateStudentExplanationOutput - The return type for the generateStudentExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateStudentExplanationInputSchema = z.object({
  question: z.string().describe('The question that was asked to the student.'),
  studentAnswer: z.string().describe('The answer provided by the student.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  studentUnderstandingLevel: z
    .enum(['confused', 'guessing', 'partial_knowledge', 'incorrect'])
    .optional()
    .describe(
      'An optional indicator of the student\'s understanding level.'
    ),
  context: z
    .string()
    .optional()
    .describe('Any additional context about the lesson or topic.'),
});
export type GenerateStudentExplanationInput = z.infer<
  typeof GenerateStudentExplanationInputSchema
>;

const GenerateStudentExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A clear, simple explanation addressed to the student.'),
  story: z
    .string()
    .describe('A short, relatable story or analogy (max 3 sentences) that simplifies the core concept.'),
  visualDescription: z
    .string()
    .describe('A textual description for an image that visually represents the story/analogy.'),
  mindmap: z.array(z.string()).describe('A list of 3-4 key concepts or relationships for a visual mindmap.'),
});
export type GenerateStudentExplanationOutput = z.infer<
  typeof GenerateStudentExplanationOutputSchema
>;

export async function generateStudentExplanation(
  input: GenerateStudentExplanationInput
): Promise<GenerateStudentExplanationOutput> {
  return generateStudentExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentExplanationPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: GenerateStudentExplanationInputSchema },
  output: { schema: GenerateStudentExplanationOutputSchema },
  config: {
    temperature: 0.7,
  },
  prompt: `You are an empathetic and creative educator creating "Learning Bridges" for students.
When a student is incorrect, you provide a clear explanation AND a short, relatable story/analogy.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}

{{#if context}}
Context: {{{context}}}
{{/if}}

Please generate:
1. **Explanation**: Directly address why the answer is wrong and explain the correct concept simply.
2. **Story**: Create a 2-3 sentence story or analogy. (e.g., If the topic is mitochondria, compare it to a power plant in a city).
3. **Visual Description**: Describe a simple illustration that matches your story.
4. **Mindmap**: Provide 3-4 key bullet points that show the connection between the current concept and related ideas.

Structure your response as a JSON object matching the output schema.`,
});

const generateStudentExplanationFlow = ai.defineFlow(
  {
    name: 'generateStudentExplanationFlow',
    inputSchema: GenerateStudentExplanationInputSchema,
    outputSchema: GenerateStudentExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate explanation.');
    }
    return output;
  }
);
