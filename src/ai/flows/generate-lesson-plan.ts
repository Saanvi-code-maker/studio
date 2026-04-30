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
        throw new Error('Empty output');
      } catch (e) {
        retryCount++;
        if (retryCount >= maxRetries) {
          return {
            title: `Exploration of ${input.topic}`,
            objectives: ["Define core principles", "Identify practical applications", "Synthesize concept relationships"],
            activities: [
              { title: "Introduction", duration: "10 min", description: "Hook students with a real-world problem." },
              { title: "Exploration", duration: "25 min", description: "Hands-on collaborative group activity." },
              { title: "Synthesis", duration: "15 min", description: "Class-wide sharing and bridge building." }
            ],
            assessment: "Formative assessment via student presentations.",
            adaptiveTips: "Provide tiered scaffolding for students showing partial understanding."
          };
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error('Failed to generate lesson plan.');
  }
);
