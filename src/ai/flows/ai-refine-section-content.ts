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
  refinedContent: z.string().describe('Newline-joined bullet points from the points array.'),
  improvements: z.array(z.string()).describe('List of changes made.'),
  points: z.array(z.string()).describe('3–6 individual bullet points, each max 20 words.'),
});
export type RefineSectionContentOutput = z.infer<typeof RefineSectionContentOutputSchema>;

export async function refineSectionContent(input: { sectionName: string; sectionContent: string }): Promise<RefineSectionContentOutput> {
  return refineSectionContentFlow(input);
}

const refineSectionContentPrompt = ai.definePrompt({
  name: 'refineSectionContentPrompt',
  input: { schema: RefineSectionContentInputSchema },
  output: { schema: RefineSectionContentOutputSchema },
  prompt: `You are a professional resume writing assistant. Generate content in the correct format for the given section.

SECTION: "{{sectionName}}"

{{#if isSummary}}
OUTPUT RULES FOR SUMMARY:
- Return ONE paragraph only. No bullets, no dashes, no line breaks.
- 2-3 sentences in professional tone.
- Factual — do not invent details not present in the input.
- Set "points" to an empty array.
- Set "refinedContent" to the paragraph text.
{{/if}}

{{#if isExperience}}
OUTPUT RULES FOR EXPERIENCE:
- Return 3-5 bullet points in the "points" array.
- Each bullet starts with a past-tense action verb.
- Each bullet is 20 words or fewer.
- Focus on responsibilities, collaboration, and impact.
- Do NOT add fake metrics or percentages.
{{/if}}

{{#if isProjects}}
OUTPUT RULES FOR PROJECTS:
- Return 3-5 bullet points in the "points" array.
- Each bullet starts with an action verb.
- Each bullet is 20 words or fewer.
- Include features built and technologies used naturally.
- Do NOT add fake metrics or percentages.
{{/if}}

{{#if isAchievements}}
OUTPUT RULES FOR ACHIEVEMENTS:
- Return 3-5 bullet points in the "points" array.
- Concise and factual — only include what is in the input.
- Focus on awards, ranks, recognitions, certifications.
- Do NOT fabricate numbers or outcomes.
{{/if}}

User input:
{{{sectionContent}}}

Set "refinedContent" to the points joined by newlines (or the paragraph for summary).
List key changes in "improvements".`,
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

    const { output } = await refineSectionContentPrompt({ ...input, ...flags });
    if (!output) throw new Error('AI prompt failure.');

    // Ensure refinedContent is always populated from points if not set
    const points = output.points ?? [];
    const isSummary = input.sectionName === "Professional Summary";
    const refinedContent = output.refinedContent?.trim()
      || (isSummary ? '' : points.map(p => `• ${p}`).join('\n'));

    return { ...output, refinedContent, points };
  }
);