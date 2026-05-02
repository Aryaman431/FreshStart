"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, TrendingUp, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { scoreResume, ResumeScoreOutput } from '@/ai/flows/ai-score-resume';
import { resumeToText } from '@/lib/resume-to-text';

interface ScoreModalProps {
  data: ResumeData;
  onClose: () => void;
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="p-1 rounded-full bg-gradient-to-br from-white to-slate-50 shadow-md">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text x="36" y="40" textAnchor="middle" fontSize="15" fontWeight="700" fill="#111">{score}</text>
        </svg>
      </div>
      <span className="text-[11px] font-semibold text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// Split summary into bullet sentences and highlight flagged words
function SummaryBullets({ text }: { text: string }) {
  const flagged = ['missing', 'improve', 'issues', 'lacks', 'add', 'consider', 'weak', 'absent'];

  const points = text
    .replace(/\n/g, ' ')
    .split('. ')
    .map(p => p.trim())
    .filter(p => p.length > 20);

  function highlight(sentence: string) {
    const parts = sentence.split(/(\b(?:missing|improve|issues|lacks|add|consider|weak|absent)\b)/gi);
    return parts.map((part, i) =>
      flagged.includes(part.toLowerCase())
        ? <mark key={i} className="bg-amber-100 text-amber-800 font-semibold rounded px-0.5">{part}</mark>
        : <React.Fragment key={i}>{part}</React.Fragment>
    );
  }

  if (points.length <= 1) {
    return <p className="text-sm text-slate-600 text-center max-w-sm leading-relaxed">{highlight(text)}</p>;
  }

  return (
    <ul className="text-left space-y-1.5 max-w-sm w-full mt-1">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
          <span className="text-purple-400 mt-0.5 shrink-0">•</span>
          <span>{highlight(point)}</span>
        </li>
      ))}
    </ul>
  );
}

const PRIORITY_CONFIG = {
  high:   { color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   label: 'High' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Medium' },
  low:    { color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-200',  label: 'Low' },
};

export function ScoreModal({ data, onClose }: ScoreModalProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResumeScoreOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const resumeText = resumeToText(data);
    scoreResume(resumeText)
      .then(setResult)
      .catch(() => setError('Failed to generate score. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 200); };
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const overallColor = result
    ? result.overallScore >= 75 ? '#22c55e'
    : result.overallScore >= 50 ? '#f59e0b'
    : '#ef4444'
    : '#6366f1';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 backdrop-blur-sm
        ${visible ? 'bg-black/30' : 'bg-black/0'}`}
    >
      <div
        className={`relative flex flex-col transition-all duration-200
          w-[90vw] max-w-[640px] max-h-[88vh] overscroll-contain
          bg-gradient-to-br from-white via-purple-50 to-indigo-50
          rounded-2xl shadow-[0_20px_60px_rgba(80,60,140,0.15)] border border-purple-100
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 shrink-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-slate-800 text-base">Resume Score</span>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-purple-100 text-slate-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-sm text-slate-500 font-medium">Analysing your resume…</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <>
              {/* Overall score hero */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="p-3 rounded-full bg-white shadow-lg shadow-purple-100">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={overallColor} strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 - (result.overallScore / 100) * 2 * Math.PI * 50}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                    <text x="60" y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill="#111">{result.overallScore}</text>
                    <text x="60" y="74" textAnchor="middle" fontSize="11" fill="#6b7280">/100</text>
                  </svg>
                </div>
                <SummaryBullets text={result.summary} />
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-4 gap-3">
                <ScoreRing score={result.atsScore}          label="ATS"          color="#6366f1" />
                <ScoreRing score={result.readabilityScore}  label="Readability"  color="#0ea5e9" />
                <ScoreRing score={result.completenessScore} label="Completeness" color="#f59e0b" />
                <ScoreRing score={result.impactScore}       label="Impact"       color="#22c55e" />
              </div>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="bg-white/70 rounded-xl border border-purple-100 p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">What's working</h3>
                  <div className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">How to improve</h3>
                  <div className="space-y-2">
                    {result.improvements.map((item, i) => {
                      const cfg = PRIORITY_CONFIG[item.priority];
                      return (
                        <div key={i} className={`rounded-xl border p-3 space-y-1 ${cfg.bg} ${cfg.border}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-600">{item.section}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/60 ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800">{item.issue}</p>
                          <div className="flex items-start gap-1.5 text-sm text-slate-600">
                            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                            {item.fix}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
