'use server';
/**
 * @fileOverview Analyzes student answers for cognitive patterns and correctness.
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
3. Provide a simple, 1-2 sentence explanation of your reasoning for a teacher's review.

Return the result as a JSON object matching the output schema.`,
});

const analyzeStudentAnswerFlow = ai.defineFlow(
  {
    name: 'analyzeStudentAnswerFlow',
    inputSchema: AnalyzeAnswerInputSchema,
    outputSchema: AnalyzeAnswerOutputSchema,
  },
  async (input) => {
    let retryCount = 0;
    const maxRetries = 2;
    while (retryCount < maxRetries) {
      try {
        const { output } = await prompt(input);
        if (output) return output;
      } catch (e) {
        retryCount++;
        if (retryCount >= maxRetries) {
          // Heuristic fallback
          const simpleCorrect = input.studentAnswer.toLowerCase().trim() === input.correctAnswer.toLowerCase().trim();
          return {
            isCorrect: simpleCorrect,
            analysisType: simpleCorrect ? 'correct' : 'confused',
            explanation: "Analysis generated via automated heuristic due to bridge latency."
          };
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }
    throw new Error('Failed to analyze student answer.');
  }
);
