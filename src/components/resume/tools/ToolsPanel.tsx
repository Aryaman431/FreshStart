"use client";

import React, { useState, useCallback } from 'react';
import {
  Target, Briefcase, History, FileText,
  Loader2, ChevronDown, ChevronUp, Check,
  AlertCircle, Copy, Trash2, Clock, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useResume } from '@/app/lib/resume-store';
import { useVersions } from '@/app/lib/version-store';
import { resumeToText } from '@/lib/resume-to-text';
import { matchKeywords, KeywordMatchResult } from '@/lib/keyword-match';
import { tailorToJob, TailorOutput } from '@/ai/flows/ai-tailor-to-job';
import { generateCoverLetter, CoverLetterOutput } from '@/ai/flows/ai-cover-letter';
import { useUser, SignInButton } from '@clerk/nextjs';

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'match' | 'tailor' | 'cover';

// ─── Shared JD input ─────────────────────────────────────────────────────────
function JDInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Job Description
      </label>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste the job description here…"
        className="min-h-[110px] text-xs resize-none"
      />
    </div>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size * 0.09} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={size * 0.09}
        strokeDasharray={circ}
        strokeDashoffset={circ - (score / 100) * circ}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={size / 2} y={size / 2 + size * 0.07} textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill="#111">
        {score}
      </text>
    </svg>
  );
}

// ─── Feature 1: Keyword Match ─────────────────────────────────────────────────
function MatchTab() {
  const { data } = useResume();
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<KeywordMatchResult | null>(null);

  const run = useCallback(() => {
    if (!jd.trim()) return;
    const resumeText = resumeToText(data);
    setResult(matchKeywords(resumeText, jd));
  }, [data, jd]);

  return (
    <div className="space-y-4">
      <JDInput value={jd} onChange={setJd} />
      <Button onClick={run} disabled={!jd.trim()} className="w-full gap-2" size="sm">
        <Target className="h-3.5 w-3.5" /> Analyse Match
      </Button>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border">
            <ScoreRing score={result.score} />
            <div>
              <p className="text-lg font-black text-slate-800">{result.score}% Match</p>
              <p className="text-xs text-slate-500">{result.matched.length} of {result.totalJobKeywords} keywords found</p>
            </div>
          </div>

          {result.matched.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((k, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">{k}</span>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-500">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((k, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium">{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Feature 2: Tailor to Job ─────────────────────────────────────────────────
function TailorTab() {
  const { data, updateData } = useResume();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorOutput | null>(null);
  const [error, setError] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  const run = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      setResult(await tailorToJob(resumeToText(data), jd));
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleAdd = (text: string, idx: number) => {
    updateData({
      ...data,
      experience: [
        ...data.experience,
        { id: String(Date.now()), role: '', company: '', startDate: '', endDate: '', responsibilities: text },
      ],
    });
    setAdded(idx);
    setTimeout(() => setAdded(null), 1500);
  };

  // ATS summary → bullet points
  const atsBullets = result
    ? result.summary
        .split(/[\n•.\-]+/)
        .map(p => p.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      <JDInput value={jd} onChange={setJd} />
      <Button onClick={run} disabled={loading || !jd.trim()} className="w-full gap-2" size="sm">
        {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analysing…</> : <><Briefcase className="h-3.5 w-3.5" />Tailor Resume</>}
      </Button>

      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between hover:scale-[1.01]">
            <span className="text-xs font-semibold text-slate-600">Current Fit</span>
            <span className={`text-xl font-black ${result.overallFit >= 70 ? 'text-emerald-600' : result.overallFit >= 45 ? 'text-amber-600' : 'text-red-600'}`}>
              {result.overallFit}<span className="text-xs font-normal text-slate-400">/100</span>
            </span>
          </div>

          {/* ATS summary as bullet points */}
          {atsBullets.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-1.5">
              <p className="text-sm font-semibold text-gray-700 mb-3">ATS Analysis</p>
              <ul className="space-y-1">
                {atsBullets.map((point, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.missingSkills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-1.5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Add These Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((s, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {result.improvedBullets.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">Suggested Rewrites</p>
              {result.improvedBullets.map((b, i) => (
                <div key={i} className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 text-xs">
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 font-medium text-slate-700"
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  >
                    <span>Bullet {i + 1}</span>
                    {openIdx === i ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
                  </button>
                  {openIdx === i && (
                    <div className="px-3 pb-3 space-y-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Before</span>
                        <p className="text-slate-500 line-through mt-0.5">{b.original}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-600">After</span>
                        <p className="text-slate-800 font-medium mt-0.5">{b.improved}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 italic">{b.reason}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => copyBullet(b.improved, i)} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                            {copied === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied === i ? 'Copied' : 'Copy'}
                          </button>
                          <button onClick={() => handleAdd(b.improved, i)} className="flex items-center gap-1 text-[10px] text-emerald-600 hover:underline font-semibold">
                            {added === i ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {added === i ? 'Added!' : 'Add to Resume'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.sectionOrder.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-1.5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Recommended Order</p>
              <div className="flex flex-wrap gap-1 items-center">
                {result.sectionOrder.map((s, i) => (
                  <React.Fragment key={i}>
                    <span className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full">{s}</span>
                    {i < result.sectionOrder.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
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

// ─── Versions Panel (standalone, used in modal) ───────────────────────────────
export function VersionsPanel() {
  const { data, updateData } = useResume();
  const { versions, saveVersion, deleteVersion, renameVersion } = useVersions();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const hasData = !!(
    data.personalInfo?.fullName ||
    data.professionalSummary ||
    (data.experience?.length ?? 0) > 0 ||
    (data.projects?.length ?? 0) > 0 ||
    data.education?.some(e => e.institution || e.degree)
  );

  const nextDraftName = () => {
    const drafts = versions.filter(v => /^Draft \d+$/.test(v.name));
    return `Draft ${drafts.length + 1}`;
  };

  const saveCurrentAsDraft = () => {
    if (!hasData) return;
    saveVersion(nextDraftName(), data);
  };

  const handleSave = () => {
    saveVersion(newName.trim() || `Version ${new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}`, data);
    setNewName('');
  };

  const handleLoad = (v: typeof versions[0]) => {
    if (!window.confirm(`Load "${v.name}"? Your current resume will be saved as a draft first.`)) return;
    saveCurrentAsDraft();
    updateData(v.data);
  };

  const handleRename = (id: string, currentName: string) => {
    const newTitle = window.prompt('Rename version:', currentName);
    if (!newTitle?.trim()) return;
    renameVersion(id, newTitle.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Version name (optional)"
          className="h-8 text-xs flex-1"
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
        />
        <Button size="sm" onClick={handleSave} className="h-8 gap-1 shrink-0">
          <Plus className="h-3.5 w-3.5" /> Save
        </Button>
      </div>

      {versions.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-8">No saved versions yet.</p>
      )}

      <div className="space-y-2">
        {versions.map(v => (
          <div key={v.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-3 hover:border-primary/30 transition-colors group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {editingId === v.id ? (
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => { renameVersion(v.id, editName); setEditingId(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') { renameVersion(v.id, editName); setEditingId(null); } }}
                    className="h-6 text-xs mb-1"
                    autoFocus
                  />
                ) : (
                  <p className="text-xs font-semibold text-slate-800 truncate">{v.name}</p>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="h-2.5 w-2.5 text-slate-300" />
                  <span className="text-[10px] text-slate-400">
                    {new Date(v.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleRename(v.id, v.name)}
                  className="text-xs text-purple-600 hover:text-purple-800 transition-colors px-1"
                >
                  Rename
                </button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleLoad(v)}>
                  Load
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteVersion(v.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm w-full max-w-xs">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
          <Target className="h-6 w-6 text-purple-600" />
        </div>
        <div className="text-base font-semibold text-gray-800">Sign in to use AI Tools</div>
        <div className="mt-2 text-sm text-gray-500 leading-relaxed">
          ATS scoring, Tailor to Job, AI writing, and more.
        </div>
        <SignInButton mode="modal">
          <button className="mt-5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:scale-[1.02] transition-all shadow-md shadow-purple-200 w-full">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'match',  label: 'Match',  icon: <Target className="h-3.5 w-3.5" /> },
  { id: 'tailor', label: 'Tailor', icon: <Briefcase className="h-3.5 w-3.5" /> },
  { id: 'cover',  label: 'Cover',  icon: <FileText className="h-3.5 w-3.5" /> },
];

export function ToolsPanel() {
  const [tab, setTab] = useState<Tab>('match');
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="flex border-b shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors
              ${tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {isLoaded && !isSignedIn ? (
        <AuthGate />
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'match'  && <MatchTab />}
          {tab === 'tailor' && <TailorTab />}
          {tab === 'cover'  && <CoverTab />}
        </div>
      )}
    </div>
  );
}
function CoverTab() {
  const { data } = useResume();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoverLetterOutput | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      setResult(await generateCoverLetter(resumeToText(data), jd));
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <JDInput value={jd} onChange={setJd} />
      <Button onClick={run} disabled={loading || !jd.trim()} className="w-full gap-2" size="sm">
        {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</> : <><FileText className="h-3.5 w-3.5" />Generate Cover Letter</>}
      </Button>

      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cover Letter</p>
            <button onClick={copy} className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium">
              {copied ? <><Check className="h-3 w-3" />Copied!</> : <><Copy className="h-3 w-3" />Copy All</>}
            </button>
          </div>
          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            {[result.paragraphs.intro, result.paragraphs.experienceAlignment, result.paragraphs.skillsMatch, result.paragraphs.closing]
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">{para}</p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

