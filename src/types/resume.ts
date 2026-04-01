export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  additionalInfo: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  coursework: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string;
  link: string;
  date: string;
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

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  education: Education[];
  skills: string[];
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
    linkedin: '',
    github: '',
    additionalInfo: '',
  },
  professionalSummary: '',
  education: [],
  skills: [],
  projects: [],
  experience: [],
  certifications: [],
  achievements: '',
  extracurriculars: '',
  languages: [],
  accentColor: '#2966A3',
};
