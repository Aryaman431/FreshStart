'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StarAnswerSchema = z.object({
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
});

const QuestionSchema = z.object({
  question: z.string(),
  type: z.enum(['behavioral', 'technical']),
  answer: StarAnswerSchema,
});

const InterviewPrepOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('10 behavioral + 10 technical questions with STAR answers.'),
  tipsForRole: z.array(z.string()).describe('3-5 interview tips specific to this role/company type.'),
});

export type InterviewPrepOutput = z.infer<typeof InterviewPrepOutputSchema>;
export type InterviewQuestion = z.infer<typeof QuestionSchema>;

const interviewPrepPrompt = ai.definePrompt({
  name: 'interviewPrepPrompt',
  input: { schema: z.object({ resumeText: z.string(), jobDescription: z.string() }) },
  output: { schema: InterviewPrepOutputSchema },
  prompt: `You are a senior interview coach. Generate a complete interview preparation pack based on the candidate's resume and the job description.

Produce exactly:
- 10 behavioral questions (type: "behavioral") — based on the candidate's actual experience from the resume
- 10 technical/role-specific questions (type: "technical") — based on the skills and responsibilities in the job description

For every question, provide a STAR-format answer grounded in the candidate's resume. If specific details are missing, use realistic placeholders in [brackets].

Keep answers concise: each STAR field should be 1-2 sentences.

RESUME:
{{{resumeText}}}

JOB DESCRIPTION:
{{{jobDescription}}}`,
});

const interviewPrepFlow = ai.defineFlow(
  {
    name: 'interviewPrepFlow',
    inputSchema: z.object({ resumeText: z.string(), jobDescription: z.string() }),
    outputSchema: InterviewPrepOutputSchema,
  },
  async (input) => {
    const { output } = await interviewPrepPrompt(input);
    if (!output) throw new Error('Interview prep flow failed.');
    return output;
  }
);

export async function generateInterviewPrep(resumeText: string, jobDescription: string): Promise<InterviewPrepOutput> {
  return interviewPrepFlow({ resumeText, jobDescription });
}
