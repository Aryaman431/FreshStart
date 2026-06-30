"use client";

/**
 * PaywallModal
 * Reusable paywall that appears when a user exceeds a free-tier limit.
 * Glassmorphism + lavender theme. Fully responsive.
 */

import React, { useState } from 'react';
import { X, Zap, CheckCircle2, Sparkles, ArrowRight, Loader2, Crown } from 'lucide-react';
import { useSubscription } from '@/lib/use-subscription';
import { useUser } from '@clerk/nextjs';

interface PaywallModalProps {
  /** Which feature triggered the paywall */
  feature?: 'ats' | 'tailor' | 'versions' | 'ai' | 'general';
  onClose: () => void;
  /** Called when upgrade succeeds — parent can re-trigger the locked action */
  onUpgradeSuccess?: () => void;
}

const FEATURE_LABELS: Record<NonNullable<PaywallModalProps['feature']>, string> = {
  ats: 'ATS Checks',
  tailor: 'Tailor to Job',
  versions: 'Resume Versions',
  ai: 'AI Improvements',
  general: 'Premium Features',
};

const FREE_FEATURES = [
  '✅ Resume Builder',
  '✅ Resume Import',
  '✅ Resume Download',
  '✅ 3 ATS Checks / day',
  '✅ 3 Tailor to Job / day',
];

const PRO_FEATURES = [
  { label: 'Unlimited ATS Checks', highlight: false },
  { label: 'Unlimited Tailor to Job', highlight: false },
  { label: 'Unlimited Resume Versions', highlight: false },
  { label: 'Premium AI Improvements', highlight: false },
  { label: 'Future Premium Features', highlight: false },
];

export function PaywallModal({ feature = 'general', onClose, onUpgradeSuccess }: PaywallModalProps) {
  const { refresh } = useSubscription();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create a Razorpay order on the server
      const orderRes = await fetch('/api/create-order', { method: 'POST' });
      const order = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !order.success) {
        throw new Error(order.error ?? `Order creation failed (HTTP ${orderRes.status})`);
      }

      // Step 2: Open Razorpay Checkout
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'FreshStart',
          description: 'FreshStart Pro — Unlimited Access',
          order_id: order.orderId,
          prefill: {
            name: user?.fullName ?? '',
            email: user?.primaryEmailAddress?.emailAddress ?? '',
          },
          theme: {
            color: '#7C3AED',
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled. You can try again anytime.'));
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // Step 3: Verify signature on the server
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) {
                const errData = await verifyRes.json().catch(() => ({}));
                throw new Error(errData.error ?? 'Payment verification failed. Contact support.');
              }

              const result = await verifyRes.json();
              if (!result.success) throw new Error('Upgrade failed. Please contact support.');

              // Step 4: Refresh subscription and update UI
              await refresh();
              setSuccess(true);

              setTimeout(() => {
                onClose();
                onUpgradeSuccess?.();
              }, 1800);

              resolve();
            } catch (err) {
              reject(err);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', (response: { error: { description: string } }) => {
          reject(new Error(response.error?.description ?? 'Payment failed. Please try again.'));
        });

        rzp.open();
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(237,233,254,0.95) 100%)',
          border: '1px solid rgba(167,139,250,0.3)',
          backdropFilter: 'blur(24px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        {/* Top gradient band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/60 text-slate-500 hover:text-slate-700 transition-colors z-20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-300/50 mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 id="paywall-title" className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Unlock <span className="text-violet-600">Pro</span> Access
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              You&apos;ve reached the daily limit for{' '}
              <span className="font-bold text-violet-600">{FEATURE_LABELS[feature]}</span>.
              Upgrade to continue without limits.
            </p>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Free Plan */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-800">Free</h3>
                <span className="text-2xl font-black text-slate-700">₹0</span>
              </div>
              <ul className="space-y-2">
                {FREE_FEATURES.map((feat, i) => (
                  <li key={i} className="text-sm text-slate-600 font-medium">{feat}</li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
                border: '2px solid rgba(167,139,250,0.6)',
              }}
            >
              {/* Popular badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Popular
              </div>

              <div className="flex items-end gap-1 mb-4">
                <h3 className="text-lg font-black text-white">Pro</h3>
              </div>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-black text-white">₹499</span>
                <span className="text-white/60 text-sm mb-1">/month</span>
              </div>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white font-medium">
                    <CheckCircle2 className="h-4 w-4 text-green-300 shrink-0" />
                    {feat.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          {success ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-lg">
                <CheckCircle2 className="h-6 w-6" />
                You&apos;re now on Pro!
              </div>
              <p className="text-slate-500 text-sm">Enjoy unlimited access to all features.</p>
            </div>
          ) : (
            <>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full h-14 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 shadow-xl shadow-violet-300/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? '#a78bfa'
                    : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                    Upgrade to Pro
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {error && (
                <p className="text-center text-red-500 text-sm font-medium mt-3">{error}</p>
              )}

              <p className="text-center text-slate-400 text-xs mt-3">
                Secure payment · Cancel anytime · Instant activation
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
