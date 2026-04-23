'use server';
/**
 * @fileOverview A sophisticated Genkit flow for refining resume content with elite professional language.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefineSectionContentInputSchema = z.object({
  sectionName: z.string().describe('The name of the resume section to refine.'),
  sectionContent: z.string().describe('The user-provided text content.'),
  isSummary: z.boolean().optional(),
  isEducation: z.boolean().optional(),
  isSkills: z.boolean().optional(),
  isProjects: z.boolean().optional(),
  isExperience: z.boolean().optional(),
  isAchievements: z.boolean().optional(),
});
export type RefineSectionContentInput = z.infer<typeof RefineSectionContentInputSchema>;

const RefineSectionContentOutputSchema = z.object({
  refinedContent: z.string().describe('The elite, AI-refined version of the content.'),
  improvements: z.array(z.string()).describe('List of sophisticated improvements made.'),
});
export type RefineSectionContentOutput = z.infer<typeof RefineSectionContentOutputSchema>;

export async function refineSectionContent(input: { sectionName: string; sectionContent: string }): Promise<RefineSectionContentOutput> {
  return refineSectionContentFlow(input);
}

const refineSectionContentPrompt = ai.definePrompt({
  name: 'refineSectionContentPrompt',
  input: { schema: RefineSectionContentInputSchema },
  output: { schema: RefineSectionContentOutputSchema },
  prompt: `You are a professional resume writing assistant. Convert the user's input into structured bullet points.

OUTPUT RULES (strict):
- Return 3 to 5 bullet points only. No paragraphs, no prose.
- Each bullet starts with a strong action verb.
- Each bullet is 20 words or fewer.
- Do NOT add fake metrics, percentages, or numbers unless they appear in the input.
- Each bullet must be unique in structure and opening verb.

SECTION-SPECIFIC RULES for "{{sectionName}}":
{{#if isExperience}}
Focus on responsibilities, impact, and collaboration.
Use verbs like: Developed, Led, Collaborated, Designed, Implemented, Supported, Managed.
{{/if}}
{{#if isProjects}}
Focus on what was built, technologies used, and key features.
Mention the tech stack naturally within the bullet.
Use verbs like: Built, Implemented, Developed, Created, Integrated, Designed.
{{/if}}
{{#if isAchievements}}
Focus on awards, recognitions, ranks, and certifications. Keep factual and concise.
Use verbs like: Secured, Achieved, Ranked, Earned, Won, Completed.
Do NOT start every bullet with a verb if the achievement is a noun (e.g. "1st place in...").
{{/if}}
{{#if isSummary}}
Write 2-3 concise sentences summarising background, skills, and goal. Factual, no fluff.
{{/if}}

User input for "{{sectionName}}":
{{{sectionContent}}}

Return bullet points only. List key changes in the improvements array.`,
});

const refineSectionContentFlow = ai.defineFlow(
  {
    name: 'refineSectionContentFlow',
    inputSchema: z.object({
      sectionName: z.string(),
      sectionContent: z.string(),
    }),
    outputSchema: RefineSectionContentOutputSchema,
  },
  async (input) => {
    const flags = {
      isSummary: input.sectionName === "Professional Summary",
      isEducation: input.sectionName === "Education",
      isSkills: input.sectionName === "Skills",
      isProjects: input.sectionName === "Projects",
      isExperience: input.sectionName === "Internships / Experience",
      isAchievements: input.sectionName === "Achievements & Awards",
    };

    const { output } = await refineSectionContentPrompt({
      ...input,
      ...flags
    });

    if (!output) {
      throw new Error('AI prompt failure.');
    }
    return output;
  }
);