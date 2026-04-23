'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TailorOutputSchema = z.object({
  missingSkills: z.array(z.string()).describe('Skills/tools in the job description not found in the resume.'),
  improvedBullets: z.array(z.object({
    original: z.string(),
    improved: z.string(),
    reason: z.string(),
  })).describe('Top 3 rewritten bullets that better match the job.'),
  keywordsToAdd: z.array(z.string()).describe('High-value keywords from the JD to weave into the resume.'),
  sectionOrder: z.array(z.string()).describe('Recommended section order for this job, e.g. ["Summary","Skills","Experience","Education"].'),
  overallFit: z.number().describe('Estimated resume-to-job fit score 0-100 before improvements.'),
  summary: z.string().describe('2-sentence summary of the gap and top recommendation.'),
});

export type TailorOutput = z.infer<typeof TailorOutputSchema>;

const tailorPrompt = ai.definePrompt({
  name: 'tailorToJobPrompt',
  input: { schema: z.object({ resumeText: z.string(), jobDescription: z.string() }) },
  output: { schema: TailorOutputSchema },
  prompt: `You are an expert resume strategist. Analyse the resume against the job description and produce targeted optimisation advice.

Steps:
1. Extract all skills, tools, technologies, and responsibilities from the job description
2. Compare against the resume — identify what is missing
3. Rewrite the 3 weakest or most relevant bullets to better match the job language
4. List high-value keywords from the JD that should appear in the resume
5. Suggest the optimal section order for this specific role
6. Score the current fit 0-100

Be specific. Use exact terminology from the job description.

RESUME:
{{{resumeText}}}

JOB DESCRIPTION:
{{{jobDescription}}}`,
});

const tailorFlow = ai.defineFlow(
  {
    name: 'tailorToJobFlow',
    inputSchema: z.object({ resumeText: z.string(), jobDescription: z.string() }),
    outputSchema: TailorOutputSchema,
  },
  async (input) => {
    const { output } = await tailorPrompt(input);
    if (!output) throw new Error('Tailor flow failed.');
    return output;
  }
);

export async function tailorToJob(resumeText: string, jobDescription: string): Promise<TailorOutput> {
  return tailorFlow({ resumeText, jobDescription });
}
