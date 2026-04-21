'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScoreOutputSchema = z.object({
  overallScore: z.number().describe('Overall resume score from 0 to 100.'),
  atsScore: z.number().describe('ATS compatibility score from 0 to 100.'),
  readabilityScore: z.number().describe('Human readability score from 0 to 100.'),
  completenessScore: z.number().describe('How complete the resume is, 0 to 100.'),
  impactScore: z.number().describe('How impactful the language and content is, 0 to 100.'),
  strengths: z.array(z.string()).describe('2-4 specific things the resume does well.'),
  improvements: z.array(z.object({
    priority: z.enum(['high', 'medium', 'low']),
    section: z.string().describe('Which section this applies to, e.g. Summary, Experience, Skills.'),
    issue: z.string().describe('Short description of the problem.'),
    fix: z.string().describe('Specific actionable fix.'),
  })).describe('Prioritised list of improvements.'),
  summary: z.string().describe('2-3 sentence overall assessment.'),
});

export type ResumeScoreOutput = z.infer<typeof ScoreOutputSchema>;

const scorePrompt = ai.definePrompt({
  name: 'scoreResumePrompt',
  input: { schema: z.object({ resumeText: z.string() }) },
  output: { schema: ScoreOutputSchema },
  prompt: `You are an expert resume reviewer evaluating resumes for two audiences:
1. ATS (Applicant Tracking Systems) — automated parsers used by companies
2. Human readers — recruiters and hiring managers

Evaluate the following resume and provide scores and feedback. Be job-profile neutral — do not penalise for any specific industry or role. Judge purely on resume quality, structure, clarity, and completeness.

Scoring criteria:
- ATS Score: keyword density, standard section headings, no tables/columns/graphics, clean formatting, parseable structure
- Readability Score: clear language, logical flow, appropriate length, easy to scan
- Completeness Score: all key sections present (contact, summary/objective, education, skills), dates filled, descriptions present
- Impact Score: use of action verbs, quantified achievements, specific outcomes rather than vague duties
- Overall Score: weighted average of the above

For improvements, be specific and actionable. Prioritise high-impact fixes first.

Resume content:
{{{resumeText}}}`,
});

const scoreFlow = ai.defineFlow(
  {
    name: 'scoreResumeFlow',
    inputSchema: z.object({ resumeText: z.string() }),
    outputSchema: ScoreOutputSchema,
  },
  async (input) => {
    const { output } = await scorePrompt(input);
    if (!output) throw new Error('Score flow failed.');
    return output;
  }
);

// Accepts a plain string — ResumeData is serialized on the client
// to avoid passing Firestore Timestamp objects across the server boundary.
export async function scoreResume(resumeText: string): Promise<ResumeScoreOutput> {
  return scoreFlow({ resumeText });
}
