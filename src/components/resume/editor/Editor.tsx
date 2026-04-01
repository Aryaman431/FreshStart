"use client";

import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, FileText, GraduationCap, Code, Briefcase, Award, Plus, Trash2, ListChecks, Star, RefreshCcw, Info, ArrowRight } from 'lucide-react';
import { useResume } from '@/app/lib/resume-store';
import { SectionCard } from './SectionCard';
import { AIReview } from '../AIReview';
import { MonthYearPicker } from './MonthYearPicker';

export function Editor() {
  const [emailError, setEmailError] = React.useState('');
  const { data, updateData, resetData, setActiveSection } = useResume();

  // Generic handler for all personalInfo text fields
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ personalInfo: { ...data.personalInfo, [name]: value } });
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    updateData({ personalInfo: { ...data.personalInfo, phone: value } });
  };

  // Accepts any valid email (user@domain.tld)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateData({ personalInfo: { ...data.personalInfo, email: value } });

    if (!value) {
      setEmailError('');
    } else if (!emailRegex.test(value)) {
      setEmailError('Enter a valid email address (e.g. john@example.com)');
    } else {
      setEmailError('');
    }
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !emailRegex.test(value)) {
      setEmailError('Enter a valid email address (e.g. john@example.com)');
    }
  };

  const addEducation = () => {
    const newEdu = { id: crypto.randomUUID(), degree: '', institution: '', year: '', coursework: '' };
    updateData({ education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    updateData({ education: data.education.filter(e => e.id !== id) });
  };

  const addProject = () => {
    const newProj = { id: crypto.randomUUID(), title: '', description: '', techStack: '', link: '', date: '' };
    updateData({ projects: [...data.projects, newProj] });
  };

  const removeProject = (id: string) => {
    updateData({ projects: data.projects.filter(p => p.id !== id) });
  };

  const addExperience = () => {
    const newExp = { id: crypto.randomUUID(), company: '', role: '', startDate: '', endDate: '', responsibilities: '' };
    updateData({ experience: [...data.experience, newExp] });
  };

  const removeExperience = (id: string) => {
    updateData({ experience: data.experience.filter(e => e.id !== id) });
  };

  const addCertification = () => {
    const newCert = { id: crypto.randomUUID(), name: '', issuer: '', year: '' };
    updateData({ certifications: [...data.certifications, newCert] });
  };

  const removeCertification = (id: string) => {
    updateData({ certifications: data.certifications.filter(c => c.id !== id) });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b bg-card flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            Build Your Resume
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Guide for Freshers & Students</p>
        </div>
        <Button variant="ghost" size="icon" onClick={resetData} title="Clear all data" className="text-muted-foreground hover:text-destructive">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Accordion type="single" collapsible defaultValue="personal" className="w-full">
          <SectionCard id="personal" title="Personal Information" icon={<User className="h-4 w-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  name="fullName"
                  value={data.personalInfo.fullName}
                  onChange={handlePersonalChange}
                  onFocus={() => setActiveSection('personal')}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={data.personalInfo.email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  onFocus={() => setActiveSection('personal')}
                  placeholder="john@example.com"
                  className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {emailError && (
                  <p className="text-xs text-destructive">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone (Numbers only)</Label>
                <Input
                  type="tel"
                  value={data.personalInfo.phone}
                  onChange={handlePhoneInput}
                  onFocus={() => setActiveSection('personal')}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input
                  name="linkedin"
                  value={data.personalInfo.linkedin}
                  onChange={handlePersonalChange}
                  onFocus={() => setActiveSection('personal')}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input
                  name="github"
                  value={data.personalInfo.github}
                  onChange={handlePersonalChange}
                  onFocus={() => setActiveSection('personal')}
                  placeholder="github.com/johndoe"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center text-primary font-bold">
                  Additional Desired Info
                  <Info className="ml-2 h-3 w-3" />
                </Label>
                <Input
                  name="additionalInfo"
                  value={data.personalInfo.additionalInfo || ''}
                  onChange={handlePersonalChange}
                  onFocus={() => setActiveSection('personal')}
                  placeholder="e.g. Portfolio: myportfolio.com"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="summary" title="Professional Summary" icon={<FileText className="h-4 w-4" />}>
            <div className="space-y-2">
              <Label>Profile Summary (2-3 sentences)</Label>
              <Textarea
                value={data.professionalSummary}
                onChange={(e) => updateData({ professionalSummary: e.target.value })}
                onFocus={() => setActiveSection('summary')}
                placeholder="Highly motivated final-year Computer Science student..."
                className="min-h-[100px]"
              />
              <AIReview
                sectionName="Professional Summary"
                content={data.professionalSummary}
                onAccept={(val) => updateData({ professionalSummary: val })}
              />
            </div>
          </SectionCard>

          <SectionCard id="education" title="Education" icon={<GraduationCap className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.education.map((edu, idx) => (
                <div key={edu.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Institution {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onFocus={() => setActiveSection('education')}
                        onChange={(e) => {
                          const newList = [...data.education];
                          newList[idx].degree = e.target.value;
                          updateData({ education: newList });
                        }} placeholder="B.S. in Computer Science" />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onFocus={() => setActiveSection('education')}
                        onChange={(e) => {
                          const newList = [...data.education];
                          newList[idx].institution = e.target.value;
                          updateData({ education: newList });
                        }} placeholder="University of Technology" />
                    </div>
                    <div className="space-y-2">
                      <Label>Year / Period (Free Text)</Label>
                      <Input
                        value={edu.year}
                        onFocus={() => setActiveSection('education')}
                        onChange={(e) => {
                          const newList = [...data.education];
                          newList[idx].year = e.target.value;
                          updateData({ education: newList });
                        }} placeholder="Aug. 2020 -- May 2024" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addEducation} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </div>
          </SectionCard>

          <SectionCard id="experience" title="Internships / Experience" icon={<Briefcase className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.experience.map((exp, idx) => (
                <div key={exp.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Experience {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onFocus={() => setActiveSection('experience')}
                        onChange={(e) => {
                          const newList = [...data.experience];
                          newList[idx].company = e.target.value;
                          updateData({ experience: newList });
                        }} placeholder="Tech Solutions Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={exp.role}
                        onFocus={() => setActiveSection('experience')}
                        onChange={(e) => {
                          const newList = [...data.experience];
                          newList[idx].role = e.target.value;
                          updateData({ experience: newList });
                        }} placeholder="Software Engineering Intern" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Duration Period</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Start Date</Label>
                          <MonthYearPicker
                            value={exp.startDate}
                            onFocus={() => setActiveSection('experience')}
                            onChange={(val) => {
                              const newList = [...data.experience];
                              newList[idx].startDate = val;
                              updateData({ experience: newList });
                            }}
                          />
                        </div>
                        <ArrowRight className="h-4 w-4 mt-6 text-muted-foreground" />
                        <div className="flex-1">
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">End Date (or Present)</Label>
                          <MonthYearPicker
                            value={exp.endDate}
                            onFocus={() => setActiveSection('experience')}
                            onChange={(val) => {
                              const newList = [...data.experience];
                              newList[idx].endDate = val;
                              updateData({ experience: newList });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Responsibilities & Achievements</Label>
                    <Textarea
                      value={exp.responsibilities}
                      onFocus={() => setActiveSection('experience')}
                      onChange={(e) => {
                        const newList = [...data.experience];
                        newList[idx].responsibilities = e.target.value;
                        updateData({ experience: newList });
                      }} placeholder="• Developed and maintained..." />
                    <AIReview
                      sectionName="Internships / Experience"
                      content={exp.responsibilities}
                      onAccept={(val) => {
                        const newList = [...data.experience];
                        newList[idx].responsibilities = val;
                        updateData({ experience: newList });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addExperience} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>
          </SectionCard>

          <SectionCard id="projects" title="Key Projects" icon={<Star className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.projects.map((proj, idx) => (
                <div key={proj.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Project {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeProject(proj.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={proj.title}
                          onFocus={() => setActiveSection('projects')}
                          onChange={(e) => {
                            const newList = [...data.projects];
                            newList[idx].title = e.target.value;
                            updateData({ projects: newList });
                          }} placeholder="E-commerce Platform" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tech Stack</Label>
                        <Input
                          value={proj.techStack}
                          onFocus={() => setActiveSection('projects')}
                          onChange={(e) => {
                            const newList = [...data.projects];
                            newList[idx].techStack = e.target.value;
                            updateData({ projects: newList });
                          }} placeholder="Next.js, Tailwind CSS, Stripe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Project Link</Label>
                        <Input
                          value={proj.link}
                          onFocus={() => setActiveSection('projects')}
                          onChange={(e) => {
                            const newList = [...data.projects];
                            newList[idx].link = e.target.value;
                            updateData({ projects: newList });
                          }} placeholder="github.com/user/project" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date (Month - Year)</Label>
                        <MonthYearPicker
                          value={proj.date}
                          onFocus={() => setActiveSection('projects')}
                          onChange={(val) => {
                            const newList = [...data.projects];
                            newList[idx].date = val;
                            updateData({ projects: newList });
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Bullet points)</Label>
                      <Textarea
                        value={proj.description}
                        onFocus={() => setActiveSection('projects')}
                        onChange={(e) => {
                          const newList = [...data.projects];
                          newList[idx].description = e.target.value;
                          updateData({ projects: newList });
                        }} placeholder="• Designed and implemented..." />
                      <AIReview
                        sectionName="Projects"
                        content={proj.description}
                        onAccept={(val) => {
                          const newList = [...data.projects];
                          newList[idx].description = val;
                          updateData({ projects: newList });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addProject} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </div>
          </SectionCard>

          <SectionCard id="skills" title="Skills" icon={<Code className="h-4 w-4" />}>
            <div className="space-y-2">
              <Label>Technical Skills (Comma separated)</Label>
              <Input
                value={data.skills.join(', ')}
                onFocus={() => setActiveSection('skills')}
                onChange={(e) => updateData({ skills: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="Java, Python, JavaScript, React, Node.js"
              />
              <p className="text-[10px] text-muted-foreground">Separate skills with commas for best formatting.</p>
            </div>
          </SectionCard>

          <SectionCard id="certifications" title="Certifications" icon={<Award className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.certifications.map((cert, idx) => (
                <div key={cert.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Certification {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeCertification(cert.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={cert.name}
                        onFocus={() => setActiveSection('certifications')}
                        onChange={(e) => {
                          const newList = [...data.certifications];
                          newList[idx].name = e.target.value;
                          updateData({ certifications: newList });
                        }} placeholder="AWS Certified Developer" />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input
                        value={cert.issuer}
                        onFocus={() => setActiveSection('certifications')}
                        onChange={(e) => {
                          const newList = [...data.certifications];
                          newList[idx].issuer = e.target.value;
                          updateData({ certifications: newList });
                        }} placeholder="Amazon Web Services" />
                    </div>
                    <div className="space-y-2">
                      <Label>Year / Date (Month - Year)</Label>
                      <MonthYearPicker
                        value={cert.year}
                        onFocus={() => setActiveSection('certifications')}
                        onChange={(val) => {
                          const newList = [...data.certifications];
                          newList[idx].year = val;
                          updateData({ certifications: newList });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCertification} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Certification
              </Button>
            </div>
          </SectionCard>

          <SectionCard id="achievements" title="Achievements & Awards" icon={<Award className="h-4 w-4" />}>
            <div className="space-y-2">
              <Label>List your achievements (one per line)</Label>
              <Textarea
                value={data.achievements}
                onFocus={() => setActiveSection('achievements')}
                onChange={(e) => updateData({ achievements: e.target.value })}
                placeholder="• Won 1st place in National Hackathon..."
                className="min-h-[100px]"
              />
            </div>
          </SectionCard>
        </Accordion>
      </div>
    </div>
  );
}