'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImproveBulletOutputSchema = z.object({
  variations: z.array(z.object({
    label: z.string().describe('Short label: e.g. "Action-Oriented", "Metric-Driven", "Stronger"'),
    text: z.string().describe('The improved bullet point, max 20 words.'),
  })).describe('2-3 improved variations of the bullet.'),
});

export type ImproveBulletOutput = z.infer<typeof ImproveBulletOutputSchema>;

const improveBulletPrompt = ai.definePrompt({
  name: 'improveBulletPrompt',
  input: { schema: z.object({ bullet: z.string(), mode: z.string() }) },
  output: { schema: ImproveBulletOutputSchema },
  prompt: `You are a professional resume writer. Rewrite the following resume bullet point into 3 variations.

Mode requested: {{mode}}

Rules for all variations:
- Start with a strong past-tense action verb
- Be metric-driven: include numbers, percentages, or outcomes where possible
- Maximum 20 words per bullet
- No filler words
- No first-person pronouns

Variation labels to use:
1. "Action-Oriented" — emphasise the action and ownership
2. "Metric-Driven" — emphasise measurable outcomes (use [X%] or [N users] placeholders if no metrics given)
3. "Stronger" — most impactful version combining both

Input bullet:
{{{bullet}}}`,
});

const improveBulletFlow = ai.defineFlow(
  {
    name: 'improveBulletFlow',
    inputSchema: z.object({ bullet: z.string(), mode: z.string() }),
    outputSchema: ImproveBulletOutputSchema,
  },
  async (input) => {
    const { output } = await improveBulletPrompt(input);
    if (!output) throw new Error('Bullet improvement failed.');
    return output;
  }
);

export async function improveBullet(bullet: string, mode: string = 'all'): Promise<ImproveBulletOutput> {
  return improveBulletFlow({ bullet, mode });
}
