"use client";

import React from "react";
import { ResumeData, SkillCategory } from "@/types/resume";

interface ResumeContentProps {
  data: ResumeData;
  activeSection?: string | null;
  isPrint?: boolean;
}

// Latin Modern Roman is not available as a web font; we use the closest
// system/web equivalent stack that matches its metrics.
const FONT = "'Latin Modern Roman', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";

const DUMMY = {
  fullName: "Jake Ryan",
  phone: "+1 123-456-7890",
  email: "jake@su.edu",
  linkedin: "linkedin.com/in/jake",
  github: "github.com/jake",
  summary: "Highly motivated Computer Science graduate with hands-on experience building full-stack web applications. Passionate about clean code, scalable systems, and continuous learning.",
  education: [
    {
      id: "d-edu1",
      institution: "Southwestern University",
      degree: "Bachelor of Arts in Computer Science, Minor in Business",
      startDate: "Aug. 2018",
      endDate: "May 2021",
      coursework: "Data Structures, Algorithms, Software Engineering, Operating Systems",
    },
    {
      id: "d-edu2",
      institution: "Blinn College",
      degree: "Associate's in Liberal Arts",
      startDate: "Aug. 2014",
      endDate: "May 2018",
      coursework: "",
    },
  ],
  experience: [
    {
      id: "d-exp1",
      role: "Undergraduate Research Assistant",
      company: "Texas A&M University",
      startDate: "June 2020",
      endDate: "Present",
      responsibilities:
        "Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems\nDeveloped a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data\nExplored methods to visualize GitHub collaboration in a classroom setting",
    },
    {
      id: "d-exp2",
      role: "Information Technology Support Specialist",
      company: "Southwestern University",
      startDate: "Sep. 2018",
      endDate: "Present",
      responsibilities:
        "Communicate with managers to set up campus computers used on campus\nAssess and troubleshoot computer problems brought by students, faculty and staff\nMaintain upkeep of computers, classroom equipment, and 200 printers across campus",
    },
  ],
  projects: [
    {
      id: "d-proj1",
      title: "Gitlytics",
      techStack: "Python, Flask, React, PostgreSQL, D3",
      date: "June 2020 -- Present",
      link: "",
      description:
        "Developed a full-stack web application using Flask serving a REST API with React as the frontend\nImplemented GitHub OAuth to get data from user's repositories\nVisualized GitHub data to show collaboration between users",
    },
    {
      id: "d-proj2",
      title: "Simple Paintball",
      techStack: "Spigot API, Java, Maven, TravisCI, Git",
      date: "May 2018 -- May 2020",
      link: "",
      description:
        "Developed a Minecraft server plugin to entertain kids during free time for a previous job\nDeployed on 2 servers and over 4K players have played on those servers\nWrote a unit test suite to verify the plugin works",
    },
  ],
  skills: [
    { id: "d-sk1", category: "Languages",       values: "Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R" },
    { id: "d-sk2", category: "Frameworks",      values: "React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI" },
    { id: "d-sk3", category: "Developer Tools", values: "Git, Docker, TravisCI, Google Cloud Platform, VS Code, PyCharm, IntelliJ" },
    { id: "d-sk4", category: "Libraries",       values: "pandas, NumPy, Matplotlib" },
  ] as SkillCategory[],
};

const filled = (v: string | undefined): v is string => !!v && v.trim() !== "";

function href(link: string) {
  return link.startsWith("http") ? link : `https://${link}`;
}

const DIM: React.CSSProperties = { color: "#c8c8c8", fontStyle: "italic", fontWeight: 400 };

function Ghost({ children }: { children: React.ReactNode }) {
  return <span style={DIM}>{children}</span>;
}

function Section({ title }: { title: string }) {
  return (
    <div style={{ marginTop: 0, marginBottom: 0, breakAfter: "avoid", pageBreakAfter: "avoid" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div
          data-section-title
          style={{
            fontFamily: FONT,
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#000",
            paddingBottom: "8px",
            marginBottom: 0,
          }}
        >
          {title}
        </div>
        <div style={{ borderBottom: "1px solid #000", marginBottom: 0 }} />
      </div>
    </div>
  );
}

function Row({
  left, right, bold, italic,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", lineHeight: 1.3 }}>
      <span style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal", fontSize: "11px", minWidth: 0, overflow: "visible" }}>
        {left}
      </span>
      {right !== undefined && (
        // Dates are bold
        <span style={{ fontWeight: 700, fontStyle: "normal", whiteSpace: "nowrap", marginLeft: 8, fontSize: "10px", flexShrink: 0 }}>
          {right}
        </span>
      )}
    </div>
  );
}

function Bullets({ text, ghost }: { text: string; ghost?: boolean }) {
  const lines = text.split("\n").map(l => l.replace(/^[•\-–]\s*/, "").trim()).filter(Boolean);
  return (
    <ul style={{ margin: "2px 0 0 0", padding: 0, listStyle: "none" }}>
      {lines.map((line, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: 1, paddingLeft: 16, lineHeight: 1.3, fontSize: "11px" }}>
          <span style={{ display: "inline-block", width: 16, marginLeft: -16, flexShrink: 0, textAlign: "center" }}>•</span>
          <span style={ghost ? DIM : {}}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function dateRange(start: string, end: string) {
  if (!filled(start) && !filled(end)) return undefined;
  if (!filled(end)) return start;
  if (!filled(start)) return end;
  return `${start} -- ${end}`;
}

export function ResumeContent({ data, activeSection, isPrint = false }: ResumeContentProps) {
  const p = data.personalInfo;

  const phoneDisplay = filled(p.phone)
    ? `${p.countryCode || '+91'} ${p.phone}`
    : null;

  const contacts: { label: string; link: string }[] = [];
  if (phoneDisplay)       contacts.push({ label: phoneDisplay,  link: `tel:${(p.countryCode || '+91').replace(/\s/g, '')}${p.phone.replace(/\D/g, '')}` });
  if (filled(p.email))    contacts.push({ label: p.email,       link: `mailto:${p.email}` });
  if (filled(p.linkedin)) contacts.push({ label: p.linkedin,    link: href(p.linkedin) });
  if (filled(p.github))   contacts.push({ label: p.github,      link: href(p.github) });

  const useDummyContact = contacts.length === 0;
  const contactBar = useDummyContact
    ? [
        { label: DUMMY.phone,    link: `tel:${DUMMY.phone}` },
        { label: DUMMY.email,    link: `mailto:${DUMMY.email}` },
        { label: DUMMY.linkedin, link: href(DUMMY.linkedin) },
        { label: DUMMY.github,   link: href(DUMMY.github) },
      ]
    : contacts;

  const hasEdu  = data.education.some(e  => filled(e.institution) || filled(e.degree));
  const hasExp  = data.experience.some(e => filled(e.company) || filled(e.role) || filled(e.responsibilities));
  const hasProj = data.projects.some(p  => filled(p.title) || filled(p.description));

  const eduList = hasEdu ? data.education : DUMMY.education;
  const expList = hasExp ? data.experience : DUMMY.experience;

  const realSkills = data.skills.filter(s => filled(s.category) || filled(s.values));
  const hasSkills  = realSkills.length > 0;
  const skillList  = hasSkills ? realSkills : DUMMY.skills;

  const aLink: React.CSSProperties = {
    color: "#000",
    textDecoration: "underline",
    textUnderlineOffset: "4px",
    textDecorationThickness: "1px",
    pointerEvents: "auto",
    cursor: "pointer",
  };

  return (
    <div
      id={isPrint ? "resume-print-target" : "resume-preview-root"}
      style={{
        fontFamily: FONT,
        fontSize: "11px",
        lineHeight: 1.2,
        color: "#000",
        background: "#fff",
        width: "800px",
        minWidth: "800px",
        maxWidth: "800px",
        boxSizing: "border-box",
        paddingTop: "40px",
        paddingBottom: "40px",
        paddingLeft: "40px",
        paddingRight: "40px",
        overflow: "visible",
        wordBreak: "break-word",
      }}
    >
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        {/* Name: increased by 2 units (20px → 22px) */}
        <div style={{ fontSize: "22px", fontWeight: 400, letterSpacing: "0.01em", lineHeight: 1.15, marginBottom: 8 }}>
          {filled(p.fullName) ? p.fullName : <Ghost>{DUMMY.fullName}</Ghost>}
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px 6px",
          fontSize: "11px",
          lineHeight: 1.6,
          marginBottom: 12,
        }}>
          {contactBar.map((c, i) => (
            <React.Fragment key={i}>
              {useDummyContact ? (
                <Ghost>
                  <a href={c.link} style={{ color: "#c8c8c8", textDecoration: "underline" }}>{c.label}</a>
                </Ghost>
              ) : (
                <a
                  href={c.link}
                  target={c.link.startsWith('mailto:') || c.link.startsWith('tel:') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  style={{
                    color: "#000",
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                    textDecorationThickness: "1px",
                    wordBreak: "break-all",
                    pointerEvents: "auto",
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </a>
              )}
              {i < contactBar.length - 1 && (
                <span style={{ margin: "0 6px", color: useDummyContact ? "#c8c8c8" : "#000", flexShrink: 0 }}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══ SUMMARY (conditional) ═══════════════════════════════════════════ */}
      {filled(data.professionalSummary) && (
        <div data-section style={{ paddingTop: 14 }}>
          <Section title="Summary" />
          <div data-section-body style={{ lineHeight: 1.3, marginBottom: 2, marginTop: 0, paddingTop: 0 }}>
            {data.professionalSummary}
          </div>
        </div>
      )}

      {/* ══ EDUCATION ═══════════════════════════════════════════════════════ */}
      <div data-section style={{ paddingTop: 14 }}>
        <Section title="Education" />
        <div data-section-body style={{ marginTop: 0, paddingTop: 0 }}>
          {(eduList as typeof DUMMY.education).map((edu) => (
            <div key={edu.id} style={{ marginBottom: 4 }}>
              <Row
                bold
                left={!hasEdu ? <Ghost>{edu.institution}</Ghost> : edu.institution}
                right={!hasEdu ? <Ghost>{dateRange(edu.startDate, edu.endDate)}</Ghost> : dateRange(edu.startDate, edu.endDate)}
              />
              <Row
                italic
                left={!hasEdu ? <Ghost>{edu.degree}</Ghost> : edu.degree}
              />
              {filled(edu.coursework) && (
                <div style={{ marginTop: 1 }}>
                  <span style={{ fontWeight: 700 }}>Relevant Coursework: </span>
                  <span style={!hasEdu ? DIM : {}}>{edu.coursework}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══ EXPERIENCE ══════════════════════════════════════════════════════ */}
      <div data-section style={{ paddingTop: 14 }}>
        <Section title="Experience" />
        <div data-section-body style={{ marginTop: 0, paddingTop: 0 }}>
          {(expList as typeof DUMMY.experience).map((exp) => (
            <div key={exp.id} style={{ marginBottom: 5 }}>
              <Row
                bold
                left={!hasExp ? <Ghost>{exp.role}</Ghost> : exp.role}
                right={!hasExp ? <Ghost>{dateRange(exp.startDate, exp.endDate)}</Ghost> : dateRange(exp.startDate, exp.endDate)}
              />
              <Row italic left={!hasExp ? <Ghost>{exp.company}</Ghost> : exp.company} />
              <Bullets text={exp.responsibilities} ghost={!hasExp} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ PROJECTS (optional) ═════════════════════════════════════════════ */}
      {hasProj && (
        <div data-section style={{ paddingTop: 14 }}>
          <Section title="Projects" />
          <div data-section-body style={{ marginTop: 0, paddingTop: 0 }}>
            {data.projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: 5 }}>
                <Row
                  left={
                    <span>
                      <strong>{proj.title}</strong>
                      {filled(proj.techStack) && (
                        <>
                          <span style={{ fontWeight: 400 }}>{" | "}</span>
                          <em style={{ fontWeight: 400 }}>{proj.techStack}</em>
                        </>
                      )}
                    </span>
                  }
                  right={filled(proj.startDate || '') || filled(proj.endDate || '')
                  ? dateRange(proj.startDate || '', proj.endDate || '')
                  : filled(proj.date) ? proj.date : undefined}
                />
                {filled(proj.link) && (
                  <div style={{ marginTop: 1 }}>
                    <a href={href(proj.link)} target="_blank" rel="noopener noreferrer" style={aLink}>
                      {proj.link}
                    </a>
                  </div>
                )}
                <Bullets text={proj.description} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TECHNICAL SKILLS ════════════════════════════════════════════════ */}
      <div data-section style={{ paddingTop: 14 }}>
        <Section title="Skills" />
        <div data-section-body style={{ lineHeight: 1.4, marginTop: 0, paddingTop: 0 }}>
          {skillList.map((row, i) => {
            const catLabel = filled(row.category) ? row.category : `Category ${i + 1}`;
            const vals = row.values;
            return (
              <div key={row.id}>
                <span style={{ fontWeight: 700 }}>{catLabel}: </span>
                {filled(vals)
                  ? <span style={!hasSkills ? DIM : {}}>{vals}</span>
                  : <Ghost>—</Ghost>
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ CERTIFICATIONS (conditional) — swapped before Achievements ══════ */}
      {data.certifications.some(c => filled(c.name)) && (
        <div data-section style={{ paddingTop: 14 }}>
          <Section title="Certifications" />
          <div data-section-body style={{ marginTop: 0, paddingTop: 0 }}>
            {data.certifications.filter(c => filled(c.name)).map((cert) => (
              <div key={cert.id} style={{ marginBottom: 3 }}>
                <Row bold left={cert.name} right={filled(cert.year) ? cert.year : undefined} />
                {filled(cert.issuer) && <div style={{ fontStyle: "italic" }}>{cert.issuer}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ ACHIEVEMENTS (conditional) — swapped after Certifications ════════ */}
      {filled(data.achievements) && (
        <div data-section style={{ paddingTop: 14 }}>
          <Section title="Achievements &amp; Awards" />
          <div data-section-body style={{ marginTop: 0, paddingTop: 0 }}>
            <Bullets text={data.achievements} />
          </div>
        </div>
      )}
    </div>
  );
}
