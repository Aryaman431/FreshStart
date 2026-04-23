"use client";

import React, { useState } from 'react';
import { X, Loader2, Briefcase, BookOpen, ChevronDown, ChevronUp, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeData } from '@/types/resume';
import { resumeToText } from '@/lib/resume-to-text';
import { tailorToJob, TailorOutput } from '@/ai/flows/ai-tailor-to-job';
import { generateInterviewPrep, InterviewPrepOutput } from '@/ai/flows/ai-interview-prep';

interface JobToolsModalProps {
  data: ResumeData;
  onClose: () => void;
}

type Tab = 'tailor' | 'interview';

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}

function TailorView({ resumeText }: { resumeText: string }) {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorOutput | null>(null);
  const [error, setError] = useState('');
  const [openBullet, setOpenBullet] = useState<number | null>(null);

  const run = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      setResult(await tailorToJob(resumeText, jd));
    } catch {
      setError('Failed to analyse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fitColor = result
    ? result.overallFit >= 70 ? 'text-emerald-600' : result.overallFit >= 45 ? 'text-amber-600' : 'text-red-600'
    : '';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Paste the job description</label>
        <Textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the full job description here…"
          className="min-h-[120px] text-sm resize-none"
        />
      </div>
      <Button onClick={run} disabled={loading || !jd.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analysing…</> : <><Sparkles className="h-4 w-4" />Tailor My Resume</>}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          {/* Fit score */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
            <span className="text-sm font-semibold text-slate-700">Current Resume Fit</span>
            <span className={`text-2xl font-black ${fitColor}`}>{result.overallFit}<span className="text-sm font-normal text-slate-400">/100</span></span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>

          {/* Missing skills */}
          {result.missingSkills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Missing Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords to add */}
          {result.keywordsToAdd.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Keywords to Add</h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keywordsToAdd.map((k, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Improved bullets */}
          {result.improvedBullets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rewritten Bullets</h4>
              {result.improvedBullets.map((b, i) => (
                <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setOpenBullet(openBullet === i ? null : i)}
                  >
                    <span className="text-xs font-semibold text-slate-600 truncate pr-2">Bullet {i + 1}</span>
                    {openBullet === i ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  </button>
                  {openBullet === i && (
                    <div className="px-3 pb-3 space-y-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Original</span>
                        <p className="text-xs text-slate-500 mt-0.5 line-through">{b.original}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-600">Improved</span>
                        <p className="text-xs text-slate-800 mt-0.5 font-medium">{b.improved}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">{b.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section order */}
          {result.sectionOrder.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommended Section Order</h4>
              <div className="flex flex-wrap gap-1.5 items-center">
                {result.sectionOrder.map((s, i) => (
                  <React.Fragment key={i}>
                    <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full font-medium">{s}</span>
                    {i < result.sectionOrder.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewView({ resumeText }: { resumeText: string }) {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewPrepOutput | null>(null);
  const [error, setError] = useState('');
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'behavioral' | 'technical'>('all');

  const run = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      setResult(await generateInterviewPrep(resumeText, jd));
    } catch {
      setError('Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = result?.questions.filter(q => filter === 'all' || q.type === filter) ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Paste the job description</label>
        <Textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the full job description here…"
          className="min-h-[120px] text-sm resize-none"
        />
      </div>
      <Button onClick={run} disabled={loading || !jd.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><BookOpen className="h-4 w-4" />Generate Interview Prep</>}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Tips */}
          {result.tipsForRole.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600">Role Tips</h4>
              {result.tipsForRole.map((t, i) => (
                <p key={i} className="text-xs text-amber-800">• {t}</p>
              ))}
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'behavioral', 'technical'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                  filter === f ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'behavioral' ? 'Behavioral' : 'Technical'}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-2">
            {filtered.map((q, i) => (
              <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                <button
                  className="w-full flex items-start justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors gap-2"
                  onClick={() => setOpenQ(openQ === i ? null : i)}
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Pill
                      label={q.type === 'behavioral' ? 'B' : 'T'}
                      color={q.type === 'behavioral' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}
                    />
                    <span className="text-xs font-medium text-slate-700 leading-relaxed">{q.question}</span>
                  </div>
                  {openQ === i ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />}
                </button>
                {openQ === i && (
                  <div className="px-3 pb-3 border-t border-slate-100 space-y-2 pt-2">
                    {(['situation', 'task', 'action', 'result'] as const).map(key => (
                      <div key={key}>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${
                          key === 'situation' ? 'text-blue-500' :
                          key === 'task' ? 'text-violet-500' :
                          key === 'action' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>{key}</span>
                        <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{q.answer[key]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function JobToolsModal({ data, onClose }: JobToolsModalProps) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<Tab>('tailor');
  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 200); };
  const handleOverlay = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === overlayRef.current) handleClose(); };

  const resumeText = resumeToText(data);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 backdrop-blur-sm
        ${visible ? 'bg-black/30' : 'bg-black/0'}`}
    >
      <div className={`relative bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-200
        w-[92vw] max-w-[600px] max-h-[88vh] overscroll-contain
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTab('tailor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'tailor' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" /> Tailor to Job
            </button>
            <button
              onClick={() => setTab('interview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'interview' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Interview Prep
            </button>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'tailor'
            ? <TailorView resumeText={resumeText} />
            : <InterviewView resumeText={resumeText} />
          }
        </div>
      </div>
    </div>
  );
}
