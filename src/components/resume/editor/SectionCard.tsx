"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useResume } from '@/app/lib/resume-store';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ id, title, icon, children }: SectionCardProps) {
  const { activeSection, setActiveSection } = useResume();
  const isActive = activeSection === id;

  return (
    <AccordionItem 
      value={id} 
      className={cn(
        "border rounded-lg mb-3 px-4 transition-all duration-300",
        isActive ? "border-primary bg-card ring-1 ring-primary/20 shadow-md" : "border-border bg-card/50"
      )}
    >
      <AccordionTrigger 
        onClick={() => setActiveSection(isActive ? null : id)}
        className="hover:no-underline py-4"
      >
        <div className="flex items-center space-x-3 text-left">
          <div className={cn(
            "p-2 rounded-md transition-colors",
            isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
          <span className={cn("font-semibold", isActive ? "text-primary" : "text-foreground")}>
            {title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-6">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
