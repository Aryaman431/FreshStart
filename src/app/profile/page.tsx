"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileUser,
  Crown,
  CheckCircle2,
  Zap,
  ArrowRight,
  Loader2,
  BarChart2,
  Briefcase,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import { useSubscription } from '@/lib/use-subscription';

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { plan, status, usage, isPro, isLoading: subLoading, refresh } = useSubscription();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  const handleUpgrade = async () => {
    if (!isSignedIn) return;
    setUpgradeLoading(true);
    setUpgradeError('');

    try {
      // Step 1: Create Razorpay order on the server
      const orderRes = await fetch('/api/create-order', { method: 'POST' });
      const order = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !order.success) {
        throw new Error(order.error ?? `Order creation failed (HTTP ${orderRes.status})`);
      }

      // Step 2: Open Razorpay Checkout — verify-payment is called ONLY from the handler
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
          theme: { color: '#7C3AED' },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled. You can try again anytime.')),
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              console.log('Razorpay response:', response);

              // Step 3: Send Razorpay fields — NOT orderId — to verify-payment
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_signature:  response.razorpay_signature,
                }),
              });

              const result = await verifyRes.json().catch(() => ({}));
              if (!verifyRes.ok || !result.success) {
                throw new Error(result.error ?? 'Payment verification failed');
              }

              await refresh();
              setUpgradeSuccess(true);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: { error: { description: string } }) => {
          reject(new Error(resp.error?.description ?? 'Payment failed. Please try again.'));
        });
        rzp.open();
      });
    } catch (err: unknown) {
      setUpgradeError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20 p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-violet-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Sign in to view your profile</h1>
          <p className="text-slate-500 text-sm">Access your subscription plan and usage details.</p>
          <SignInButton mode="modal">
            <Button className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const name = user?.fullName ?? user?.username ?? email.split('@')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20 font-body">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <FileUser className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">FreshStart</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-violet-500" />
              Pricing
            </Link>
            <Link href="/builder" className="hover:text-primary transition-colors">Builder</Link>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
            <Button asChild className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-bold">
              <Link href="/builder">Builder</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-3xl px-6 py-16 space-y-8">

        {/* Profile Header */}
        <div
          className="rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(237,233,254,0.95) 100%)',
            border: '1px solid rgba(167,139,250,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-violet-300/30 shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-slate-900">{name}</h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">{email}</p>
            <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
              {subLoading ? (
                <span className="text-xs text-slate-400 font-medium">Loading plan…</span>
              ) : isPro ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black shadow-md shadow-violet-300/30">
                  <Crown className="h-3.5 w-3.5" />
                  PRO PLAN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  FREE PLAN
                </span>
              )}
              {status === 'active' && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        {isSignedIn && !subLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ATS Usage */}
            <div className="rounded-2xl p-6 bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">ATS Checks</p>
                  <p className="text-[11px] text-slate-400 font-medium">Today&apos;s usage</p>
                </div>
              </div>
              {isPro ? (
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-bold text-slate-700">Unlimited</span>
                </div>
              ) : usage.ats ? (
                <>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-slate-900">{usage.ats.used}</span>
                    <span className="text-slate-400 text-sm font-medium">/ {usage.ats.limit} today</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                      style={{ width: `${Math.min(100, ((usage.ats.used) / (usage.ats.limit ?? 3)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {usage.ats.remaining} remaining · resets at midnight
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">No usage data yet</p>
              )}
            </div>

            {/* Tailor Usage */}
            <div className="rounded-2xl p-6 bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Tailor to Job</p>
                  <p className="text-[11px] text-slate-400 font-medium">Today&apos;s usage</p>
                </div>
              </div>
              {isPro ? (
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-bold text-slate-700">Unlimited</span>
                </div>
              ) : usage.tailor ? (
                <>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-slate-900">{usage.tailor.used}</span>
                    <span className="text-slate-400 text-sm font-medium">/ {usage.tailor.limit} today</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                      style={{ width: `${Math.min(100, ((usage.tailor.used) / (usage.tailor.limit ?? 3)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {usage.tailor.remaining} remaining · resets at midnight
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">No usage data yet</p>
              )}
            </div>
          </div>
        )}

        {/* Upgrade CTA — only shown for free users */}
        {!isPro && !subLoading && (
          <div
            className="rounded-3xl p-8 space-y-5"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #4c1d95 100%)',
              border: '1px solid rgba(167,139,250,0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Crown className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Upgrade to Pro</h2>
                <p className="text-violet-200 text-sm font-medium">Unlimited ATS checks, tailoring, and more</p>
              </div>
            </div>
            <ul className="space-y-2">
              {['Unlimited ATS Checks', 'Unlimited Tailor to Job', 'Unlimited Resume Versions', 'Premium AI Improvements'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-violet-100 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {upgradeSuccess ? (
              <div className="flex items-center gap-2 text-white font-black text-base">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                You&apos;re now on Pro!
              </div>
            ) : (
              <>
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="w-full h-12 rounded-2xl font-black text-violet-700 bg-white text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  {upgradeLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
                  ) : (
                    <><Zap className="h-4 w-4 text-yellow-500" />Upgrade to Pro — ₹1.99/mo<ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
                {upgradeError && (
                  <p className="text-red-300 text-xs font-medium text-center">{upgradeError}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Pro confirmation card */}
        {isPro && !subLoading && (
          <div
            className="rounded-3xl p-8 flex items-center gap-5"
            style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              border: '2px solid rgba(139,92,246,0.3)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-300/30 shrink-0">
              <Crown className="h-7 w-7 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-violet-900">You&apos;re on Pro</h2>
              <p className="text-violet-600 text-sm font-medium mt-0.5">
                All premium features are unlocked. Enjoy unlimited AI power.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            <Link href="/builder">Open Resume Builder</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-xl border-violet-200 text-violet-700 font-bold hover:bg-violet-50">
            <Link href="/pricing">View Pricing</Link>
          </Button>
          <SignOutButton>
            <Button variant="ghost" className="flex-1 rounded-xl text-slate-500 font-bold hover:text-red-500 hover:bg-red-50 flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
