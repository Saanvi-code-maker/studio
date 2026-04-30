'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating adaptive lesson plans.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LessonPlanInputSchema = z.object({
  topic: z.string().describe('The subject or specific topic for the lesson plan.'),
  gradeLevel: z.string().optional().describe('The intended grade level for the students.'),
  targetWeaknesses: z.array(z.string()).optional().describe('Specific student weaknesses to address.'),
});
export type LessonPlanInput = z.infer<typeof LessonPlanInputSchema>;

const LessonPlanOutputSchema = z.object({
  title: z.string().describe('The title of the lesson plan.'),
  objectives: z.array(z.string()).describe('Learning objectives for the lesson.'),
  activities: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    description: z.string(),
  })).describe('Step-by-step classroom activities.'),
  assessment: z.string().describe('Suggested methods to assess student understanding.'),
  adaptiveTips: z.string().describe('Tips for adapting the lesson for struggling students.'),
});
export type LessonPlanOutput = z.infer<typeof LessonPlanOutputSchema>;

export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: LessonPlanInputSchema },
  output: { schema: LessonPlanOutputSchema },
  config: {
    temperature: 0.7,
  },
  prompt: `You are an expert curriculum designer. Generate a high-fidelity, adaptive lesson plan.

Topic: {{{topic}}}
{{#if gradeLevel}}Grade Level: {{{gradeLevel}}}{{/if}}
{{#if targetWeaknesses}}Target Weaknesses: {{#each targetWeaknesses}}{{{this}}}, {{/each}}{{/if}}

Instructions:
1. Create a clear, engaging title.
2. Define 3-4 measurable learning objectives.
3. Outline 3-4 classroom activities with specific durations and descriptions.
4. Suggest a creative assessment method.
5. Provide adaptive teaching tips to help students who have the identified weaknesses.

Structure your response as a JSON object matching the output schema.`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: LessonPlanInputSchema,
    outputSchema: LessonPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate lesson plan.');
    }
    return output;
  }
);
