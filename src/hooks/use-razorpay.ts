"use client";

import { useState, useEffect } from 'react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const SCRIPT_ID = 'razorpay-checkout-js';

/**
 * Ensures the Razorpay Checkout SDK is loaded and returns its ready state.
 *
 * - If the script is already present and window.Razorpay exists → ready immediately.
 * - If not, injects the script once and waits for onload.
 * - Safe to call from multiple components — only one script tag is ever inserted.
 */
export function useRazorpay(): { ready: boolean; error: boolean } {
  const [ready, setReady] = useState<boolean>(
    // Check synchronously on first render (covers SSR hydration too)
    typeof window !== 'undefined' && typeof (window as any).Razorpay === 'function',
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    // Already available — nothing to do
    if (typeof (window as any).Razorpay === 'function') {
      console.log('[Razorpay] SDK already loaded ✓');
      setReady(true);
      return;
    }

    // Script tag already injected by Next.js <Script> or a previous call — wait for it
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      const onLoad  = () => { console.log('[Razorpay] SDK loaded ✓');        setReady(true);  };
      const onError = () => { console.error('[Razorpay] SDK failed to load'); setError(true);  };
      existing.addEventListener('load',  onLoad);
      existing.addEventListener('error', onError);
      return () => {
        existing.removeEventListener('load',  onLoad);
        existing.removeEventListener('error', onError);
      };
    }

    // No script yet — inject it ourselves
    console.log('[Razorpay] Injecting SDK script…');
    const script = document.createElement('script');
    script.id   = SCRIPT_ID;
    script.src  = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      console.log('[Razorpay] SDK loaded ✓');
      setReady(true);
    };
    script.onerror = () => {
      console.error('[Razorpay] SDK failed to load');
      setError(true);
    };
    document.body.appendChild(script);
    // No cleanup — the script should stay loaded for the lifetime of the page
  }, []);

  return { ready, error };
}
