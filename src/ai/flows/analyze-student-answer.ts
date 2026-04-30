'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing student answers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeAnswerInputSchema = z.object({
  question: z.string().describe('The question posed to the student.'),
  studentAnswer: z.string().describe('The student\'s provided answer.'),
  correctAnswer: z.string().describe('The correct answer for comparison.'),
});
export type AnalyzeAnswerInput = z.infer<typeof AnalyzeAnswerInputSchema>;

const AnalyzeAnswerOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the student\'s answer is conceptually correct.'),
  analysisType: z.enum(['confused', 'partial_understanding', 'guessing', 'correct'])
    .describe('The classification of the student\'s understanding.'),
  explanation: z.string().describe('A simple, empathetic explanation of the analysis for the teacher.'),
});
export type AnalyzeAnswerOutput = z.infer<typeof AnalyzeAnswerOutputSchema>;

export async function analyzeStudentAnswer(input: AnalyzeAnswerInput): Promise<AnalyzeAnswerOutput> {
  return analyzeStudentAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentAnswerPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: AnalyzeAnswerInputSchema },
  output: { schema: AnalyzeAnswerOutputSchema },
  config: {
    temperature: 0.4,
  },
  prompt: `You are an expert pedagogical assistant. Analyze the student's understanding based on their answer to a specific question.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}

Instructions:
1. Determine if the answer is conceptually 'isCorrect'.
2. Classify the understanding level: 'correct', 'guessing', 'partial_understanding', 'confused'.
3. Provide a simple, 1-2 sentence explanation of your reasoning.

Return the result as a JSON object matching the output schema.`,
});

const analyzeStudentAnswerFlow = ai.defineFlow(
  {
    name: 'analyzeStudentAnswerFlow',
    inputSchema: AnalyzeAnswerInputSchema,
    outputSchema: AnalyzeAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to analyze student answer.');
    }
    return output;
  }
);
