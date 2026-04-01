"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ResumeData, initialResumeData } from '@/types/resume';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [data, setData] = useState<ResumeData>(initialResumeData);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized doc reference for the user's default resume
  const resumeRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'resumes', 'default-resume');
  }, [firestore, user?.uid]);

  const { data: cloudData, isLoading: isCloudLoading } = useDoc<ResumeData>(resumeRef);

  // Sync from Cloud when available
  useEffect(() => {
    if (cloudData) {
      setData(cloudData);
      setIsInitialized(true);
    }
  }, [cloudData]);

  // Load from local storage if not logged in or cloud data not yet fetched
  useEffect(() => {
    if (!user && !isInitialized) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved resume data", e);
        }
      }
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // Handle updates and debounced cloud saving
  const updateData = (newData: Partial<ResumeData>) => {
    const updated = { ...data, ...newData };
    setData(updated);

    // Always save to local storage as backup
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    // Debounced save to Firestore if logged in
    if (user && resumeRef) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setDocumentNonBlocking(resumeRef, {
          ...updated,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }, 1000);
    }
  };

  const resetData = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setData(initialResumeData);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      if (user && resumeRef) {
        setDocumentNonBlocking(resumeRef, {
          ...initialResumeData,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        }, { merge: true });
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
      isLoading: isUserLoading || isCloudLoading 
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
