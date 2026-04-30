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
            objectives: [
              "Understand the fundamental principles of the topic",
              "Identify core components and their relationships",
              "Apply the concept to solve a real-world scenario"
            ],
            activities: [
              { title: "Hook & Introduction", duration: "10 min", description: "Engage students with a relevant analogy or problem." },
              { title: "Collaborative Exploration", duration: "25 min", description: "Students work in groups to explore key concepts." },
              { title: "Synthesis & Reflection", duration: "15 min", description: "Consolidate learning and address misconceptions." }
            ],
            assessment: "Formative exit ticket focusing on the main objective.",
            adaptiveTips: "Provide tiered scaffolding and visual aids for students showing partial understanding."
          };
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error('Failed to generate lesson plan.');
  }
);
