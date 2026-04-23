"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { improveBullet, ImproveBulletOutput } from '@/ai/flows/ai-improve-bullet';

interface BulletImproverProps {
  bullet: string;
  onAccept: (text: string) => void;
}

export function BulletImprover({ bullet, onAccept }: BulletImproverProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImproveBulletOutput | null>(null);
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState<string | null>(null);

  const run = async (mode: string) => {
    if (!bullet.trim()) return;
    setLoading(true);
    setResult(null);
    setOpen(true);
    setAccepted(null);
    try {
      const out = await improveBullet(bullet, mode);
      setResult(out);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (text: string) => {
    onAccept(text);
    setAccepted(text);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => run('action')}
          disabled={loading || !bullet.trim()}
          className="h-7 text-xs gap-1 text-violet-700 border-violet-200 hover:bg-violet-50"
        >
          <Sparkles className="h-3 w-3" /> Improve
        </Button>
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => run('metrics')}
          disabled={loading || !bullet.trim()}
          className="h-7 text-xs gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
        >
          Add Metrics
        </Button>
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => run('stronger')}
          disabled={loading || !bullet.trim()}
          className="h-7 text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        >
          Make Stronger
        </Button>
        {result && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {open ? 'Hide' : 'Show'} suggestions
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Generating variations…
        </div>
      )}

      {result && open && (
        <div className="space-y-2 rounded-lg border border-violet-100 bg-violet-50/50 p-3">
          {result.variations.map((v, i) => (
            <div key={i} className="flex items-start justify-between gap-2 group">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wide text-violet-500 block mb-0.5">{v.label}</span>
                <p className="text-xs text-slate-700 leading-relaxed">{v.text}</p>
              </div>
              <Button
                type="button" size="sm" variant="ghost"
                onClick={() => handleAccept(v.text)}
                className={`h-7 w-7 p-0 shrink-0 ${accepted === v.text ? 'text-emerald-600' : 'text-slate-400 hover:text-violet-600'}`}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
