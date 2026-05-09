"use client";

import React, { useEffect, useRef } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, FileText, GraduationCap, Code, Briefcase, Award, Plus, Trash2, ListChecks, Star, RefreshCcw, Upload, Loader2 } from 'lucide-react';
import { useResume } from '@/app/lib/resume-store';
import { useVersions } from '@/app/lib/version-store';
import { SectionCard } from './SectionCard';
import { AIReview } from '../AIReview';
import { MonthYearPicker } from './MonthYearPicker';
import { BulletImprover } from './BulletImprover';
import { useToast } from '@/hooks/use-toast';


// Common country codes
const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1',  label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+86', label: '🇨🇳 +86' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+60', label: '🇲🇾 +60' },
  { code: '+55', label: '🇧🇷 +55' },
  { code: '+27', label: '🇿🇦 +27' },
  { code: '+7',  label: '🇷🇺 +7' },
];

export function Editor() {
  const [emailError, setEmailError] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, updateData, resetData, setActiveSection, activeSection } = useResume();
  const { saveVersion } = useVersions();
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [scrollTrigger, setScrollTrigger] = React.useState(0);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: 'PDF only', description: 'Please upload a PDF resume.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const PARSER_URL = process.env.NEXT_PUBLIC_PARSER_URL || 'http://localhost:8000';

      const res = await fetch(`${PARSER_URL}/parse-resume`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const parsed = await res.json();

      // ── Save current resume as "Draft" before replacing ──────────────────
      const hasExistingData =
        data.personalInfo?.fullName ||
        data.professionalSummary ||
        data.experience?.some(e => e.company || e.role) ||
        data.projects?.some(p => p.title) ||
        data.education?.some(e => e.institution || e.degree);

      if (hasExistingData) {
        saveVersion(`Draft – ${new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}`, data);
      }

      // ── Full replace — not a merge ────────────────────────────────────────
      const imported = {
        personalInfo: {
          fullName:       parsed.personalInfo?.fullName       || '',
          email:          parsed.personalInfo?.email          || '',
          phone:          parsed.personalInfo?.phone          || '',
          countryCode:    parsed.personalInfo?.countryCode    || data.personalInfo?.countryCode || '+91',
          linkedin:       parsed.personalInfo?.linkedin       || '',
          github:         parsed.personalInfo?.github         || '',
          additionalInfo: parsed.personalInfo?.additionalInfo || '',
        },
        professionalSummary: parsed.professionalSummary || '',
        education:      (parsed.education      || []).map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() })),
        experience:     (parsed.experience     || []).map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() })),
        projects:       (parsed.projects       || []).map((e: any) => ({ ...e, id: e.id || crypto.randomUUID(), date: e.date || '' })),
        skills:         (parsed.skills         || []).map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() })),
        certifications: (parsed.certifications || []).map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() })),
        achievements:      parsed.achievements      || '',
        extracurriculars:  parsed.extracurriculars  || '',
        languages:         parsed.languages         || [],
        accentColor:       data.accentColor          || '#2966A3',
      };

      updateData(imported);
      toast({
        title: '✓ Resume imported',
        description: hasExistingData
          ? 'Your previous resume was saved as a Draft in Versions.'
          : 'Your details have been filled in. Review and edit as needed.',
      });
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message || 'Could not parse the resume.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const focusAndScroll = (sectionId: string | undefined) => {
    if (!sectionId) return;
    setActiveSection(sectionId);
    setScrollTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    if (activeSection && editorRef.current) {
      const scrollContainer = editorRef.current;
      const sectionElement = scrollContainer.querySelector<HTMLElement>(`#${activeSection}`);
      if (sectionElement) {
        scrollTimeoutRef.current = setTimeout(() => {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = sectionElement.getBoundingClientRect();
          const offset = elementRect.top - containerRect.top;
          const top = scrollContainer.scrollTop + offset - (containerRect.height / 2) + (elementRect.height / 2);
          scrollContainer.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    }
    return () => { if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); };
  }, [scrollTrigger]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ personalInfo: { ...data.personalInfo, [name]: value } });
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateData({ personalInfo: { ...data.personalInfo, phone: digits } });
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateData({ personalInfo: { ...data.personalInfo, email: value } });
    if (!value) setEmailError('');
    else if (!emailRegex.test(value)) setEmailError('Enter a valid email address (e.g. john@example.com)');
    else setEmailError('');
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value && !emailRegex.test(e.target.value))
      setEmailError('Enter a valid email address (e.g. john@example.com)');
  };

  // ── Education ──
  const addEducation = () => {
    updateData({ education: [...data.education, { id: crypto.randomUUID(), degree: '', institution: '', startDate: '', endDate: '', coursework: '' }] });
    focusAndScroll('education');
  };
  const removeEducation = (id: string) => updateData({ education: data.education.filter(e => e.id !== id) });

  // ── Experience ──
  const addExperience = () => {
    updateData({ experience: [...data.experience, { id: crypto.randomUUID(), company: '', role: '', startDate: '', endDate: '', responsibilities: '' }] });
    focusAndScroll('experience');
  };
  const removeExperience = (id: string) => updateData({ experience: data.experience.filter(e => e.id !== id) });

  // ── Projects ──
  const addProject = () => {
    updateData({ projects: [...data.projects, { id: crypto.randomUUID(), title: '', description: '', techStack: '', link: '', date: '', startDate: '', endDate: '' }] });
    focusAndScroll('projects');
  };
  const removeProject = (id: string) => updateData({ projects: data.projects.filter(p => p.id !== id) });

  // ── Skills ──
  const addSkillRow = () => {
    updateData({ skills: [...data.skills, { id: crypto.randomUUID(), category: '', values: '' }] });
  };
  const removeSkillRow = (id: string) => {
    if (data.skills.length <= 1) return;
    updateData({ skills: data.skills.filter(s => s.id !== id) });
  };
  const updateSkillRow = (id: string, field: 'category' | 'values', value: string) => {
    updateData({ skills: data.skills.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };

  // ── Certifications ──
  const addCertification = () => {
    updateData({ certifications: [...data.certifications, { id: crypto.randomUUID(), name: '', issuer: '', year: '' }] });
    focusAndScroll('certifications');
  };
  const removeCertification = (id: string) => updateData({ certifications: data.certifications.filter(c => c.id !== id) });

  const isEndDateBeforeStartDate = (startDate: string, endDate: string) => {
    if (!startDate || !endDate || endDate === 'Present') return false;
    return new Date(endDate) < new Date(startDate);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b bg-card flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            Build Your Resume
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Guide for Freshers &amp; Students</p>
        </div>
        <div className="flex items-center gap-1">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleResumeUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Import existing resume PDF"
            className="gap-1.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/5"
          >
            {uploading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Importing…</>
              : <><Upload className="h-3.5 w-3.5" />Import PDF</>
            }
          </Button>
          <Button variant="ghost" size="icon" onClick={resetData} title="Clear all data" className="text-muted-foreground hover:text-destructive">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={editorRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <Accordion type="single" collapsible className="w-full" value={activeSection ?? undefined} onValueChange={(val) => focusAndScroll(val)}>

          {/* ── PERSONAL INFO ── */}
          <SectionCard id="personal" title="Personal Information" icon={<User className="h-4 w-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  name="fullName"
                  value={data.personalInfo.fullName}
                  onChange={handlePersonalChange}
                  onFocus={() => focusAndScroll('personal')}
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
                  onFocus={() => focusAndScroll('personal')}
                  placeholder="john@example.com"
                  className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>

              {/* Phone with country code */}
              <div className="space-y-2 md:col-span-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <select
                    value={data.personalInfo.countryCode || '+91'}
                    onChange={(e) => updateData({ personalInfo: { ...data.personalInfo, countryCode: e.target.value } })}
                    className="flex h-9 w-[130px] shrink-0 items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '26px', appearance: 'none' }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <Input
                    type="tel"
                    value={data.personalInfo.phone}
                    onChange={handlePhoneInput}
                    onFocus={() => focusAndScroll('personal')}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Numbers only, max 10 digits</p>
              </div>

              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input
                  name="linkedin"
                  value={data.personalInfo.linkedin}
                  onChange={handlePersonalChange}
                  onFocus={() => focusAndScroll('personal')}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Info</Label>
                <Input
                  name="github"
                  value={data.personalInfo.github}
                  onChange={handlePersonalChange}
                  onFocus={() => focusAndScroll('personal')}
                  placeholder="github.com/johndoe"
                />
              </div>
            </div>
          </SectionCard>

          {/* ── PROFESSIONAL SUMMARY ── */}
          <SectionCard id="summary" title="Professional Summary" icon={<FileText className="h-4 w-4" />}>
            <div className="space-y-2">
              <Label>Profile Summary (2–3 sentences)</Label>
              <Textarea
                value={data.professionalSummary}
                onChange={(e) => updateData({ professionalSummary: e.target.value })}
                onFocus={() => focusAndScroll('summary')}
                placeholder="Highly motivated final-year Computer Science student with experience in..."
                className="min-h-[100px]"
              />
              <AIReview
                sectionName="Professional Summary"
                content={data.professionalSummary}
                onAccept={(val) => updateData({ professionalSummary: val })}
              />
            </div>
          </SectionCard>

          {/* ── EDUCATION ── */}
          <SectionCard id="education" title="Education" icon={<GraduationCap className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.education.map((edu, idx) => {
                const dateError = isEndDateBeforeStartDate(edu.startDate, edu.endDate);
                return (
                  <div key={edu.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Institution {idx + 1}</span>
                      {data.education.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input value={edu.degree} onFocus={() => focusAndScroll('education')}
                          onChange={(e) => { const l = [...data.education]; l[idx].degree = e.target.value; updateData({ education: l }); }}
                          placeholder="B.S. in Computer Science" />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input value={edu.institution} onFocus={() => focusAndScroll('education')}
                          onChange={(e) => { const l = [...data.education]; l[idx].institution = e.target.value; updateData({ education: l }); }}
                          placeholder="University of Technology" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration Period</Label>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Start Date</Label>
                          <MonthYearPicker value={edu.startDate} onFocus={() => focusAndScroll('education')}
                            onChange={(val) => { const l = [...data.education]; l[idx].startDate = val; updateData({ education: l }); }} />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">End Date (or Present)</Label>
                          <MonthYearPicker value={edu.endDate} onFocus={() => focusAndScroll('education')} allowPresent
                            onChange={(val) => { const l = [...data.education]; l[idx].endDate = val; updateData({ education: l }); }} />
                        </div>
                        {dateError && <p className="text-xs text-destructive">End date cannot be before start date.</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" onClick={addEducation} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Another Institution
              </Button>
            </div>
          </SectionCard>

          {/* ── EXPERIENCE ── */}
          <SectionCard id="experience" title="Internships / Experience" icon={<Briefcase className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.experience.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No experience added yet</p>
                  <p className="text-xs mt-1">Click below to add an internship or job</p>
                </div>
              )}
              {data.experience.map((exp, idx) => {
                const dateError = isEndDateBeforeStartDate(exp.startDate, exp.endDate);
                return (
                  <div key={exp.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Experience {idx + 1}</span>
                      {data.experience.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input value={exp.company} onFocus={() => focusAndScroll('experience')}
                          onChange={(e) => { const l = [...data.experience]; l[idx].company = e.target.value; updateData({ experience: l }); }}
                          placeholder="Tech Solutions Inc." />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={exp.role} onFocus={() => focusAndScroll('experience')}
                          onChange={(e) => { const l = [...data.experience]; l[idx].role = e.target.value; updateData({ experience: l }); }}
                          placeholder="Software Engineering Intern" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Duration Period</Label>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Start Date</Label>
                            <MonthYearPicker value={exp.startDate} onFocus={() => focusAndScroll('experience')}
                              onChange={(val) => { const l = [...data.experience]; l[idx].startDate = val; updateData({ experience: l }); }} />
                          </div>
                          <div>
                            <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">End Date (or Present)</Label>
                            <MonthYearPicker value={exp.endDate} onFocus={() => focusAndScroll('experience')} allowPresent
                              onChange={(val) => { const l = [...data.experience]; l[idx].endDate = val; updateData({ experience: l }); }} />
                          </div>
                          {dateError && <p className="text-xs text-destructive">End date cannot be before start date.</p>}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Responsibilities &amp; Achievements</Label>
                      <Textarea value={exp.responsibilities} onFocus={() => focusAndScroll('experience')}
                        onChange={(e) => { const l = [...data.experience]; l[idx].responsibilities = e.target.value; updateData({ experience: l }); }}
                        placeholder="• Developed and maintained..." />
                      <BulletImprover
                        bullet={exp.responsibilities}
                        onAccept={(val) => { const l = [...data.experience]; l[idx].responsibilities = val; updateData({ experience: l }); }}
                      />
                      <AIReview sectionName="Internships / Experience" content={exp.responsibilities}
                        onAccept={(val) => { const l = [...data.experience]; l[idx].responsibilities = val; updateData({ experience: l }); }} />
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" onClick={addExperience} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> {data.experience.length === 0 ? 'Add Experience' : 'Add Another Experience'}
              </Button>
            </div>
          </SectionCard>

          {/* ── PROJECTS ── */}
          <SectionCard id="projects" title="Key Projects" icon={<Star className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.projects.map((proj, idx) => {
                const dateError = isEndDateBeforeStartDate(proj.startDate || '', proj.endDate || '');
                return (
                <div key={proj.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Project {idx + 1}</span>
                    {data.projects.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeProject(proj.id)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={proj.title} onFocus={() => focusAndScroll('projects')}
                        onChange={(e) => { const l = [...data.projects]; l[idx].title = e.target.value; updateData({ projects: l }); }}
                        placeholder="E-commerce Platform" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tech Stack</Label>
                      <Input value={proj.techStack} onFocus={() => focusAndScroll('projects')}
                        onChange={(e) => { const l = [...data.projects]; l[idx].techStack = e.target.value; updateData({ projects: l }); }}
                        placeholder="Next.js, Tailwind CSS, Stripe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Project Link</Label>
                      <Input value={proj.link} onFocus={() => focusAndScroll('projects')}
                        onChange={(e) => { const l = [...data.projects]; l[idx].link = e.target.value; updateData({ projects: l }); }}
                        placeholder="github.com/user/project" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Duration</Label>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Start Date</Label>
                          <MonthYearPicker value={proj.startDate || ''} onFocus={() => focusAndScroll('projects')}
                            onChange={(val) => { const l = [...data.projects]; l[idx].startDate = val; updateData({ projects: l }); }} />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">End Date (or Present)</Label>
                          <MonthYearPicker value={proj.endDate || ''} onFocus={() => focusAndScroll('projects')} allowPresent
                            onChange={(val) => { const l = [...data.projects]; l[idx].endDate = val; updateData({ projects: l }); }} />
                        </div>
                        {dateError && <p className="text-xs text-destructive">End date cannot be before start date.</p>}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Bullet points)</Label>
                    <Textarea value={proj.description} onFocus={() => focusAndScroll('projects')}
                      onChange={(e) => { const l = [...data.projects]; l[idx].description = e.target.value; updateData({ projects: l }); }}
                      placeholder="• Designed and implemented..." />
                    <BulletImprover
                      bullet={proj.description}
                      onAccept={(val) => { const l = [...data.projects]; l[idx].description = val; updateData({ projects: l }); }}
                    />
                    <AIReview sectionName="Projects" content={proj.description}
                      onAccept={(val) => { const l = [...data.projects]; l[idx].description = val; updateData({ projects: l }); }} />
                  </div>
                </div>
                );
              })}
              <Button variant="outline" size="sm" onClick={addProject} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Another Project
              </Button>
            </div>
          </SectionCard>

          {/* ── SKILLS ── */}
          <SectionCard id="skills" title="Skills" icon={<Code className="h-4 w-4" />}>
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground">
                Add skill categories (e.g. Languages, Frameworks) and their values separated by commas.
              </p>
              {data.skills.map((row) => (
                <div key={row.id} className="flex gap-2 items-start">
                  <div className="w-[140px] shrink-0 space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Category</Label>
                    <Input
                      value={row.category}
                      onChange={(e) => updateSkillRow(row.id, 'category', e.target.value)}
                      onFocus={() => focusAndScroll('skills')}
                      placeholder="Languages"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Values (comma separated)</Label>
                    <Input
                      value={row.values}
                      onChange={(e) => updateSkillRow(row.id, 'values', e.target.value)}
                      onFocus={() => focusAndScroll('skills')}
                      placeholder="Python, Java, C++"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="pt-5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkillRow(row.id)}
                      disabled={data.skills.length <= 1}
                      className="h-9 w-9 text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSkillRow} className="w-full mt-1">
                <Plus className="mr-2 h-4 w-4" /> Add Skill Category
              </Button>
            </div>
          </SectionCard>
           
          {/* ── CERTIFICATIONS ── */}
          <SectionCard id="certifications" title="Certifications" icon={<Award className="h-4 w-4" />}>
            <div className="space-y-6">
              {data.certifications.map((cert, idx) => (
                <div key={cert.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Certification {idx + 1}</span>
                    {data.certifications.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCertification(cert.id)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={cert.name} onFocus={() => focusAndScroll('certifications')}
                        onChange={(e) => { const l = [...data.certifications]; l[idx].name = e.target.value; updateData({ certifications: l }); }}
                        placeholder="AWS Certified Developer" />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input value={cert.issuer} onFocus={() => focusAndScroll('certifications')}
                        onChange={(e) => { const l = [...data.certifications]; l[idx].issuer = e.target.value; updateData({ certifications: l }); }}
                        placeholder="Amazon Web Services" />
                    </div>
                    <div className="space-y-2">
                      <Label>Month / Year</Label>
                      <MonthYearPicker value={cert.year} onFocus={() => focusAndScroll('certifications')}
                        onChange={(val) => { const l = [...data.certifications]; l[idx].year = val; updateData({ certifications: l }); }} />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCertification} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Another Certification
              </Button>
            </div>
          </SectionCard>
           {/* ── ACHIEVEMENTS ── */}
          <SectionCard id="achievements" title="Achievements & Awards" icon={<Award className="h-4 w-4" />}>
            <div className="space-y-2">
              <Label>List your achievements (one per line)</Label>
              <Textarea
                value={data.achievements}
                onFocus={() => focusAndScroll('achievements')}
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
