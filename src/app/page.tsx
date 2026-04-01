
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
  Star
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const JOBS = [
  {
    id: 1,
    role: "Software Engineering Intern",
    company: "Nexus Systems",
    location: "San Francisco, CA (Remote)",
    type: "Internship",
    salary: "$45 - $60 /hr",
    tags: ["React", "TypeScript", "Node.js"]
  },
  {
    id: 2,
    role: "Product Design Associate",
    company: "Aura Creative",
    location: "New York, NY",
    type: "Full-time",
    salary: "$85k - $110k",
    tags: ["Figma", "UI/UX", "Prototyping"]
  },
  {
    id: 3,
    role: "Junior Data Analyst",
    company: "Stellar Insights",
    location: "Austin, TX (Hybrid)",
    type: "Full-time",
    salary: "$70k - $95k",
    tags: ["Python", "SQL", "Tableau"]
  }
];

export default function LandingPage() {
  const [text, setText] = useState('');
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
            <Link href="#opportunities" className="hover:text-primary transition-colors">Opportunities</Link>
            <Link href="#success" className="hover:text-primary transition-colors">Success</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="font-bold text-muted-foreground hover:text-primary">
              <Link href="/login">Login</Link>
            </Button>
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

                  <Button className="w-full h-16 rounded-3xl font-bold bg-foreground hover:bg-foreground/90 text-white mt-8 group-hover:bg-primary transition-all shadow-xl">
                    View Position
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <li><Link href="#" className="hover:text-primary transition-colors">ATS Logic</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Diagnostics</Link></li>
                </ul>
              </div>
              <div className="space-y-8">
                <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-white/40">Company</h4>
                <ul className="space-y-4 font-bold text-lg">
                  <li><Link href="#" className="hover:text-primary transition-colors">Our Vision</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
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
    </div>
  );
}
