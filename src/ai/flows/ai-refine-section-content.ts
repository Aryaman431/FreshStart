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
  prompt: `You are an elite career consultant specializing in high-impact professional narratives for top-tier graduates. Your objective is to refine the provided content for the "{{sectionName}}" section into a "posh," sophisticated, and technically authoritative masterpiece.

Guidelines for Sophistication:
1. **Elevated Vocabulary**: Replace generic verbs with high-impact synonyms (e.g., use "orchestrated" instead of "managed," "synthesized" instead of "combined," "conceptualized" instead of "thought of").
2. **Technical Precision**: Ensure technical terms are used accurately and with authority.
3. **Quantifiable Excellence**: Emphasize results and metrics. If none are provided, suggest placeholders like "[X% increase]" or "[Impact Outcome]".
4. **Conciseness & Flow**: Remove any linguistic fluff. Every word must serve a purpose.
5. **Contextual Poshness**:
   {{#if isSummary}}
     Draft a compelling 2-3 sentence synthesis that highlights elite skills and ambitious career trajectories. Use an authoritative, confident tone.
   {{/if}}
   {{#if isProjects}}
     Focus on "Architecting Solutions." Use bullet points that describe the challenge, the sophisticated tech stack used, and the elegant outcome.
   {{/if}}
   {{#if isExperience}}
     Focus on "Professional Trajectory." Describe roles in terms of high-level contributions and strategic impact rather than just daily tasks.
   {{/if}}

User-provided content for "{{sectionName}}":
{{{sectionContent}}}

Provide a refined version that sounds elite, polished, and ready for a top-tier firm.`,
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