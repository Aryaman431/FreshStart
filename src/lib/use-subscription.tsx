"use client";

/**
 * useSubscription hook
 * Fetches the current user's plan and usage from /api/subscription.
 * Automatically initializes a free subscription row for new users.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useUser } from '@clerk/nextjs';

export interface UsageStat {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}

export interface SubscriptionState {
  plan: 'free' | 'pro' | null;
  status: 'active' | 'cancelled' | 'expired' | null;
  usage: {
    ats: UsageStat | null;
    tailor: UsageStat | null;
  };
  isLoading: boolean;
  error: string | null;
  isPro: boolean;
  refresh: () => Promise<void>;
}

const defaultState: SubscriptionState = {
  plan: null,
  status: null,
  usage: { ats: null, tailor: null },
  isLoading: true,
  error: null,
  isPro: false,
  refresh: async () => {},
};

const SubscriptionContext = createContext<SubscriptionState>(defaultState);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const [plan, setPlan] = useState<'free' | 'pro' | null>(null);
  const [status, setStatus] = useState<'active' | 'cancelled' | 'expired' | null>(null);
  const [usage, setUsage] = useState<{ ats: UsageStat | null; tailor: UsageStat | null }>({
    ats: null,
    tailor: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent concurrent fetches
  const fetchingRef = useRef(false);

  const fetchSubscription = useCallback(async () => {
    // If user is not signed in, clear state immediately
    if (!isSignedIn) {
      setPlan(null);
      setStatus(null);
      setUsage({ ats: null, tailor: null });
      setError(null);
      setIsLoading(false);
      return;
    }

    // Debounce concurrent calls
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: ensure a subscription row exists (idempotent)
      const initRes = await fetch('/api/subscription/init', { method: 'POST' });
      if (!initRes.ok) {
        const initErr = await initRes.json().catch(() => ({}));
        console.warn('[useSubscription] init failed:', initErr);
        // Non-fatal — continue to fetch anyway; subscription may already exist
      }

      // Step 2: fetch plan + usage
      const res = await fetch('/api/subscription');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!data.plan) {
        throw new Error('Invalid subscription response from server');
      }

      setPlan(data.plan);
      setStatus(data.status);
      setUsage({
        ats: data.usage?.ats ?? null,
        tailor: data.usage?.tailor ?? null,
      });
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load subscription';
      console.error('[useSubscription]', message);
      setError(message);
      // Leave plan/status as previous values so UI doesn't flash on retry
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [isSignedIn]);

  // Only run once Clerk has fully loaded, and whenever sign-in state changes
  useEffect(() => {
    if (isLoaded) {
      fetchSubscription();
    }
  }, [isLoaded, isSignedIn, fetchSubscription]);

  const value: SubscriptionState = {
    plan,
    status,
    usage,
    isLoading,
    error,
    isPro: plan === 'pro' && status === 'active',
    refresh: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
