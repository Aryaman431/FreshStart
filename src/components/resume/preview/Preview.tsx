"use client";

import React, { useRef, useState } from 'react';
import { useResume } from '@/app/lib/resume-store';
import { Download, Loader2, Eye, BarChart2, Briefcase, PanelRight, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeContent } from './ResumeContent';
import { PreviewModal } from './PreviewModal';
import { ScoreModal } from './ScoreModal';
import { JobToolsModal } from './JobToolsModal';
import { ToolsPanel, VersionsPanel } from '../tools/ToolsPanel';
import { downloadResumePdf } from './downloadPdf';
import { useUser, SignInButton } from '@clerk/nextjs';

export function Preview() {
  const { data, activeSection } = useResume();
  const { isSignedIn, isLoaded } = useUser();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showJobTools, setShowJobTools] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
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
      <div className="px-3 py-2 border-b bg-white flex items-center gap-2 shrink-0 print:hidden z-10 shadow-sm flex-wrap">
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowPreviewModal(true)}
          className="bg-purple-300 hover:bg-purple-400 text-purple-900 font-semibold shadow shadow-purple-200 transition-all rounded-full px-3 h-8 text-xs"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview
        </Button>

        {isLoaded && !isSignedIn ? (
          <SignInButton mode="modal">
            <Button
              variant="default"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow shadow-amber-200 transition-all rounded-full px-3 h-8 text-xs"
              title="Sign in to use Job Tools"
            >
              <Briefcase className="h-3.5 w-3.5 mr-1" />
              Job Tools
            </Button>
          </SignInButton>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowJobTools(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow shadow-amber-200 transition-all rounded-full px-3 h-8 text-xs"
          >
            <Briefcase className="h-3.5 w-3.5 mr-1" />
            Job Tools
          </Button>
        )}

        <Button
          variant="default"
          size="sm"
          onClick={() => setShowScoreModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow shadow-emerald-200 transition-all rounded-full px-3 h-8 text-xs"
        >
          <BarChart2 className="h-3.5 w-3.5 mr-1" />
          Check Score
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all rounded-full px-3 h-8 text-xs min-w-[120px]"
        >
          {isDownloading ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Generating...</>
          ) : (
            <><Download className="h-3.5 w-3.5 mr-1" />Download PDF</>
          )}
        </Button>

        {/* Tools panel toggle — rightmost */}
        <button
          onClick={() => setShowVersions(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-purple-600 transition-colors bg-transparent border-none shadow-none px-0"
        >
          <History className="h-3.5 w-3.5" />
          Versions
        </button>

        <Button
          variant={toolsOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => setToolsOpen(o => !o)}
          className={`ml-auto rounded-full px-3 h-8 text-xs font-semibold transition-all ${
            toolsOpen
              ? 'bg-slate-700 hover:bg-slate-800 text-white'
              : 'border-slate-300 text-slate-600 hover:bg-slate-700 hover:text-white hover:border-slate-700'
          }`}
          title={toolsOpen ? 'Hide AI Tools' : 'Show AI Tools'}
        >
          <PanelRight className="h-3.5 w-3.5 mr-1" />
          {toolsOpen ? 'Hide Tools' : 'AI Tools'}
        </Button>
      </div>

      {/* Body: preview + optional tools drawer side by side */}
      <div className="flex flex-1 min-h-0">
        {/* Preview Scroll Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-auto min-w-0"
          style={{ background: '#d1d5db', padding: '32px 24px' }}
        >
          <div
            ref={previewRef}
            style={{
              width: '800px',
              minWidth: '800px',
              margin: '0 auto',
              background: '#ffffff',
              boxSizing: 'border-box',
              boxShadow: '0 4px 32px 0 rgba(80,60,140,0.18)',
              paddingBottom: '60px',
            }}
          >
            <ResumeContent data={data} activeSection={activeSection} />
          </div>
        </div>

        {/* Tools drawer — slides in from the right, no overlap */}
        <div
          className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out border-l border-slate-200 bg-white"
          style={{ width: toolsOpen ? '280px' : '0px' }}
        >
          <div className="w-[280px] h-full overflow-y-auto">
            <ToolsPanel />
          </div>
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

      {/* Versions modal */}
      {showVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-[92vw] max-w-[480px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-slate-800 text-sm">Saved Versions</span>
              </div>
              <button
                onClick={() => setShowVersions(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <VersionsPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
