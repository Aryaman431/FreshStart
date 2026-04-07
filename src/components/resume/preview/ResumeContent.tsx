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
  // github: "github.com/alexv",
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
    return (
      <span className={cn(
        baseClasses,
        isPresent ? "text-slate-900 font-bold" : (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal")
      )}>
        {isPresent ? userVal : dummyVal}
      </span>
    );
  };

  const getLinkUrl = (link: string | undefined) => {
    if (!link) return "#";
    return link.startsWith('http') ? link : `https://${link}`;
  };

  const renderTextWithLinks = (text: string | undefined) => {
    if (!isValPresent(text)) return text;

    const parts: (string | JSX.Element)[] = [];
    const urlRegex = /\b((?:https?:\/\/|www\.)[^\s,()]+)\b/g;
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text!)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text!.substring(lastIndex, match.index));
      }

      const url = match[0];
      // Add the link
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

    // Add remaining text after the last link
    if (lastIndex < text!.length) {
      parts.push(text!.substring(lastIndex));
    }

    return <>{parts}</>;
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
    {
      key: 'phone',
      content: data.personalInfo.phone || DUMMY.phone,
      render: () => <span className="break-all">{renderText(data.personalInfo.phone, DUMMY.phone)}</span>
    },
    {
      key: 'email',
      content: data.personalInfo.email || DUMMY.email,
      render: () => (
        <a href={`mailto:${data.personalInfo.email || DUMMY.email}`} className="underline decoration-slate-300 underline-offset-2 hover:text-primary transition-colors break-all">
          {renderText(data.personalInfo.email, DUMMY.email)}
        </a>
      )
    },
    {
      key: 'linkedin',
      content: data.personalInfo.linkedin || DUMMY.linkedin,
      render: () => (
        <a href={getLinkUrl(data.personalInfo.linkedin || DUMMY.linkedin)} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-primary transition-colors break-all">
          {renderText(data.personalInfo.linkedin, DUMMY.linkedin)}
        </a>
      )
    },
    {
      key: 'github',
      content: data.personalInfo.github, // No dummy for github
      render: () => (
        <a href={getLinkUrl(data.personalInfo.github)} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-primary transition-colors break-all">
          {renderText(data.personalInfo.github, '')}
        </a>
      )
    },
    {
      key: 'additional',
      content: data.personalInfo.additionalInfo,
      render: () => <span className="font-bold text-slate-900 break-words">{renderTextWithLinks(data.personalInfo.additionalInfo)}</span>
    }
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
      {/* Header / Personal Info */}
      <header id="preview-section-personal" className={cn("resume-section text-center mb-4 sm:mb-8 transition-all p-3 rounded-xl print:p-0 print:mb-3", activeSection === 'personal' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h1 className="text-2xl mb-1 font-bold tracking-tight">
          {renderText(data.personalInfo.fullName, DUMMY.fullName, "uppercase")}
        </h1>
        <div className="text-[10pt] flex flex-wrap justify-center items-center text-slate-700">
          {visibleItems.map((item, index) => (
            <React.Fragment key={item.key}>
              {item.render()}
              {index < visibleItems.length - 1 && (
                <span className="text-slate-400 select-none mx-2 print:mx-1.5" aria-hidden="true">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Professional Summary */}
      <section id="preview-section-summary" className={cn("resume-section mb-4 sm:mb-8 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'summary' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-1 mb-3">Professional Summary</h2>
        <div className={cn(
          "text-[11pt] leading-tight whitespace-pre-wrap",
          !isValPresent(data.professionalSummary) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-800 font-normal"
        )}>
          {data.professionalSummary || DUMMY.summary}
        </div>
      </section>

      {/* Education */}
      <section id="preview-section-education" className={cn("resume-section mb-4 sm:mb-8 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'education' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-1 mb-3">Education</h2>
        {eduItems.data.map((edu: any) => (
          <div key={edu.id} className="mb-4 resume-item">
            <div className="flex justify-between text-[11pt]">
              <span className={cn(
                "font-bold",
                (eduItems.isDummy || !isValPresent(edu.institution)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
              )}>
                {edu.institution || DUMMY.education[0].institution}
              </span>
              <span className={cn(
                "font-bold",
                (eduItems.isDummy || !isValPresent(edu.year)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
              )}>
                {edu.year || DUMMY.education[0].year}
              </span>
            </div>
            <div className="italic text-[11pt] text-slate-700">
              <span className={cn(
                (eduItems.isDummy || !isValPresent(edu.degree)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 font-normal") : "text-slate-800 font-normal"
              )}>
                {edu.degree || DUMMY.education[0].degree}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Experience */}
      <section id="preview-section-experience" className={cn("resume-section mb-4 sm:mb-8 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'experience' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-1 mb-3">Experiences</h2>
        {expItems.data.map((exp: any) => (
          <div key={exp.id} className="mb-5 text-[11pt] resume-item">
            <div className="flex justify-between">
              <span className={cn(
                "font-bold",
                (expItems.isDummy || !isValPresent(exp.role)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
              )}>
                {exp.role || DUMMY.experience[0].role}
              </span>
              <span className={cn(
                "font-bold",
                (expItems.isDummy || (!isValPresent(exp.startDate) && !isValPresent(exp.endDate))) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
              )}>
                {formatDuration(exp.startDate, exp.endDate, DUMMY.experience[0].startDate, DUMMY.experience[0].endDate)}
              </span>
            </div>
            <div className="italic mb-2 text-slate-700">
              <span className={cn(
                "font-bold",
                (expItems.isDummy || !isValPresent(exp.company)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-800"
              )}>
                {exp.company || DUMMY.experience[0].company}
              </span>
            </div>
            <div className={cn(
              "whitespace-pre-wrap pl-3 border-l-2 border-slate-100",
              (expItems.isDummy || !isValPresent(exp.responsibilities)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-800 font-normal"
            )}>
              {exp.responsibilities || DUMMY.experience[0].responsibilities}
            </div>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section id="preview-section-projects" className={cn("resume-section mb-4 sm:mb-8 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'projects' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-1 mb-3">Projects</h2>
        {projItems.data.map((proj: any) => (
          <div key={proj.id} className="mb-5 text-[11pt] resume-item">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "font-bold",
                    (projItems.isDummy || !isValPresent(proj.title)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
                  )}>
                    {proj.title || DUMMY.projects[0].title}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className={cn(
                    "italic",
                    (projItems.isDummy || !isValPresent(proj.techStack)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 font-normal") : "text-slate-700 font-normal"
                  )}>
                    {proj.techStack || DUMMY.projects[0].techStack}
                  </span>
                </div>
                {isValPresent(proj.link) && (
                  <a href={getLinkUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-[9pt] text-primary flex items-center hover:underline mt-0.5 print:no-underline print:text-slate-800">
                    <ExternalLink className="h-2.5 w-2.5 mr-1" />
                    {proj.link}
                  </a>
                )}
              </div>
              <span className={cn(
                "font-bold",
                (projItems.isDummy || !isValPresent(proj.date)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
              )}>
                {proj.date || DUMMY.projects[0].date}
              </span>
            </div>
            <div className={cn(
              "whitespace-pre-wrap pl-3 border-l-2 border-slate-100 mt-1",
              (projItems.isDummy || !isValPresent(proj.description)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-800 font-normal"
            )}>
              {proj.description || DUMMY.projects[0].description}
            </div>
          </div>
        ))}
      </section>

      {/* Technical Skills */}
      <section id="preview-section-skills" className={cn("resume-section mb-4 sm:mb-8 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'skills' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-1 mb-3">Skills</h2>
        <div className="text-[11pt]">
          <span className={cn("font-bold text-slate-900", data.skills.length === 0 ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "")}>Technology Stack: </span>
          {data.skills.length > 0 ? (
            <span className="text-slate-800 font-normal">{data.skills.join(", ")}</span>
          ) : (
            <span className={isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal"}>{DUMMY.skills.join(", ")}</span>
          )}
        </div>
      </section>

      {/* Certifications */}
      <section id="preview-section-certifications" className={cn("resume-section mb-4 sm:mb-8 transition-all p-3 rounded-xl print:p-0 print:mb-6", activeSection === 'certifications' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-1 mb-3">Professional Certifications</h2>
        {certItems.data.map((cert: any) => (
          <div key={cert.id} className="mb-3 text-[11pt] resume-item">
            <div className="flex justify-between">
              <span className={cn(
                "font-bold",
                (certItems.isDummy || !isValPresent(cert.name)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
              )}>
                {cert.name || DUMMY.certifications[0].name}
              </span>
              <span className={cn(
                "font-bold",
                (certItems.isDummy || !isValPresent(cert.year)) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-900"
              )}>
                {cert.year || DUMMY.certifications[0].year}
              </span>
            </div>
            <div className="italic text-slate-700">
              {cert.issuer || DUMMY.certifications[0].issuer}
            </div>
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section id="preview-section-achievements" className={cn("resume-section transition-all p-3 rounded-xl print:p-0 print:mb-0", activeSection === 'achievements' && !isPrint && "bg-primary/5 ring-1 ring-primary/20 print:ring-0")}>
        <h2 className="text-[12pt] font-bold uppercase border-b border-slate-900 pb-1 mb-3">Achievements & Awards</h2>
        <div className={cn(
          "text-[11pt] whitespace-pre-wrap pl-3 border-l-2 border-slate-100",
          !isValPresent(data.achievements) ? (isPrint ? "text-slate-400 font-normal" : "text-slate-300 italic font-normal") : "text-slate-800 font-normal"
        )}>
          {data.achievements || DUMMY.achievements}
        </div>
      </section>
    </div>
  );
}