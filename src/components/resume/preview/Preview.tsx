"use client";

import React, { useRef, useState } from 'react';
import { useResume } from '@/app/lib/resume-store';
import { Download, Loader2, Eye, BarChart2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeContent } from './ResumeContent';
import { PreviewModal } from './PreviewModal';
import { ScoreModal } from './ScoreModal';
import { JobToolsModal } from './JobToolsModal';
import { downloadResumePdf } from './downloadPdf';

export function Preview() {
  const { data, activeSection } = useResume();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showJobTools, setShowJobTools] = useState(false);
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
      <div className="p-3 border-b bg-white flex items-center justify-between gap-2 shrink-0 print:hidden z-10 shadow-sm">
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowPreviewModal(true)}
          className="bg-purple-300 hover:bg-purple-400 text-purple-900 font-semibold shadow shadow-purple-200 transition-all rounded-full px-4"
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Preview
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => setShowJobTools(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow shadow-amber-200 transition-all rounded-full px-4"
        >
          <Briefcase className="h-4 w-4 mr-1.5" />
          Job Tools
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => setShowScoreModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow shadow-emerald-200 transition-all rounded-full px-4"
        >
          <BarChart2 className="h-4 w-4 mr-1.5" />
          Check Score
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all rounded-full px-4 min-w-[140px]"
        >
          {isDownloading ? (
            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Generating...</>
          ) : (
            <><Download className="h-4 w-4 mr-1.5" />Download PDF</>
          )}
        </Button>
      </div>

      {/* Preview Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ background: '#d1d5db', padding: '40px 24px' }}
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
            boxShadow: '0 4px 32px 0 rgba(80,60,140,0.18)',
            position: 'relative',
            /* Snap content to A4 page multiples with a bottom gap */
            paddingBottom: '60px',
          }}
        >
          <ResumeContent data={data} activeSection={activeSection} />
        </div>
      </div>

      {showPreviewModal && (
        <PreviewModal data={data} onClose={() => setShowPreviewModal(false)} />
      )}

      {showScoreModal && (
        <ScoreModal data={data} onClose={() => setShowScoreModal(false)} />
      )}

      {showJobTools && (
        <JobToolsModal data={data} onClose={() => setShowJobTools(false)} />
      )}
    </div>
  );
}
