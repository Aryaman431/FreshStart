'use server';
/**
 * @fileOverview This file implements a Genkit flow for detecting gaps and suggesting improvements in resume sections.
 *
 * - detectGapsAndSuggestImprovements - A function that detects missing high-value information and generates follow-up questions for a given resume section.
 * - DetectGapsAndSuggestImprovementsInput - The input type for the detectGapsAndSuggestImprovements function.
 * - DetectGapsAndSuggestImprovementsOutput - The return type for the detectGapsAndSuggestImprovements function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectGapsAndSuggestImprovementsInputSchema = z.object({
  sectionName: z.string().describe('The name of the resume section (e.g., "Projects", "Education", "Internships").'),
  sectionContent: z.string().describe('The user\'s current input for the resume section.'),
});
export type DetectGapsAndSuggestImprovementsInput = z.infer<typeof DetectGapsAndSuggestImprovementsInputSchema>;

const DetectGapsAndSuggestImprovementsOutputSchema = z.object({
  hasGaps: z.boolean().describe('Whether any significant gaps or missing high-value information were detected.'),
  gapsDetected: z.array(z.string()).describe('A list of identified missing high-value information (e.g., "measurable outcome", "CGPA", "duration").'),
  followUpQuestions: z.array(z.string()).describe('A list of specific, contextual follow-up questions to help the user provide more complete information.'),
});
export type DetectGapsAndSuggestImprovementsOutput = z.infer<typeof DetectGapsAndSuggestImprovementsOutputSchema>;

export async function detectGapsAndSuggestImprovements(input: DetectGapsAndSuggestImprovementsInput): Promise<DetectGapsAndSuggestImprovementsOutput> {
  return detectGapsAndSuggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectGapsAndSuggestImprovementsPrompt',
  input: { schema: DetectGapsAndSuggestImprovementsInputSchema },
  output: { schema: DetectGapsAndSuggestImprovementsOutputSchema },
  prompt: `You are an AI assistant for a resume builder, specifically helping fresh graduates and final-year students craft compelling resumes. Your goal is to identify missing high-value information within a given resume section and generate specific, contextual follow-up questions to help the user provide more complete and relevant details.\n\nFocus on detecting these types of gaps based on the section name:\n- For 'Projects': Look for measurable outcomes, technologies used, and the impact of the project.\n- For 'Education': Look for CGPA/GPA (if applicable and positive), relevant coursework, and honors/awards.\n- For 'Internships / Experience': Look for specific responsibilities, duration, and achievements/impacts rather than just tasks.\n- For 'Professional Summary': Ensure it's 2-3 sentences, highlights key skills/aspirations, and is compelling.\n- For 'Skills': Ensure a diverse set of skills beyond just basic knowledge.\n- For other sections, apply general principles of completeness and impact.\n\nIf no significant gaps are found, set 'hasGaps' to false and leave 'gapsDetected' and 'followUpQuestions' empty.\nIf gaps are found, provide concise descriptions of the gaps in 'gapsDetected' and then generate 1-3 clear, actionable, and specific follow-up questions to elicit that missing information from the user.\n\nResume Section Name: {{{sectionName}}}\nCurrent Section Content:\n{{{sectionContent}}}\n\nConsider the current content and the section name. Identify any high-value information that is missing or could be expanded upon for a fresher's resume.\nThen, formulate specific follow-up questions to help the user fill those gaps.`,
});

const detectGapsAndSuggestImprovementsFlow = ai.defineFlow(
  {
    name: 'detectGapsAndSuggestImprovementsFlow',
    inputSchema: DetectGapsAndSuggestImprovementsInputSchema,
    outputSchema: DetectGapsAndSuggestImprovementsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);