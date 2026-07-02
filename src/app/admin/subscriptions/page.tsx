"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Crown, Users, CheckCircle2, ChevronLeft, ChevronRight,
  ArrowUpCircle, ArrowDownCircle, ExternalLink, Loader2,
} from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  email: string;
  imageUrl: string;
  plan: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
}

interface Summary {
  total: number;
  free: number;
  pro: number;
  active: number;
}

function Spinner({ small }: { small?: boolean }) {
  return (
    <div className={`border-2 border-violet-500 border-t-transparent rounded-full animate-spin ${small ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
  );
}

const FILTER_TABS = [
  { value: 'all',    label: 'All' },
  { value: 'pro',    label: 'Pro' },
  { value: 'free',   label: 'Free' },
  { value: 'active', label: 'Active' },
] as const;

type FilterValue = typeof FILTER_TABS[number]['value'];

export default function AdminSubscriptions() {
  const [subs, setSubs]       = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [query, setQuery]     = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [filter, setFilter]   = useState<FilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null); // userId being actioned

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(query); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [filter]);

  const load = useCallback(() => {
    setLoading(true);
    const url = `/api/admin/subscriptions?q=${encodeURIComponent(debouncedQ)}&filter=${filter}&page=${page}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setSubs(d.subscriptions ?? []);
        setTotal(d.total ?? 0);
        setSummary(d.summary ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedQ, filter, page]);

  useEffect(() => { load(); }, [load]);

  const handlePlanChange = async (userId: string, newPlan: 'free' | 'pro') => {
    setActionId(userId);
    try {
      const res = await fetch(`/api/admin/subscriptions/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        // Optimistically update local state
        setSubs(prev => prev.map(s =>
          s.user_id === userId ? { ...s, plan: newPlan, status: 'active' } : s,
        ));
        if (summary) {
          const wasPro = subs.find(s => s.user_id === userId)?.plan === 'pro';
          setSummary({
            ...summary,
            pro:  summary.pro  + (newPlan === 'pro' ? 1 : -1),
            free: summary.free + (newPlan === 'free' ? 1 : -1),
          });
        }
      }
    } finally {
      setActionId(null);
    }
  };

  const totalPages = Math.ceil(total / 25);

  const summaryCards = summary ? [
    {
      label: 'Total Subscriptions',
      value: summary.total,
      icon: Users,
      accent: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
    },
    {
      label: 'Free Users',
      value: summary.free,
      icon: Users,
      accent: 'from-slate-400 to-slate-500',
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-400',
    },
    {
      label: 'Pro Users',
      value: summary.pro,
      icon: Crown,
      accent: 'from-yellow-500 to-amber-600',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
    },
    {
      label: 'Active',
      value: summary.active,
      icon: CheckCircle2,
      accent: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
  ] : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Subscriptions</h2>
        <p className="text-sm text-slate-400 mt-1">Manage user plans and subscription status.</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(({ label, value, icon: Icon, accent, iconBg, iconColor }) => (
            <div
              key={label}
              className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-lg hover:border-white/10 transition-all overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <p className="text-2xl font-black text-white tabular-nums">{value.toLocaleString()}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, email or user ID…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === value
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-slate-800/60 text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-400 text-sm">
            <Spinner /> Loading subscriptions…
          </div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No subscriptions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">User ID</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Created</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Updated</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {subs.map(sub => (
                  <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {sub.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sub.imageUrl} alt={sub.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 text-xs font-black shrink-0">
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{sub.name}</p>
                          <p className="text-xs text-slate-500 truncate">{sub.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* User ID */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="font-mono text-[11px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        {sub.user_id.slice(0, 18)}…
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3.5 text-center">
                      {sub.plan === 'pro' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black">
                          <Crown className="h-3 w-3" /> Pro
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-semibold">
                          Free
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sub.status === 'active'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3.5 text-xs text-slate-500 hidden xl:table-cell whitespace-nowrap">
                      {new Date(sub.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Updated */}
                    <td className="px-5 py-3.5 text-xs text-slate-500 hidden xl:table-cell whitespace-nowrap">
                      {new Date(sub.updated_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {actionId === sub.user_id ? (
                          <Spinner small />
                        ) : (
                          <>
                            {sub.plan !== 'pro' && (
                              <button
                                onClick={() => handlePlanChange(sub.user_id, 'pro')}
                                title="Upgrade to Pro"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-yellow-400 hover:bg-yellow-500/10 transition-all"
                              >
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Upgrade</span>
                              </button>
                            )}
                            {sub.plan !== 'free' && (
                              <button
                                onClick={() => handlePlanChange(sub.user_id, 'free')}
                                title="Downgrade to Free"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-700/50 transition-all"
                              >
                                <ArrowDownCircle className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Downgrade</span>
                              </button>
                            )}
                            <Link
                              href={`/admin/users/${sub.user_id}`}
                              title="View user"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-violet-400 hover:bg-violet-500/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </>
                        )}
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
              Page {page} of {totalPages} — {total.toLocaleString()} results
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
    </div>
  );
}
