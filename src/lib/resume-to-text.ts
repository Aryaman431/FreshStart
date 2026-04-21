import { ResumeData } from '@/types/resume';

/**
 * Converts ResumeData to a plain string for the AI scoring server action.
 * Must run on the client so Firestore Timestamp objects are never passed
 * across the server boundary.
 */
export function resumeToText(data: ResumeData): string {
  const lines: string[] = [];

  const p = data.personalInfo;
  if (p.fullName) lines.push(`Name: ${p.fullName}`);
  if (p.email)    lines.push(`Email: ${p.email}`);
  if (p.phone)    lines.push(`Phone: ${p.countryCode || ''} ${p.phone}`);
  if (p.linkedin) lines.push(`LinkedIn: ${p.linkedin}`);
  if (p.github)   lines.push(`GitHub/Other: ${p.github}`);

  if (data.professionalSummary) {
    lines.push('\nSUMMARY');
    lines.push(data.professionalSummary);
  }

  const edu = data.education.filter(e => e.institution || e.degree);
  if (edu.length) {
    lines.push('\nEDUCATION');
    edu.forEach(e => {
      lines.push(`${e.institution} — ${e.degree} (${e.startDate} – ${e.endDate})`);
      if (e.coursework) lines.push(`Coursework: ${e.coursework}`);
    });
  }

  const exp = data.experience.filter(e => e.company || e.role);
  if (exp.length) {
    lines.push('\nEXPERIENCE');
    exp.forEach(e => {
      lines.push(`${e.role} at ${e.company} (${e.startDate} – ${e.endDate})`);
      if (e.responsibilities) lines.push(e.responsibilities);
    });
  }

  const proj = data.projects.filter(p => p.title);
  if (proj.length) {
    lines.push('\nPROJECTS');
    proj.forEach(p => {
      const dateStr = p.startDate ? `${p.startDate} – ${p.endDate || ''}` : p.date || '';
      lines.push(`${p.title} | ${p.techStack} (${dateStr})`);
      if (p.description) lines.push(p.description);
    });
  }

  const skills = data.skills.filter(s => s.values);
  if (skills.length) {
    lines.push('\nSKILLS');
    skills.forEach(s => lines.push(`${s.category}: ${s.values}`));
  }

  const certs = data.certifications.filter(c => c.name);
  if (certs.length) {
    lines.push('\nCERTIFICATIONS');
    certs.forEach(c => lines.push(`${c.name} — ${c.issuer} (${c.year})`));
  }

  if (data.achievements) {
    lines.push('\nACHIEVEMENTS');
    lines.push(data.achievements);
  }

  return lines.join('\n');
}
