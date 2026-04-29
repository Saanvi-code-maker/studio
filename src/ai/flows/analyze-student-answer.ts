'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing student answers.
 * It classifies the student's understanding and provides a simple explanation.
 *
 * - analyzeStudentAnswer - Function to analyze a student's response.
 * - AnalyzeAnswerInput - Input schema for analysis.
 * - AnalyzeAnswerOutput - Output schema containing classification and explanation.
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
  analysisType: z.enum(['confused', 'partial_understanding', 'guessing', 'correct'])
    .describe('The classification of the student\'s understanding.'),
  explanation: z.string().describe('A simple, empathetic explanation of the analysis.'),
});
export type AnalyzeAnswerOutput = z.infer<typeof AnalyzeAnswerOutputSchema>;

/**
 * Analyzes a student's answer using keyword heuristics and AI classification.
 */
export async function analyzeStudentAnswer(input: AnalyzeAnswerInput): Promise<AnalyzeAnswerOutput> {
  return analyzeStudentAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentAnswerPrompt',
  input: { schema: AnalyzeAnswerInputSchema },
  output: { schema: AnalyzeAnswerOutputSchema },
  prompt: `You are an expert pedagogical assistant. Analyze the student's understanding based on their answer to a specific question.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}

Instructions:
1. Determine if the student is 'correct', 'confused' (misses the point), 'guessing' (uses tentative language), or has 'partial_understanding'.
2. If the student uses words like "maybe", "I think", "perhaps", or "not sure", they are likely 'guessing'.
3. If they are far from the correct answer or express frustration, they are 'confused'.
4. Provide a simple, 1-2 sentence explanation for the teacher.

Return the result as a JSON object matching the output schema.`,
});

const analyzeStudentAnswerFlow = ai.defineFlow(
  {
    name: 'analyzeStudentAnswerFlow',
    inputSchema: AnalyzeAnswerInputSchema,
    outputSchema: AnalyzeAnswerOutputSchema,
  },
  async (input) => {
    // Basic keyword matching heuristics to help the AI (or for fast-path if needed)
    const lowerAnswer = input.studentAnswer.toLowerCase();
    const guessingKeywords = ['maybe', 'i think', 'perhaps', 'guess', 'probably', 'not sure'];
    const confusedKeywords = ["don't know", "confused", "hard", "what", "no idea", "clueless"];

    const isGuessing = guessingKeywords.some(k => lowerAnswer.includes(k));
    const isConfused = confusedKeywords.some(k => lowerAnswer.includes(k));

    // Enhance the prompt context with heuristic hints
    const { output } = await prompt({
      ...input,
      // We pass the input but the prompt logic handles the classification. 
      // The AI is better at contextual keyword matching than a simple regex.
    });

    if (!output) {
      throw new Error('Failed to analyze student answer.');
    }

    return output;
  }
);
