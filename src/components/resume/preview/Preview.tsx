"use client";

import React, { useEffect, useRef } from 'react';
import { useResume } from '@/app/lib/resume-store';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ResumeContent } from './ResumeContent';

export function Preview() {
  const { data, activeSection } = useResume();
  const [zoom, setZoom] = React.useState(0.8);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ACTIVE SYNC ENGINE: Force snaps preview to section being edited
  useEffect(() => {
    if (activeSection) {
      const element = document.getElementById(`preview-section-${activeSection}`);
      if (element && scrollRef.current) {
        const containerTop = scrollRef.current.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;
        const offset = elementTop - containerTop + scrollRef.current.scrollTop - 40;
        
        scrollRef.current.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSection, data]); // Listening to data ensures keystone-snapping

  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/50 print:bg-white print:h-auto print:block overflow-hidden print:overflow-visible">
      {/* Controls Bar */}
      <div className="p-4 border-b bg-white flex items-center justify-between shrink-0 print:hidden z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="h-8 w-8 hover:bg-primary/5 hover:text-primary">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="h-8 w-8 hover:bg-primary/5 hover:text-primary">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          variant="default" 
          size="sm" 
          onClick={handleDownloadPDF}
          className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all rounded-full px-6"
        >
          <Download className="h-4 w-4 mr-2" />
          Print / Download PDF
        </Button>
      </div>

      {/* Preview Scroll Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-auto p-8 md:p-12 flex justify-center bg-slate-100/30 print:p-0 print:bg-white print:block print:overflow-visible scroll-smooth"
      >
        <div 
          className="origin-top transition-transform duration-300 print:!w-full print:!transform-none print:!h-auto print:!m-0 print:!static"
          style={{ 
            transform: `scale(${zoom})`,
            width: `${8.5 * zoom}in`,
          }}
        >
          <ResumeContent data={data} activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
}
