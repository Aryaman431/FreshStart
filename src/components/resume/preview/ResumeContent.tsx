"use client";


import React from 'react';
import { ResumeData } from '@/types/resume';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface ResumeContentProps {
  data: ResumeData;
  activeSection?: string | null;
  isPrint?: boolean;
}

const DUMMY = {
  fullName: "ALEXANDER VANDERS",
  email: "alex.vanders@ivy.edu",
  phone: "212-555-0198",
  linkedin: "linkedin.com/in/alexvanders",
  github: "github.com/alexv",
  summary: "Highly ambitious Computer Science scholar with a specialization in systemic architecture and neural computation. Proven record of conceptualizing and deploying high-impact software solutions within agile, research-driven environments. Dedicated to engineering excellence and the synthesis of elegant technological ecosystems.",
  education: [
    { id: 'dummy-edu', degree: 'Bachelor of Science in Computer Science', institution: 'Prestige Institute of Technology', year: 'Aug. 2020 -- May 2024', coursework: '' }
  ],
  experience: [
    { id: 'dummy-exp', company: 'Global Tech Systems', role: 'Software Engineering Architect Intern', startDate: 'May 2023', endDate: 'Aug. 2023', responsibilities: "• Orchestrated the migration of legacy data systems to a React-based microservices architecture, enhancing system throughput by 35%.\n• Authored comprehensive technical documentation and collaborated with senior architects to ensure seamless cross-functional delivery.\n• Refined database schemas, optimizing query latency for high-traffic endpoints." }
  ],
  projects: [
    { id: 'dummy-proj', title: 'Neural Finance Engine', techStack: 'Next.js, TensorFlow, PostgreSQL', description: "• Engineered a real-time predictive financial model utilizing deep neural networks for market analysis.\n• Developed a high-fidelity user interface with Tailwind CSS, ensuring accessibility and elite performance metrics.\n• Achieved sub-100ms response times for complex analytical computations.", date: "Jan. 2024", link: "github.com/example" }
  ],
  skills: ["C++", "Python", "TypeScript", "React", "Node.js", "PostgreSQL", "Git", "Docker", "AWS"],
  achievements: "• Presidential Merit Scholar: 2020 -- 2024\n• Grand Prize Winner: Global Innovation Hackathon 2023",
  certifications: [
    { id: 'dummy-cert', name: 'Certified Cloud Solutions Architect', issuer: 'CloudTech Alliance', year: '2023' }
  ]
};

export function ResumeContent({ data, activeSection, isPrint = false }: ResumeContentProps) {
  const isValPresent = (val: string | undefined) => !!val && val.trim() !== '';

  const renderText = (userVal: string | undefined, dummyVal: string, baseClasses: string = "") => {
    const isPresent = isValPresent(userVal);
    const displayValue = isPresent ? userVal : (isPrint ? dummyVal : dummyVal);
    const effectiveVal = isPresent ? userVal : dummyVal;

    if (!isPresent && !isPrint && !dummyVal) return null;
    
    return (
      <span className={cn(
        baseClasses,
        isPresent ? "text-slate-900 font-bold" : (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal")
      )}>
        {effectiveVal}
      </span>
    );
  };

  const getLinkUrl = (link: string | undefined) => {
    if (!link) return "#";
    return link.startsWith('http') ? link : `https://${link}`;
  };

  const renderTextWithLinks = (text: string | undefined, isDummy: boolean = false) => {
    const effectiveText = isValPresent(text) ? text : (isPrint || isDummy ? text : DUMMY.summary); // Fallback logic
    if (!effectiveText) return null;

    const urlRegex = /((?:https?:\/\/|www\.)[^\s<>()]+)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(effectiveText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(effectiveText.substring(lastIndex, match.index));
      }
      const url = match[0];
      parts.push(
        <a
          key={match.index}
          href={getLinkUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-slate-300 underline-offset-2 hover:text-primary transition-colors break-all"
        >
          {url}
        </a>
      );
      lastIndex = urlRegex.lastIndex;
    }

    if (lastIndex < effectiveText.length) {
      parts.push(effectiveText.substring(lastIndex));
    }

    return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
  };

  const getDisplayArray = (arr: any[], dummy: any[]) => {
    return arr && arr.length > 0 ? { data: arr, isDummy: false } : { data: dummy, isDummy: true };
  };

  const formatDuration = (start: string | undefined, end: string | undefined, dummyStart: string, dummyEnd: string) => {
    const isStartPresent = isValPresent(start);
    const isEndPresent = isValPresent(end);
    const startDisplay = isStartPresent ? start : dummyStart;
    const endDisplay = isEndPresent ? end : dummyEnd;
    return `${startDisplay} -- ${endDisplay}`;
  };

  const eduItems = getDisplayArray(data.education, DUMMY.education);
  const expItems = getDisplayArray(data.experience, DUMMY.experience);
  const projItems = getDisplayArray(data.projects, DUMMY.projects);
  const certItems = getDisplayArray(data.certifications, DUMMY.certifications);

  const personalInfoItems = [
    { key: 'phone', content: data.personalInfo.phone, dummy: DUMMY.phone },
    { key: 'email', content: data.personalInfo.email, dummy: DUMMY.email, isEmail: true },
    { key: 'linkedin', content: data.personalInfo.linkedin, dummy: DUMMY.linkedin, isLink: true },
    { key: 'github', content: data.personalInfo.github, dummy: DUMMY.github, isLink: true },
  ];

  const visibleItems = personalInfoItems.filter(item => isValPresent(item.content));

  return (
    <div 
      id={isPrint ? "resume-print-target" : "resume-preview-root"}
      className={cn(
        "resume-page-inner bg-white text-black shadow-2xl print:shadow-none print:m-0 print:border-none w-full",
        !isPrint && "resume-preview-container"
      )}
      style={{ 
        fontFamily: "'Times New Roman', Times, serif",
        padding: isPrint ? '0.5in 0.75in' : '0.5in 0.75in',
        color: '#000',
        lineHeight: '1.2',
        margin: isPrint ? 0 : undefined
      }}
    >
      <header id="preview-section-personal" className={cn("resume-section text-center mb-3 sm:mb-5 transition-all p-3 rounded-xl print:p-0 print:mb-3", activeSection === 'personal' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h1 className="text-2xl mb-1 font-bold tracking-tight uppercase">
          {renderText(data.personalInfo.fullName, DUMMY.fullName, "uppercase")}
        </h1>
        <div className="text-[10pt] flex flex-wrap justify-center items-center text-slate-700 [word-wrap:break-word]">
          {visibleItems.map((item, index) => (
            <React.Fragment key={item.key}>
              <span className={cn("font-bold", !isValPresent(item.content) && !isPrint ? "text-slate-300 italic" : "text-slate-900")}>
                {item.isLink ? (
                  <a href={getLinkUrl(item.content)} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-primary transition-colors break-all">
                    {item.content}
                  </a>
                ) : item.isEmail ? (
                  <a href={`mailto:${item.content}`} className="underline decoration-slate-300 underline-offset-2 hover:text-primary transition-colors break-all">
                    {item.content}
                  </a>
                ) : (
                  <span className="break-all">{item.content}</span>
                )}
              </span>
              {index < visibleItems.length - 1 && (
                <span className="text-slate-400 select-none mx-2 print:mx-1.5" aria-hidden="true">|</span>
              )}
            </React.Fragment>
          ))}
          {visibleItems.length === 0 && !isPrint && (
            <span className="text-slate-300 italic font-normal">
              {DUMMY.phone} | {DUMMY.email} | {DUMMY.linkedin} 
            </span>
          )}
        </div>
      </header>

      <section id="preview-section-summary" className={cn("resume-section mb-3 sm:mb-5 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'summary' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-4 mb-3">Professional Summary</h2>
        <div className={cn(
          "text-[11pt] leading-tight whitespace-pre-wrap break-words",
          !isValPresent(data.professionalSummary) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-800 font-normal"
        )}>
          {renderTextWithLinks(data.professionalSummary, !isValPresent(data.professionalSummary))}
        </div>
      </section>

      <section id="preview-section-education" className={cn("resume-section mb-3 sm:mb-5 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'education' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-4 mb-3">Education</h2>
        {eduItems.data.map((edu: any) => (
          <div key={edu.id} className="mb-4 resume-item">
            <div className="flex justify-between text-[11pt]">
              {renderText(edu.institution, DUMMY.education[0].institution, "font-bold")}
              {renderText(edu.year, DUMMY.education[0].year, "font-bold")}
            </div>
            <div className="italic text-[11pt] text-slate-700">
              {renderText(edu.degree, DUMMY.education[0].degree, "font-normal")}
            </div>
          </div>
        ))}
      </section>

      <section id="preview-section-experience" className={cn("resume-section mb-3 sm:mb-5 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'experience' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-4 mb-3">Experiences</h2>
        {expItems.data.map((exp: any) => (
          <div key={exp.id} className="mb-5 text-[11pt] resume-item">
            <div className="flex justify-between">
              {renderText(exp.role, DUMMY.experience[0].role, "font-bold")}
              <span className={cn("font-bold", expItems.isDummy ? (isPrint ? "text-slate-400" : "text-slate-300 italic") : "text-slate-900")}>
                {formatDuration(exp.startDate, exp.endDate, DUMMY.experience[0].startDate, DUMMY.experience[0].endDate)}
              </span>
            </div>
            <div className="italic mb-2 text-slate-700">
              {renderText(exp.company, DUMMY.experience[0].company, "font-bold")}
            </div>
            <div className={cn("whitespace-pre-wrap pl-3 border-l-2 border-slate-100 break-words", expItems.isDummy ? (isPrint ? "text-slate-400" : "text-slate-300 italic") : "text-slate-800")}>
              {renderTextWithLinks(exp.responsibilities, expItems.isDummy)}
            </div>
          </div>
        ))}
      </section>

      <section id="preview-section-projects" className={cn("resume-section mb-3 sm:mb-5 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'projects' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-4 mb-3">Projects</h2>
        {projItems.data.map((proj: any) => (
          <div key={proj.id} className="mb-5 text-[11pt] resume-item">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {renderText(proj.title, DUMMY.projects[0].title, "font-bold")}
                  <span className="text-slate-300">|</span>
                  {renderText(proj.techStack, DUMMY.projects[0].techStack, "italic")}
                </div>
                {isValPresent(proj.link) && (
                  <a href={getLinkUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-[9pt] text-primary flex items-center hover:underline mt-0.5 print:no-underline print:text-slate-800 break-all">
                    <ExternalLink className="h-2.5 w-2.5 mr-1" />
                    {proj.link}
                  </a>
                )}
              </div>
              {renderText(proj.date, DUMMY.projects[0].date, "font-bold")}
            </div>
            <div className={cn("whitespace-pre-wrap pl-3 border-l-2 border-slate-100 mt-1 break-words", projItems.isDummy ? (isPrint ? "text-slate-400" : "text-slate-300 italic") : "text-slate-800")}>
              {renderTextWithLinks(proj.description, projItems.isDummy)}
            </div>
          </div>
        ))}
      </section>

      <section id="preview-section-skills" className={cn("resume-section mb-3 sm:mb-5 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'skills' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-4 mb-3">Skills</h2>
        <div className="text-[11pt]">
          <span className={cn("font-bold text-slate-900", data.skills.length === 0 ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "")}>Technology Stack: </span>
          {data.skills.length > 0 ? (
            <span className="text-slate-800 font-normal">{data.skills.join(", ")}</span>
          ) : (
            <span className={isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal"}>{DUMMY.skills.join(", ")}</span>
          )}
        </div>
      </section>

      <section id="preview-section-certifications" className={cn("resume-section mb-3 sm:mb-5 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'certifications' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-4 mb-3">Professional Certifications</h2>
        {certItems.data.map((cert: any) => (
          <div key={cert.id} className="mb-3 text-[11pt] resume-item">
            <div className="flex justify-between">
              {renderText(cert.name, DUMMY.certifications[0].name, "font-bold")}
              {renderText(cert.year, DUMMY.certifications[0].year, "font-bold")}
            </div>
            <div className={cn("italic text-slate-700", certItems.isDummy ? (isPrint ? "text-slate-400" : "text-slate-300") : "text-slate-800")}>
              {renderTextWithLinks(cert.issuer, certItems.isDummy)}
            </div>
          </div>
        ))}
      </section>

      <section id="preview-section-achievements" className={cn("resume-section transition-all p-3 rounded-xl print:p-0 print:mb-0", activeSection === 'achievements' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-4 mb-3">Achievements & Awards</h2>
        <div className={cn("text-[11pt] whitespace-pre-wrap pl-3 border-l-2 border-slate-100 break-words", !isValPresent(data.achievements) ? (isPrint ? "text-slate-400" : "text-slate-300 italic") : "text-slate-800")}>
          {renderTextWithLinks(data.achievements, !isValPresent(data.achievements))}
        </div>
      </section>
    </div>
  );
}
