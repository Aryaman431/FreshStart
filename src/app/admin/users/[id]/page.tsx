"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, GitBranch, Calendar, Mail, User } from 'lucide-react';
import { ResumeContent } from '@/components/resume/preview/ResumeContent';
import { ResumeData } from '@/types/resume';

interface Version {
  id: string;
  name: string;
  data: ResumeData;
  createdAt: string;
}

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    joinedAt: string;
    lastActive: string;
  };
  resume: { data: ResumeData; updated_at: string } | null;
  versions: Version[];
}

function Spinner() {
  return <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />;
}

export default function AdminUserProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [previewLabel, setPreviewLabel] = useState('Current Resume');

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(d => {
        setProfile(d);
        if (d.resume?.data) {
          setPreviewData(d.resume.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-slate-500">
        <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>User not found.</p>
      </div>
    );
  }

  const { user, resume, versions } = profile;

  const showVersion = (v: Version) => {
    setPreviewData(v.data);
    setPreviewLabel(v.name);
  };

  const showCurrent = () => {
    setPreviewData(resume?.data ?? null);
    setPreviewLabel('Current Resume');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-400 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      {/* User card */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.imageUrl}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-violet-500/20 shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-xl font-black text-white">{user.name}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          {/* Stats */}
          <div className="flex gap-3 shrink-0">
            <div className="text-center px-4 py-2.5 bg-slate-700/50 rounded-xl border border-white/5">
              <p className="text-xl font-black text-white">{resume ? 1 : 0}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">Resumes</p>
            </div>
            <div className="text-center px-4 py-2.5 bg-slate-700/50 rounded-xl border border-white/5">
              <p className="text-xl font-black text-white">{versions.length}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">Versions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: versions list */}
        <div className="xl:col-span-2 space-y-4">
          {/* Current resume info */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Resume</h3>
            </div>
            {resume ? (
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {resume.data?.personalInfo?.fullName || 'Unnamed Resume'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Updated {new Date(resume.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={showCurrent}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 hover:text-violet-300 border border-violet-500/20 transition-all"
                  >
                    View
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">
                No resume saved yet.
              </div>
            )}
          </div>

          {/* Versions */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Versions</h3>
              <span className="ml-auto text-xs text-slate-500 font-medium">{versions.length}</span>
            </div>
            {versions.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">No versions saved.</div>
            ) : (
              <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
                {versions.map(v => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-semibold text-white truncate">{v.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(v.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => showVersion(v)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 border border-white/5 hover:border-violet-500/20 transition-all"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: resume preview */}
        <div className="xl:col-span-3 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white truncate">{previewLabel}</h3>
            </div>
            {previewLabel !== 'Current Resume' && resume?.data && (
              <button
                onClick={showCurrent}
                className="text-xs text-slate-400 hover:text-violet-400 transition-colors font-medium shrink-0 ml-3"
              >
                ← Current
              </button>
            )}
          </div>

          {previewData ? (
            <div className="flex-1 overflow-auto bg-slate-950/40 p-4">
              {/* Scale the 800px-wide resume to fit the container */}
              <div
                className="origin-top-left"
                style={{
                  transform: 'scale(0.62)',
                  width: '800px',
                  transformOrigin: 'top left',
                }}
              >
                <ResumeContent data={previewData} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-16">
              <FileText className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">No resume data to preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
