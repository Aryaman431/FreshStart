"use client";

import React, { useState } from 'react';
import { X, Loader2, Briefcase, BookOpen, ChevronDown, ChevronUp, Check, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeData } from '@/types/resume';
import { resumeToText } from '@/lib/resume-to-text';
import { tailorToJob, TailorOutput } from '@/ai/flows/ai-tailor-to-job';
import { generateInterviewPrep, InterviewPrepOutput } from '@/ai/flows/ai-interview-prep';
import { useResume } from '@/app/lib/resume-store';

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

// Highlight flagged words in ATS feedback sentences
function HighlightedSentence({ text }: { text: string }) {
  const flagged = ['missing', 'improve', 'issues', 'lacks', 'add', 'consider', 'weak', 'absent'];
  const parts = text.split(/(\b(?:missing|improve|issues|lacks|add|consider|weak|absent)\b)/gi);
  return (
    <>
      {parts.map((part, i) =>
        flagged.includes(part.toLowerCase())
          ? <mark key={i} className="bg-amber-100 text-amber-800 font-semibold rounded px-0.5 not-italic">{part}</mark>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}

function TailorView({ resumeText }: { resumeText: string }) {
  const { data, updateData } = useResume();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorOutput | null>(null);
  const [error, setError] = useState('');
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const run = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    setSelectedKeywords([]); setAddedKeywords([]);
    try {
      setResult(await tailorToJob(resumeText, jd));
    } catch {
      setError('Failed to analyse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyword = (keyword: string) => {
    if (addedKeywords.includes(keyword)) return; // already added — no-op
    setSelectedKeywords(prev =>
      prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
    );
  };

  const humanize = (keyword: string): string => {
    const k = keyword.toLowerCase();
    if (k.includes('cloud') || k.includes('aws') || k.includes('gcp') || k.includes('azure'))
      return `Deployed and managed applications on cloud platforms as part of project work`;
    if (k.includes('real-time') || k.includes('realtime') || k.includes('websocket'))
      return `Built features that handled real-time data updates and live user interactions`;
    if (k.includes('api') || k.includes('rest') || k.includes('graphql'))
      return `Designed and integrated APIs to connect frontend and backend services`;
    if (k.includes('docker') || k.includes('container') || k.includes('kubernetes'))
      return `Worked with containerised environments to streamline development and deployment`;
    if (k.includes('test') || k.includes('jest') || k.includes('cypress'))
      return `Wrote tests to verify application behaviour and catch regressions early`;
    if (k.includes('sql') || k.includes('database') || k.includes('postgres') || k.includes('mysql'))
      return `Worked with relational databases to store, query, and manage application data`;
    if (k.includes('machine learning') || k.includes('ml') || k.includes('ai'))
      return `Explored machine learning concepts and applied them in practical project contexts`;
    if (k.includes('agile') || k.includes('scrum') || k.includes('sprint'))
      return `Collaborated in agile team settings, participating in planning and review cycles`;
    if (k.includes('git') || k.includes('version control'))
      return `Used version control workflows to manage code changes and collaborate with teammates`;
    if (k.includes('ci') || k.includes('cd') || k.includes('pipeline'))
      return `Set up and worked with CI/CD pipelines to automate builds and deployments`;
    return `Gained hands-on experience with ${keyword} through project and coursework involvement`;
  };

  const handleAddToResume = () => {
    const newOnes = selectedKeywords.filter(k => !addedKeywords.includes(k));
    if (!newOnes.length) return;
    const bullets = newOnes.map(k => humanize(k));
    const experience = [...data.experience];
    if (experience.length === 0) return;
    const last = experience[experience.length - 1];
    experience[experience.length - 1] = {
      ...last,
      responsibilities: (last.responsibilities || '').trimEnd() + '\n' + bullets.map(b => `• ${b}`).join('\n'),
    };
    updateData({ experience });
    setAddedKeywords(prev => [...prev, ...newOnes]);
    setSelectedKeywords([]);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  // ATS summary → bullet points
  const atsBullets = result
    ? result.summary.split(/(?<=[.!?])\s+/).map(p => p.trim()).filter(Boolean)
    : [];

  const fitColor = result
    ? result.overallFit >= 70 ? 'text-emerald-600' : result.overallFit >= 45 ? 'text-amber-600' : 'text-red-600'
    : '';

  const selectedCount = selectedKeywords.length;

  return (
    <div className="space-y-4 pb-20"> {/* pb-20 reserves space for sticky CTA */}
      {/* JD input */}
      <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 space-y-2">
        <label className="text-sm font-semibold text-gray-700 block mb-1">Paste the job description</label>
        <Textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the full job description here…"
          className="min-h-[120px] text-sm resize-none"
        />
      </div>

      <Button onClick={run} disabled={loading || !jd.trim()} className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analysing…</> : <><Sparkles className="h-4 w-4" />Tailor My Resume</>}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Fit score */}
          <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between hover:scale-[1.01]">
            <span className="text-sm font-semibold text-gray-700">Current Resume Fit</span>
            <span className={`text-2xl font-black ${fitColor}`}>{result.overallFit}<span className="text-sm font-normal text-slate-400">/100</span></span>
          </div>

          {/* ATS summary as bullet points */}
          {atsBullets.length > 0 && (
            <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">ATS Analysis</h4>
              <ul className="space-y-1.5">
                {atsBullets.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <span className="text-purple-500 mt-0.5 shrink-0">•</span>
                    <span><HighlightedSentence text={point} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing skills */}
          {result.missingSkills.length > 0 && (
            <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Missing Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords — selectable chips */}
          {result.keywordsToAdd.length > 0 && (
            <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Keywords to Add</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Tap to select · already added chips are marked</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywordsToAdd.map((k, i) => {
                  const isAdded = addedKeywords.includes(k);
                  const isSelected = selectedKeywords.includes(k);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleKeyword(k)}
                      disabled={isAdded}
                      className={`
                        cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                        ${isAdded
                          ? 'bg-green-100 text-green-700 border-green-200 opacity-60 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-105 border-transparent'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                        }
                      `}
                    >
                      {isAdded && <Check className="inline h-3 w-3 mr-1 -mt-0.5" />}
                      {k}
                    </button>
                  );
                })}
              </div>
              {/* Inline feedback when added */}
              {addedFeedback && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Added to your resume
                </p>
              )}
            </div>
          )}

          {/* Improved bullets */}
          {result.improvedBullets.length > 0 && (
            <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Rewritten Bullets</h4>
              {result.improvedBullets.map((b, i) => (
                <div key={i} className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
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
            <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Section Order</h4>
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

      {/* Sticky CTA — only shown when keywords are available */}
      {result && result.keywordsToAdd.length > 0 && (
        <div className="sticky bottom-0 pt-2 pb-1 bg-gradient-to-t from-white via-white/95 to-transparent">
          <button
            onClick={handleAddToResume}
            disabled={selectedCount === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-300/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {addedFeedback
              ? '✓ Added to Resume'
              : selectedCount > 0
                ? `Add ${selectedCount} keyword${selectedCount > 1 ? 's' : ''} to Resume`
                : 'Select keywords above'
            }
          </button>
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
      <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 space-y-2">
        <label className="text-sm font-semibold text-gray-700 block mb-1">Paste the job description</label>
        <Textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the full job description here…"
          className="min-h-[120px] text-sm resize-none"
        />
      </div>

      <Button onClick={run} disabled={loading || !jd.trim()} className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><BookOpen className="h-4 w-4" />Generate Interview Prep</>}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {result.tipsForRole.length > 0 && (
            <div className="bg-white/85 backdrop-blur-xl rounded-xl border border-amber-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-200 p-4 space-y-1 hover:scale-[1.01]">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Role Tips</h4>
              {result.tipsForRole.map((t, i) => (
                <p key={i} className="text-xs text-amber-800">• {t}</p>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {(['all', 'behavioral', 'technical'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                  filter === f
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'behavioral' ? 'Behavioral' : 'Technical'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((q, i) => (
              <div key={i} className="bg-white/85 backdrop-blur-xl rounded-xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-200 overflow-hidden hover:scale-[1.01]">
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
      <div className={`relative flex flex-col transition-all duration-200
        w-[92vw] max-w-[600px] max-h-[88vh] overscroll-contain
        bg-white/85 backdrop-blur-xl rounded-2xl
        shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/30
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTab('tailor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'tailor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" /> Tailor to Job
            </button>
            <button
              onClick={() => setTab('interview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'interview'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-700'
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
