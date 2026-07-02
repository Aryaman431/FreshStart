"use client";

import React, { useEffect, useState } from 'react';
import { Users, FileText, GitBranch, Crown } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalResumes: number;
  totalVersions: number;
}

const CARDS = (s: Stats) => [
  {
    label: 'Total Users',
    value: s.totalUsers,
    icon: Users,
    accent: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  {
    label: 'Total Resumes',
    value: s.totalResumes,
    icon: FileText,
    accent: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Resume Versions',
    value: s.totalVersions,
    icon: GitBranch,
    accent: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
];

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const s = stats ?? { totalUsers: 0, totalResumes: 0, totalVersions: 0 };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Overview</h2>
        <p className="text-sm text-slate-400 mt-1">Platform snapshot — users, resumes, and versions.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-sm text-red-400">
          Failed to load stats. Check your Supabase and Clerk configuration.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {CARDS(s).map(({ label, value, icon: Icon, accent, glow, iconBg, iconColor }) => (
          <div
            key={label}
            className={`relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-lg ${glow} hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group`}
          >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent} opacity-60 group-hover:opacity-100 transition-opacity`} />

            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>

            {loading ? (
              <div className="h-8 w-16 bg-slate-700/60 rounded-lg animate-pulse mb-1" />
            ) : (
              <p className="text-3xl font-black text-white tabular-nums">{(value ?? 0).toLocaleString()}</p>
            )}
            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/admin/users"
          className="flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800/70 border border-white/5 hover:border-violet-500/30 rounded-2xl p-5 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">Manage Users</p>
            <p className="text-xs text-slate-500">Search, sort, and view user profiles</p>
          </div>
        </a>
        <a
          href="/admin/resumes"
          className="flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800/70 border border-white/5 hover:border-blue-500/30 rounded-2xl p-5 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Browse Resumes</p>
            <p className="text-xs text-slate-500">View all resumes and version history</p>
          </div>
        </a>
        <a
          href="/admin/subscriptions"
          className="flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800/70 border border-white/5 hover:border-yellow-500/30 rounded-2xl p-5 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Crown className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors">Subscriptions</p>
            <p className="text-xs text-slate-500">Manage plans, upgrades and downgrades</p>
          </div>
        </a>
      </div>
    </div>
  );
}
