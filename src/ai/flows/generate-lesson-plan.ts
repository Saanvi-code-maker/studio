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
    let retryCount = 0;
    const maxRetries = 2;
    while (retryCount < maxRetries) {
      try {
        const { output } = await prompt(input);
        if (output) return output;
      } catch (e) {
        retryCount++;
        if (retryCount >= maxRetries) {
          // Fallback lesson plan
          return {
            title: `Introduction to ${input.topic}`,
            objectives: ["Understand fundamental concepts", "Identify key components", "Apply knowledge to basic problems"],
            activities: [
              { title: "Conceptual Introduction", duration: "15 min", description: "Review core definitions and context." },
              { title: "Collaborative Exercise", duration: "25 min", description: "Group work focusing on practical examples." },
              { title: "Summary & Review", duration: "10 min", description: "Consolidate learning and address questions." }
            ],
            assessment: "Observation during activities and a brief exit ticket.",
            adaptiveTips: "Monitor students who struggle with the initial conceptual introduction and provide one-on-one analogies."
          };
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }
    throw new Error('Failed to generate lesson plan.');
  }
);
