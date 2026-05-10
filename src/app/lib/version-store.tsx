"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ResumeData, initialResumeData } from '@/types/resume';
import { supabase } from '@/lib/supabase';

export interface ResumeVersion {
  id: string;
  name: string;
  data: ResumeData;
  createdAt: string;
}

interface VersionContextType {
  versions: ResumeVersion[];
  saveVersion: (name: string, data: ResumeData) => void;
  deleteVersion: (id: string) => void;
  renameVersion: (id: string, name: string) => void;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);

  // ── Load versions from Supabase when user signs in ────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Logged out — clear all versions
      setVersions([]);
      return;
    }

    supabase
      .from('resume_versions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load versions:', error.message);
          return;
        }
        const mapped: ResumeVersion[] = (data || []).map(row => ({
          id: row.id,
          name: row.name,
          data: row.resume_data as ResumeData,
          createdAt: row.created_at,
        }));
        setVersions(mapped);
      });
  }, [user?.id, isLoaded]);

  // ── Save a new version ────────────────────────────────────────────────────
  const saveVersion = useCallback(async (name: string, data: ResumeData) => {
    const cleanData: ResumeData = JSON.parse(JSON.stringify(data));
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const trimmedName = name.trim() || `Version ${new Date().toLocaleString()}`;

    const version: ResumeVersion = { id, name: trimmedName, data: cleanData, createdAt };

    // Optimistic update
    setVersions(prev => [version, ...prev].slice(0, 20));

    if (!user) return; // guest — in-memory only

    const { error } = await supabase.from('resume_versions').insert({
      id,
      user_id: user.id,
      name: trimmedName,
      resume_data: cleanData,
      created_at: createdAt,
    });

    if (error) console.error('Failed to save version:', error.message);
  }, [user]);

  // ── Delete a version ──────────────────────────────────────────────────────
  const deleteVersion = useCallback(async (id: string) => {
    setVersions(prev => prev.filter(v => v.id !== id));

    if (!user) return;

    const { error } = await supabase
      .from('resume_versions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Failed to delete version:', error.message);
  }, [user]);

  // ── Rename a version ──────────────────────────────────────────────────────
  const renameVersion = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setVersions(prev => prev.map(v => v.id === id ? { ...v, name: trimmed } : v));

    if (!user) return;

    const { error } = await supabase
      .from('resume_versions')
      .update({ name: trimmed })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Failed to rename version:', error.message);
  }, [user]);

  return (
    <VersionContext.Provider value={{ versions, saveVersion, deleteVersion, renameVersion }}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersions() {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error('useVersions must be used within VersionProvider');
  return ctx;
}
