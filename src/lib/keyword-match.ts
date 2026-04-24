/**
 * Client-side keyword matching — no AI call needed.
 * Extracts keywords from job description and compares against resume text.
 */

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','being','have','has','had','do','does',
  'did','will','would','could','should','may','might','shall','can','need',
  'we','you','they','he','she','it','this','that','these','those','our','your',
  'their','its','as','by','from','up','about','into','through','during','before',
  'after','above','below','between','each','both','few','more','most','other',
  'some','such','no','not','only','same','so','than','too','very','just','also',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map(t => t.replace(/^[-.,]+|[-.,]+$/g, ''))
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function extractPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  // Common multi-word tech/skill phrases
  const phraseRegex = /\b(node\.?js|react\.?js|next\.?js|vue\.?js|angular\.?js|machine learning|deep learning|natural language|computer vision|data science|full[- ]stack|front[- ]end|back[- ]end|ci\/cd|rest api|graphql|type ?script|java ?script|c\+\+|c#|\.net|aws|gcp|azure|google cloud|docker|kubernetes|git ?hub|git ?lab|vs ?code|visual studio|sql server|mongo ?db|postgre ?sql|my ?sql|redis|elastic ?search|spring boot|fast ?api|django|flask|express\.?js|tailwind|material[- ]ui|figma|jira|agile|scrum|kanban|unit test|test driven|object[- ]oriented|micro ?services|devops|linux|bash|shell script)\b/gi;
  const matches: string[] = [];
  let m;
  while ((m = phraseRegex.exec(lower)) !== null) {
    matches.push(m[0].replace(/\s+/g, ' ').trim());
  }
  return [...new Set(matches)];
}

export interface KeywordMatchResult {
  score: number;
  matched: string[];
  missing: string[];
  totalJobKeywords: number;
}

export function matchKeywords(resumeText: string, jobDescription: string): KeywordMatchResult {
  const jobTokens = new Set(tokenize(jobDescription));
  const jobPhrases = extractPhrases(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  // Combine single tokens + phrases as job keywords
  const allJobKeywords = [
    ...Array.from(jobTokens).filter(t => t.length > 3),
    ...jobPhrases,
  ];

  // Deduplicate
  const uniqueJobKeywords = [...new Set(allJobKeywords)];

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of uniqueJobKeywords) {
    if (resumeLower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = uniqueJobKeywords.length > 0
    ? Math.round((matched.length / uniqueJobKeywords.length) * 100)
    : 0;

  // Return top 20 missing keywords sorted by length (longer = more specific)
  const topMissing = missing
    .sort((a, b) => b.length - a.length)
    .slice(0, 20);

  return {
    score,
    matched: matched.slice(0, 30),
    missing: topMissing,
    totalJobKeywords: uniqueJobKeywords.length,
  };
}
