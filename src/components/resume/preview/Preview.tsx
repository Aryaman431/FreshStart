"use client";

import React, { useRef, useState } from 'react';
import { useResume } from '@/app/lib/resume-store';
import { Download, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeContent } from './ResumeContent';
import { PreviewModal } from './PreviewModal';
import { downloadResumePdf } from './downloadPdf';

export function Preview() {
  const { data, activeSection } = useResume();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadResumePdf(data);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/50">
      {/* Controls Bar */}
      <div className="p-4 border-b bg-white flex items-center justify-between shrink-0 print:hidden z-10 shadow-sm">
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowPreviewModal(true)}
          className="bg-purple-300 hover:bg-purple-400 text-purple-900 font-semibold shadow shadow-purple-200 transition-all rounded-full px-5"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Resume
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all rounded-full px-6 min-w-[160px]"
        >
          {isDownloading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
          ) : (
            <><Download className="h-4 w-4 mr-2" />Download PDF</>
          )}
        </Button>
      </div>

      {/* Preview Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ background: '#e2e8f0', padding: '32px 24px' }}
      >
        <div
          ref={previewRef}
          style={{
            width: '800px',
            minWidth: '800px',
            maxWidth: '800px',
            margin: '0 auto',
            background: '#ffffff',
            boxSizing: 'border-box',
            boxShadow: '0 2px 24px 0 rgba(80,60,140,0.13)',
          }}
        >
          <ResumeContent data={data} activeSection={activeSection} />
        </div>
      </div>

      {showPreviewModal && (
        <PreviewModal data={data} onClose={() => setShowPreviewModal(false)} />
      )}
    </div>
  );
}
