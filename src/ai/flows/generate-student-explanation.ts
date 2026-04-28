'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized explanations for students.
 *
 * - generateStudentExplanation - A function that handles the generation of a personalized explanation.
 * - GenerateStudentExplanationInput - The input type for the generateStudentExplanation function.
 * - GenerateStudentExplanationOutput - The return type for the generateStudentExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudentExplanationInputSchema = z.object({
  question: z.string().describe('The question that was asked to the student.'),
  studentAnswer: z.string().describe('The answer provided by the student.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  studentUnderstandingLevel: z
    .enum(['confused', 'guessing', 'partial_knowledge', 'incorrect'])
    .optional()
    .describe(
      'An optional indicator of the student\u0027s understanding level (e.g., \'confused\', \'partial_knowledge\', \'guessing\').'
    ),
  context: z
    .string()
    .optional()
    .describe('Any additional context about the lesson or topic.'),
  language: z
    .string()
    .optional()
    .describe('The desired language for the explanation, e.g., \'English\', \'Spanish\'.'),
});
export type GenerateStudentExplanationInput = z.infer<
  typeof GenerateStudentExplanationInputSchema
>;

const GenerateStudentExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The personalized explanation for the student.'),
  visualDescription: z
    .string()
    .optional()
    .describe(
      'An optional textual description for an image that could visually represent the explanation, to be used by an image generation model.'
    ),
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
  input: { schema: GenerateStudentExplanationInputSchema },
  output: { schema: GenerateStudentExplanationOutputSchema },
  prompt: `You are an empathetic and clear educator creating personalized explanations for students.
The student answered a question, and their response indicates some confusion or incorrect understanding.
Your goal is to provide a clear, simple explanation tailored to their specific misunderstanding, using analogies, short stories, or visual concepts.

Here's the information:
Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}

{{#if studentUnderstandingLevel}}
Based on my assessment, the student's understanding level is: {{{studentUnderstandingLevel}}}.
{{/if}}

{{#if context}}
Additional context for the lesson: {{{context}}}
{{/if}}

{{#if language}}
Provide the explanation in {{{language}}}.
{{/if}}

Please generate an explanation that:
1.  Directly addresses the likely misunderstanding based on the student's answer and the correct answer.
2.  Uses simple language appropriate for a student.
3.  Incorporates an analogy or a short, relatable story to make the concept clearer.
4.  Provides a textual description for an image that would visually represent the explanation, if an image would significantly aid understanding. If no image is needed, leave the 'visualDescription' empty.

Your response should be structured as a JSON object matching the output schema described. Do not include any other text besides the JSON.
`,
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
