"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ResumeData, initialResumeData } from '@/types/resume';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/lib/use-supabase-auth';

interface ResumeContextType {
  data: ResumeData;
  updateData: (newData: Partial<ResumeData>) => void;
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
  resetData: () => void;
  isLoading: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'freshstart-resume-data';

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useSupabaseAuth();
  const [data, setData] = useState<ResumeData>(initialResumeData);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load resume from Supabase when user logs in
  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
      setIsCloudLoading(true);
      supabase
        .from('resumes')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: row, error }) => {
          if (!error && row?.data) {
            setData(row.data as ResumeData);
          } else {
            // No cloud data — try local storage
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
              try { setData(JSON.parse(saved)); } catch { /* ignore */ }
            }
          }
          setIsInitialized(true);
          setIsCloudLoading(false);
        });
    } else {
      // Guest — use local storage only
      if (!isInitialized) {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try { setData(JSON.parse(saved)); } catch { /* ignore */ }
        }
        setIsInitialized(true);
      }
    }
  }, [user, isUserLoading]);

  const updateData = (newData: Partial<ResumeData>) => {
    const updated = { ...data, ...newData };
    setData(updated);

    // Always persist locally
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    // Debounced upsert to Supabase
    if (user) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        supabase
          .from('resumes')
          .upsert(
            { user_id: user.id, data: updated, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
          .then(({ error }) => {
            if (error) console.error('Supabase save error:', error.message);
          });
      }, 1000);
    }
  };

  const resetData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setData(initialResumeData);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      if (user) {
        supabase
          .from('resumes')
          .upsert(
            { user_id: user.id, data: initialResumeData, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
          .then(({ error }) => {
            if (error) console.error('Supabase reset error:', error.message);
          });
      }
    }
  };

  return (
    <ResumeContext.Provider value={{
      data,
      updateData,
      activeSection,
      setActiveSection,
      resetData,
      isLoading: isUserLoading || isCloudLoading,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) throw new Error('useResume must be used within a ResumeProvider');
  return context;
}
