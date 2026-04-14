"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { ResumeContent } from './ResumeContent';
import { ResumeData } from '@/types/resume';
import { downloadResumePdf } from './downloadPdf';

interface PreviewModalProps {
  data: ResumeData;
  onClose: () => void;
}

export function PreviewModal({ data, onClose }: PreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) handleClose();
  };

  // Same function as Preview.tsx — targets the live resume-preview-root DOM node
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
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 backdrop-blur-sm
        ${visible ? 'bg-black/30' : 'bg-black/0'}`}
    >
      <div
        className={`relative bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-200
          w-[80vw] max-w-[900px] h-[85vh] overscroll-contain
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <span className="text-sm font-semibold text-slate-600 tracking-wide">Resume Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 shadow transition-all disabled:opacity-60"
            >
              {isDownloading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
              ) : (
                <><Download className="h-3.5 w-3.5" /> Download PDF</>
              )}
            </button>
            <button
              onClick={handleClose}
              aria-label="Close preview"
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Resume Content */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-slate-100/40 flex justify-center" style={{ padding: '24px' }}>
          <div style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', height: 'fit-content' }}>
            <ResumeContent data={data} isPrint={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
