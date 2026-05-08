export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  linkedin: string;
  github: string;
  additionalInfo: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  coursework: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string;
  link: string;
  date: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  values: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
  achievements: string;
  extracurriculars: string;
  languages: Language[];
  accentColor: string;
}

export const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    linkedin: '',
    github: '',
    additionalInfo: '',
  },
  professionalSummary: '',
  education: [{ id: '1', degree: '', institution: '', startDate: '', endDate: '', coursework: '' }],
  skills: [{ id: '1', category: 'Languages', values: '' }],
  projects: [{ id: '1', title: '', description: '', techStack: '', link: '', date: '', startDate: '', endDate: '' }],
  experience: [],
  certifications: [{ id: '1', name: '', issuer: '', year: '' }],
  achievements: '',
  extracurriculars: '',
  languages: [],
  accentColor: '#2966A3',
};
