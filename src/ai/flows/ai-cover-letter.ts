'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('Full cover letter text, 3-4 paragraphs.'),
  paragraphs: z.object({
    intro: z.string(),
    experienceAlignment: z.string(),
    skillsMatch: z.string(),
    closing: z.string(),
  }),
});

export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

const coverLetterPrompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  input: { schema: z.object({ resumeText: z.string(), jobDescription: z.string() }) },
  output: { schema: CoverLetterOutputSchema },
  prompt: `You are a professional cover letter writer. Write a concise, tailored cover letter based on the resume and job description.

Structure (4 paragraphs):
1. intro — Express interest in the role. Mention the position title if identifiable. 1-2 sentences.
2. experienceAlignment — Highlight 1-2 most relevant experiences from the resume that match the job. 2-3 sentences.
3. skillsMatch — Connect specific skills from the resume to requirements in the job description. 2-3 sentences.
4. closing — Express enthusiasm, mention availability, and invite next steps. 1-2 sentences.

Rules:
- Professional but not stiff. Confident, not arrogant.
- Do NOT fabricate experience or skills not present in the resume.
- Do NOT use generic filler phrases like "I am a hard worker" or "I am passionate about".
- Keep total length under 300 words.
- Set coverLetter to all 4 paragraphs joined with double newlines.

RESUME:
{{{resumeText}}}

JOB DESCRIPTION:
{{{jobDescription}}}`,
});

const coverLetterFlow = ai.defineFlow(
  {
    name: 'coverLetterFlow',
    inputSchema: z.object({ resumeText: z.string(), jobDescription: z.string() }),
    outputSchema: CoverLetterOutputSchema,
  },
  async (input) => {
    const { output } = await coverLetterPrompt(input);
    if (!output) throw new Error('Cover letter flow failed.');
    // Ensure coverLetter is populated
    const cl = output.coverLetter?.trim() || [
      output.paragraphs.intro,
      output.paragraphs.experienceAlignment,
      output.paragraphs.skillsMatch,
      output.paragraphs.closing,
    ].filter(Boolean).join('\n\n');
    return { ...output, coverLetter: cl };
  }
);

export async function generateCoverLetter(resumeText: string, jobDescription: string): Promise<CoverLetterOutput> {
  return coverLetterFlow({ resumeText, jobDescription });
}
