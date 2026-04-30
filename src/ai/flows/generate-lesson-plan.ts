
'use server';
/**
 * @fileOverview AI Lesson Planner for teachers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LessonPlanInputSchema = z.object({
  topic: z.string(),
  gradeLevel: z.string().optional(),
});

const LessonPlanOutputSchema = z.object({
  title: z.string(),
  objectives: z.array(z.string()),
  activities: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    description: z.string(),
  })),
  assessment: z.string(),
  adaptiveTips: z.string(),
});
export type LessonPlanOutput = z.infer<typeof LessonPlanOutputSchema>;

export async function generateLessonPlan(input: z.infer<typeof LessonPlanInputSchema>): Promise<LessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: LessonPlanInputSchema },
  output: { schema: LessonPlanOutputSchema },
  prompt: `Generate a high-fidelity adaptive lesson plan for Topic: {{{topic}}} {{#if gradeLevel}}Grade: {{{gradeLevel}}}{{/if}}.
Include specific learning objectives, a timed activity sequence, assessment methods, and tips for helping students with common misconceptions.`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: LessonPlanInputSchema,
    outputSchema: LessonPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate plan');
    return output;
  }
);
