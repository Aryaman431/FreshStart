"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ExternalLink, FileText, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResumeContent } from '@/components/resume/preview/ResumeContent';
import { ResumeData } from '@/types/resume';

interface ResumeRow {
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string;
  updatedAt: string;
  versionCount: number;
  resumeData: ResumeData;
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />;
}

// Modal to preview a resume read-only
function ResumeModal({ data, name, onClose }: { data: ResumeData; name: string; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-bold text-white truncate">{name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 font-medium uppercase tracking-wide ml-1">Read-only</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {/* Preview */}
        <div className="flex-1 overflow-auto bg-slate-950/60 p-4">
          <div style={{ transform: 'scale(0.62)', transformOrigin: 'top left', width: '800px' }}>
            <ResumeContent data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 15;

export default function AdminResumes() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [filtered, setFiltered] = useState<ResumeRow[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ data: ResumeData; name: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/resumes')
      .then(r => r.json())
      .then(d => {
        setResumes(d.resumes ?? []);
        setFiltered(d.resumes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Client-side filter
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) { setFiltered(resumes); setPage(1); return; }
    setFiltered(resumes.filter(r =>
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q)
    ));
    setPage(1);
  }, [query, resumes]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Resumes</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? '…' : `${filtered.length} resume${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-400 text-sm">
            <Spinner /> Loading resumes…
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No resumes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Resume Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Updated</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Versions</th>
                  <th className="px-5 py-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginated.map(r => (
                  <tr key={r.userId} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.userImage}
                          alt={r.userName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{r.userName}</p>
                          <p className="text-xs text-slate-500 truncate">{r.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-300 font-medium">
                        {r.resumeData?.personalInfo?.fullName || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 hidden lg:table-cell whitespace-nowrap">
                      {new Date(r.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <GitBranch className="h-3 w-3 text-slate-500" />
                        {r.versionCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setPreview({ data: r.resumeData, name: r.userName })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
                        >
                          View
                        </button>
                        <Link
                          href={`/admin/users/${r.userId}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
                          title="User profile"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-slate-900/30">
            <p className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <ResumeModal
          data={preview.data}
          name={preview.name}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
