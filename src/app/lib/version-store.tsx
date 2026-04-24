"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ResumeData } from '@/types/resume';

export interface ResumeVersion {
  id: string;
  name: string;
  data: ResumeData;
  createdAt: string; // ISO string — plain, no Firestore objects
}

interface VersionContextType {
  versions: ResumeVersion[];
  saveVersion: (name: string, data: ResumeData) => void;
  deleteVersion: (id: string) => void;
  renameVersion: (id: string, name: string) => void;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);
const LS_KEY = 'freshstart-resume-versions';

function loadFromStorage(): ResumeVersion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(versions: ResumeVersion[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(versions));
}

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [versions, setVersions] = useState<ResumeVersion[]>(() => loadFromStorage());

  const saveVersion = useCallback((name: string, data: ResumeData) => {
    // Strip any non-serializable fields (e.g. Firestore Timestamps)
    const cleanData: ResumeData = JSON.parse(JSON.stringify(data));
    const version: ResumeVersion = {
      id: crypto.randomUUID(),
      name: name.trim() || `Version ${new Date().toLocaleString()}`,
      data: cleanData,
      createdAt: new Date().toISOString(),
    };
    setVersions(prev => {
      const next = [version, ...prev].slice(0, 20); // keep max 20
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteVersion = useCallback((id: string) => {
    setVersions(prev => {
      const next = prev.filter(v => v.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const renameVersion = useCallback((id: string, name: string) => {
    setVersions(prev => {
      const next = prev.map(v => v.id === id ? { ...v, name } : v);
      saveToStorage(next);
      return next;
    });
  }, []);

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
