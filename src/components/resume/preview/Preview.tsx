"use client";

import React, { useRef, useState } from 'react';
import { useResume } from '@/app/lib/resume-store';
import { ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeContent } from './ResumeContent';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function Preview() {
  const { data, activeSection } = useResume();
  const [zoom, setZoom] = useState(0.8);
  const [isDownloading, setIsDownloading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const resumeElement = document.getElementById('resume-print-target');
      if (!resumeElement) {
        console.error("Resume element not found for printing.");
        setIsDownloading(false);
        return;
      }

      // Temporarily create a hidden element for printing to ensure full content capture
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '8.5in'; // Standard US Letter width
      document.body.appendChild(printContainer);

      // Render the ResumeContent for printing inside the hidden container
      const tempRoot = document.createElement('div');
      printContainer.appendChild(tempRoot);
      
      // A way to render React component to a DOM element
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const root = ReactDOM.createRoot(tempRoot);
      root.render(<ResumeContent data={data} isPrint={true} />);
      
      // Allow time for images and styles to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(printContainer.children[0] as HTMLElement, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const pdfWidth = 8.5;
      const pdfHeight = 11;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fullName = data.personalInfo.fullName.trim() || 'resume';
      const filename = `${fullName.replace(/\s+/g, '-')}-Resume.pdf`;

      pdf.save(filename);

      // Cleanup
      root.unmount();
      document.body.removeChild(printContainer);

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
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
          disabled={isDownloading}
          className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all rounded-full px-6 w-48"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Preview Scroll Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-auto p-8 md:p-12 flex justify-center bg-slate-100/30 print:p-0 print:bg-white print:block print:overflow-visible scroll-smooth"
      >
        <div 
          ref={previewRef}
          className="origin-top transition-transform duration-300 print:!w-full print:!transform-none print:!h-auto print:!m-0 print:!static"
          style={{ 
            transform: `scale(${zoom})`,
            width: '8.5in',
            minHeight: '11in'
          }}
        >
          <ResumeContent data={data} activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
}
