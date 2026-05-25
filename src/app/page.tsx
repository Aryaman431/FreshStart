
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileUser, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Search, 
  Award, 
  Twitter, 
  Github, 
  Linkedin, 
  Facebook,
  Briefcase,
  MapPin,
  Clock,
  ArrowUpRight,
  Star,
  Play,
  X
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';

const JOBS = [
  {
    id: 1,
    role: "Software Engineering Intern",
    company: "Nexus Systems",
    location: "San Francisco, CA (Remote)",
    type: "Internship",
    salary: "$45 - $60 /hr",
    tags: ["React", "TypeScript", "Node.js"],
    description: `We're looking for a passionate Software Engineering Intern to join our core platform team at Nexus Systems.

Responsibilities:
• Build and maintain scalable web features using React and TypeScript
• Collaborate with senior engineers on system design and code reviews
• Write clean, tested, and well-documented code
• Participate in agile sprints and daily standups

Requirements:
• Pursuing a B.S. in Computer Science or related field
• Proficiency in JavaScript/TypeScript and React
• Familiarity with REST APIs and Git workflows
• Strong problem-solving skills and eagerness to learn

Perks:
• $45–$60/hr compensation
• Fully remote with flexible hours
• Mentorship from senior engineers at a Series B startup
• Full-time offer potential upon graduation`
  },
  {
    id: 2,
    role: "Product Design Associate",
    company: "Aura Creative",
    location: "New York, NY",
    type: "Full-time",
    salary: "$85k - $110k",
    tags: ["Figma", "UI/UX", "Prototyping"],
    description: `Aura Creative is hiring a Product Design Associate to shape the visual and interaction language of our flagship SaaS product.

Responsibilities:
• Own end-to-end design for key product features from wireframe to high-fidelity
• Conduct user research and usability testing to inform design decisions
• Collaborate closely with product managers and engineers
• Maintain and evolve our design system in Figma

Requirements:
• 0–2 years of product or UX design experience
• Strong portfolio demonstrating UI/UX craft
• Expert-level Figma skills including components and auto-layout
• Understanding of accessibility standards (WCAG)

Perks:
• $85k–$110k base salary + equity
• Health, dental, and vision coverage
• Annual design conference budget
• Hybrid work — 3 days in NYC office`
  },
  {
    id: 3,
    role: "Junior Data Analyst",
    company: "Stellar Insights",
    location: "Austin, TX (Hybrid)",
    type: "Full-time",
    salary: "$70k - $95k",
    tags: ["Python", "SQL", "Tableau"],
    description: `Stellar Insights is seeking a Junior Data Analyst to help turn complex datasets into actionable business intelligence.

Responsibilities:
• Write and optimize SQL queries to extract and transform data
• Build dashboards and reports in Tableau for stakeholders
• Perform exploratory data analysis using Python (pandas, numpy)
• Identify trends and present findings to non-technical audiences

Requirements:
• Degree in Data Science, Statistics, CS, or related field
• Proficiency in SQL and Python for data analysis
• Experience with Tableau or similar BI tools
• Strong attention to detail and communication skills

Perks:
• $70k–$95k salary based on experience
• Hybrid schedule — 2 days in Austin office
• 401(k) with company match
• Clear growth path to Senior Analyst within 18 months`
  }
];

export default function LandingPage() {
  const [text, setText] = useState('');
  const [selectedJob, setSelectedJob] = useState<typeof JOBS[0] | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isSignedIn, isLoaded } = useUser();

  // Pause video when modal closes
  useEffect(() => {
    if (!demoOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [demoOpen]);
  const staticPart = "Level Up Your ";
  const dynamicPart = "Resume in < 1 Min.";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(dynamicPart.slice(0, i));
      i++;
      if (i > dynamicPart.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const studentCollab = PlaceHolderImages.find(img => img.id === 'students-collaborating');
  const student1 = PlaceHolderImages.find(img => img.id === 'student-1');
  const student2 = PlaceHolderImages.find(img => img.id === 'student-2');
  const student3 = PlaceHolderImages.find(img => img.id === 'student-3');
  const student4 = PlaceHolderImages.find(img => img.id === 'student-4');

  const studentAvatars = [student1, student2, student3, student4];

  return (
    <div className="min-h-screen flex flex-col font-body selection:bg-primary/20 overflow-x-hidden geometric-pattern">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <FileUser className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">FreshStart</span>
          </div>
          <div className="hidden lg:flex items-center space-x-10 text-sm font-bold text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Platform</Link>
            <div className="relative overflow-visible flex items-center">
              {/* Radiating orange circles */}
              <div className="absolute inset-0 rounded-full animate-ping bg-orange-400/20 scale-110 pointer-events-none" />
              <div className="absolute inset-0 rounded-full animate-pulse bg-orange-300/10 scale-125 pointer-events-none" />
              <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl scale-150 pointer-events-none" />
              <button
                onClick={() => window.open('https://24x7jobs.vercel.app/', '_blank')}
                className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-orange-500 font-semibold hover:scale-[1.03] transition-all duration-300 text-sm"
              >
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                Live Jobs
              </button>
            </div>
            <Link href="#success" className="hover:text-primary transition-colors">Success</Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Watch Demo CTA */}
            <button
              onClick={() => setDemoOpen(true)}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary font-bold text-sm hover:bg-primary/10 hover:scale-105 transition-all duration-200 group"
            >
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-3 w-3 text-white fill-white ml-0.5" />
              </span>
              Watch Demo
            </button>
            {!isLoaded ? null : !isSignedIn ? (
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">
                  Login
                </Button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
            <Button size="lg" asChild className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20">
              <Link href="/builder">Build My Future</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image behind Title */}
        {studentCollab && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-x-0 top-1/4 h-1/2 w-full">
              <Image 
                src={studentCollab.imageUrl} 
                alt={studentCollab.description}
                fill
                className="object-cover opacity-10 blur-[8px]"
                priority
                data-ai-hint="students collaborating"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold mb-10 border border-primary/20 uppercase tracking-widest backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-2 animate-pulse" />
            Architect Your Career Trajectory
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-10 text-foreground uppercase leading-[0.95] max-w-5xl mx-auto min-h-[1.1em] drop-shadow-md">
            {staticPart}
            <span className="text-primary">{text}</span>
            <span className="animate-pulse border-r-4 border-primary ml-1"></span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/90 mb-14 max-w-2xl mx-auto font-medium leading-relaxed bg-white/10 backdrop-blur-[2px] rounded-2xl p-4">
            Elite firms don't just read resumes; they look for narratives. We architect yours to command recruiter attention.
          </p>
          
          <div className="flex flex-col items-center gap-14 mb-20">
            <Button size="lg" className="h-16 px-14 text-xl font-bold rounded-full shadow-[0_40px_80px_-20px_rgba(124,58,237,0.5)] hover:scale-105 transition-all bg-primary text-white" asChild>
              <Link href="/builder">
                Start Building Now <ChevronRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            
            {/* MATCHED REFERENCE Testimonial Component */}
            <div className="w-full max-w-2xl mx-auto perspective-2000">
              <div className="relative group transition-all duration-700 preserve-3d hover:rotate-x-2 hover:-translate-y-4">
                
                {/* Intense Shadow to prevent blending */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                
                {/* Main Strip Container */}
                <div className="relative flex flex-row items-center justify-between p-6 md:p-8 bg-white/95 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
                  
                  {/* Left Side: Indian Avatars overlapping */}
                  <div className="flex -space-x-4 items-center pl-2">
                    {studentAvatars.map((s, i) => (
                      <div 
                        key={i} 
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-[4px] border-white shadow-xl overflow-hidden z-10"
                        style={{ zIndex: 10 - i }}
                      >
                        {s && (
                          <Image 
                            src={s.imageUrl} 
                            alt="Indian Graduate" 
                            width={100} 
                            height={100} 
                            className="object-cover w-full h-full" 
                            data-ai-hint={s.imageHint}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Side: Text & Social Proof */}
                  <div className="flex-1 flex items-center justify-between pl-8 border-l border-slate-100 ml-4">
                    <div className="flex flex-col text-left">
                      <span className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                        JOINED BY 12K+<br/>GRADUATES
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 text-accent fill-accent" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="hidden sm:block">
                      <div className="bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Top Rated
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Video Showcase ─────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden z-20">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-orange-400/10 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">

            {/* LEFT — feature bullets */}
            <div className="space-y-10 order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black mb-6 border border-primary/20 uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 mr-2 animate-pulse" />
                  See It In Action
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-[0.95] text-foreground mb-6">
                  From Blank Page<br />
                  <span className="text-primary">to Dream Job</span><br />
                  in Minutes
                </h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  Watch how FreshStart transforms a blank canvas into a recruiter-ready resume — powered by AI, built for graduates.
                </p>
              </div>

              <ul className="space-y-5">
                {[
                  { icon: <Zap className="h-5 w-5" />, title: "AI-Powered Writing", desc: "Generate bullet points, summaries, and cover letters instantly" },
                  { icon: <Search className="h-5 w-5" />, title: "ATS Score & Gap Analysis", desc: "Know exactly how your resume ranks before you apply" },
                  { icon: <Award className="h-5 w-5" />, title: "One-Click PDF Export", desc: "Professional LaTeX-quality output, every time" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setDemoOpen(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-violet-600 text-white font-bold text-base shadow-[0_20px_60px_-10px_rgba(124,58,237,0.5)] hover:scale-105 hover:shadow-[0_30px_80px_-10px_rgba(124,58,237,0.6)] transition-all duration-300 group"
              >
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-4 w-4 fill-white ml-0.5" />
                </span>
                Watch Full Demo
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* RIGHT — floating video preview card */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-violet-500/20 to-orange-400/20 blur-2xl scale-105 animate-pulse" />

              {/* Card */}
              <div
                className="relative w-full max-w-lg rounded-3xl overflow-hidden cursor-pointer group
                  border border-white/20 shadow-[0_40px_100px_-20px_rgba(124,58,237,0.4)]
                  bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90
                  backdrop-blur-xl
                  hover:scale-[1.02] hover:shadow-[0_60px_120px_-20px_rgba(124,58,237,0.55)]
                  transition-all duration-500"
                onClick={() => setDemoOpen(true)}
                style={{ animation: 'floatCard 4s ease-in-out infinite' }}
              >
                {/* Gradient border shimmer */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-orange-400/10 pointer-events-none z-10" />

                {/* Video thumbnail — first frame via muted autoplay */}
                <video
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                  src="/Freshdemo.mp4#t=0.1"
                />

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="relative">
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping scale-150" />
                    <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse scale-[2]" />
                    {/* Play button */}
                    <div className="relative w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                      <Play className="h-8 w-8 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                </div>

                {/* Bottom label */}
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent z-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-widest">FreshStart Demo</p>
                      <p className="text-white/60 text-xs font-medium">Full walkthrough</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-white text-xs font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="container mx-auto px-6 relative z-20 -mt-20">
        <div className="max-w-6xl mx-auto spatial-card p-14 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="space-y-3">
            <div className="text-7xl font-black text-primary">92%</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Interview Rate Increase</div>
          </div>
          <div className="space-y-3 md:border-x border-white/40 px-6">
            <div className="text-7xl font-black text-primary">450+</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Elite Firms Targeted</div>
          </div>
          <div className="space-y-3">
            <div className="text-7xl font-black text-primary">Instant</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">ATS Compatibility Audit</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-48 relative z-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-24">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 px-6 py-2 uppercase tracking-widest text-[10px] font-black">Platform Engine</Badge>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight uppercase leading-none">Precision Engineered</h2>
            <p className="text-xl text-muted-foreground font-medium">Built specifically for the nuances of graduate recruitment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Built for your first steps",
                desc: "Traditional resume builders are too complex. We focus on exactly what recruiters look for in fresh graduates.",
                icon: <Zap className="h-10 w-10" />
              },
              {
                title: "Intelligent Audit",
                desc: "Real-time gap detection ensures your technical skills and certifications align with industry standards.",
                icon: <Search className="h-10 w-10" />
              },
              {
                title: "Elite Aesthetics",
                desc: "Sophisticated, posh templates that communicate authority and professionalism from the first glance.",
                icon: <Award className="h-10 w-10" />
              }
            ].map((feature, i) => (
              <div key={i} className="spatial-card p-14 hover:-translate-y-4 group">
                <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mb-10 text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold mb-5 tracking-tight text-foreground uppercase">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Postings */}
      <section id="opportunities" className="py-32 bg-slate-50/90 backdrop-blur-md relative z-30 border-t border-slate-100 rounded-t-[6rem]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 px-6 py-2 uppercase tracking-widest text-[10px] font-black">Live Postings</Badge>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                Elite <span className="text-primary">Opportunities</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium">
                Exclusive roles from top-tier firms actively seeking FreshStart architects.
              </p>
            </div>
            <Button variant="outline" size="lg" className="rounded-full bg-white shadow-xl text-primary font-bold h-16 px-10">
              Explore All Jobs <ArrowUpRight className="ml-2 h-6 w-6" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {JOBS.map((job) => (
              <div key={job.id} className="spatial-card bg-white p-12 group transition-all duration-500 hover:-translate-y-3">
                <div className="absolute top-0 right-0 p-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Briefcase className="h-7 w-7" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{job.role}</h3>
                    <p className="text-primary font-black uppercase text-sm tracking-widest">{job.company}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-muted-foreground text-base font-medium">
                      <MapPin className="h-5 w-5 mr-3 text-primary/60" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-muted-foreground text-base font-medium">
                      <Clock className="h-5 w-5 mr-3 text-primary/60" />
                      {job.type}
                    </div>
                    <div className="flex items-center text-foreground font-bold text-base">
                      <Award className="h-5 w-5 mr-3 text-primary" />
                      {job.salary}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-6">
                    {job.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700 font-bold px-4 py-1.5 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full h-16 rounded-3xl font-bold bg-foreground hover:bg-foreground/90 text-white mt-8 group-hover:bg-primary transition-all shadow-xl" onClick={() => setSelectedJob(job)}>
                    View Position
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Description Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="sm:max-w-[560px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedJob && (
            <>
              <div className="bg-primary p-8 text-white space-y-2">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">{selectedJob.role}</DialogTitle>
                </DialogHeader>
                <p className="text-white/80 font-bold text-sm uppercase tracking-widest">{selectedJob.company}</p>
                <div className="flex flex-wrap gap-4 pt-2 text-white/70 text-sm font-medium">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedJob.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedJob.type}</span>
                  <span className="flex items-center gap-1"><Award className="h-4 w-4" />{selectedJob.salary}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedJob.tags.map(tag => (
                    <Badge key={tag} className="bg-white/20 text-white border-white/30 text-xs font-bold">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-8 space-y-6 bg-white max-h-[50vh] overflow-y-auto">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">{selectedJob.description}</p>
                <Button className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" asChild>
                  <Link href="/builder">Apply with FreshStart <ChevronRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-foreground text-white pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-20">
            <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                  <FileUser className="h-7 w-7" />
                </div>
                <span className="text-3xl font-black tracking-tighter">FreshStart</span>
              </div>
              <p className="text-xl text-white/60 leading-relaxed font-medium max-w-sm">
                The definitive platform for high-potential talent to architect their professional future.
              </p>
              <div className="flex space-x-5">
                {[Twitter, Github, Linkedin, Facebook].map((Icon, idx) => (
                  <Link key={idx} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all">
                    <Icon className="h-6 w-6" />
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-8">
                <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-white/40">Platform</h4>
                <ul className="space-y-4 font-bold text-lg">
                  <li><Link href="/builder" className="hover:text-primary transition-colors">Resume Engine</Link></li>
                  <li><button onClick={() => setInfoModal('ats')} className="hover:text-primary transition-colors text-left">ATS Logic</button></li>
                  <li><button onClick={() => setInfoModal('diagnostics')} className="hover:text-primary transition-colors text-left">Diagnostics</button></li>
                </ul>
              </div>
              <div className="space-y-8">
                <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-white/40">Company</h4>
                <ul className="space-y-4 font-bold text-lg">
                  <li><button onClick={() => setInfoModal('vision')} className="hover:text-primary transition-colors text-left">Our Vision</button></li>
                  <li><button onClick={() => setInfoModal('security')} className="hover:text-primary transition-colors text-left">Security</button></li>
                  <li><button onClick={() => setInfoModal('privacy')} className="hover:text-primary transition-colors text-left">Privacy</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-sm font-bold text-white/40">
            <p>© {new Date().getFullYear()} FreshStart AI. Crafted for Excellence.</p>
            <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 tracking-widest text-[10px] uppercase">
              Ranked #1 Career Catalyst for New Graduates
            </div>
          </div>
        </div>
      </footer>

      {/* ── Demo Video Modal ────────────────────────────────────────────── */}
      {demoOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setDemoOpen(false)}
          />
          {/* Modal panel */}
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] border border-white/10"
            style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {/* Close button */}
            <button
              onClick={() => setDemoOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 hover:scale-110 transition-all"
              aria-label="Close demo"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Top bar */}
            <div className="h-10 w-full bg-[#B8A9FF]/20 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(180,160,255,0.08)] flex items-center justify-center">
              <span className="text-sm font-medium text-purple-200/80 tracking-wide">FreshStart Demo</span>
            </div>

            {/* Video */}
            <div className="bg-black">
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                className="w-full rounded-b-3xl shadow-2xl"
              >
                <source src="/Freshdemo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* ── Info Modals ─────────────────────────────────────────────────── */}
      <Dialog open={!!infoModal} onOpenChange={(open) => !open && setInfoModal(null)}>
        <DialogContent className="sm:max-w-[520px] rounded-[2rem] border-none shadow-2xl">
          {infoModal === 'ats' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">ATS Logic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Applicant Tracking Systems (ATS) are software tools used by recruiters to filter resumes before a human ever reads them. FreshStart is built with ATS compatibility at its core.</p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Clean single-column layout that parsers can read top-to-bottom without confusion</li>
                  <li>Standard section headings (Education, Experience, Skills) that ATS systems recognise</li>
                  <li>No tables, columns, or graphics that break parsing</li>
                  <li>Serif font output that renders cleanly in both screen and print contexts</li>
                  <li>Plain-text bullet points with no special characters that get mangled</li>
                </ul>
                <p className="text-sm">Result: your resume passes the filter and reaches a real person.</p>
              </div>
            </>
          )}
          {infoModal === 'diagnostics' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Diagnostics</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>FreshStart includes an AI-powered review system that analyses each section of your resume and suggests improvements.</p>
                <ul className="space-y-2 list-disc pl-5">
                  <li><span className="font-semibold text-foreground">Section-level AI review</span> — click the AI Review button on any section to get targeted feedback</li>
                  <li><span className="font-semibold text-foreground">Gap detection</span> — the AI flags missing information like dates, descriptions, or quantifiable achievements</li>
                  <li><span className="font-semibold text-foreground">One-click accept</span> — accept AI suggestions directly into your resume without copy-pasting</li>
                  <li><span className="font-semibold text-foreground">Real-time preview</span> — every change reflects instantly in the live PDF preview on the right</li>
                </ul>
              </div>
            </>
          )}
          {infoModal === 'vision' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Our Vision</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>FreshStart was built for one reason: the job application process is broken for new graduates.</p>
                <p>Most resume builders are designed for experienced professionals. They assume you have years of work history, multiple roles, and a polished personal brand. Fresh graduates and final-year students are left with templates that don't fit their reality.</p>
                <p>We built FreshStart specifically for students and freshers — with guidance at every step, AI assistance that understands entry-level contexts, and a clean LaTeX-quality output that competes with any professional resume.</p>
                <p className="font-semibold text-foreground">Our goal: make your first impression count, regardless of how much experience you have.</p>
              </div>
            </>
          )}
          {infoModal === 'security' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Security</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Your resume data is personal. Here is how we protect it:</p>
                <ul className="space-y-2 list-disc pl-5">
                  <li><span className="font-semibold text-foreground">Firebase Authentication</span> — industry-standard auth with email verification and anonymous guest sessions</li>
                  <li><span className="font-semibold text-foreground">Firestore security rules</span> — your data is stored under your user ID and is only accessible by you</li>
                  <li><span className="font-semibold text-foreground">Local storage backup</span> — your resume is also saved locally so you never lose work even without an account</li>
                  <li><span className="font-semibold text-foreground">No third-party data sharing</span> — your resume content is never sold or shared with recruiters, advertisers, or any third party</li>
                  <li><span className="font-semibold text-foreground">HTTPS everywhere</span> — all data in transit is encrypted</li>
                </ul>
              </div>
            </>
          )}
          {infoModal === 'privacy' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Privacy Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                <p className="font-semibold text-foreground">What we collect</p>
                <p>When you create an account: your email address. When you use the builder: your resume content (name, contact info, work history, etc.) stored in your personal Firestore document.</p>
                <p className="font-semibold text-foreground">What we do not collect</p>
                <p>We do not collect payment information, browsing history, or any data beyond what you explicitly enter into the resume builder.</p>
                <p className="font-semibold text-foreground">How we use your data</p>
                <p>Solely to provide the resume building service. Your resume content is used to render your preview and generate your PDF. It is not used for advertising, profiling, or any other purpose.</p>
                <p className="font-semibold text-foreground">Deleting your data</p>
                <p>You can clear all resume data at any time using the reset button in the builder. To delete your account entirely, contact us.</p>
                <p className="text-xs text-muted-foreground/60">Last updated: {new Date().getFullYear()}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
