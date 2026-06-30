"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileUser,
  Check,
  Zap,
  Crown,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { useSubscription } from '@/lib/use-subscription';

const FREE_FEATURES = [
  'Resume Builder',
  'Resume Import',
  'Resume Download',
  '3 ATS Checks per day',
  '3 Tailor to Job per day',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited ATS Checks',
  'Unlimited Tailor to Job',
  'Unlimited Resume Versions',
  'Premium AI Improvements',
  'Future Premium Features',
  'Priority Support',
];

function PricingCard({
  plan,
  price,
  period,
  features,
  isPro: isProPlan,
  current,
  onUpgrade,
  loading,
  success,
}: {
  plan: string;
  price: string;
  period: string;
  features: string[];
  isPro: boolean;
  current: boolean;
  onUpgrade?: () => void;
  loading?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
        isProPlan
          ? 'shadow-xl shadow-violet-300/30 scale-[1.01] md:scale-[1.03]'
          : 'shadow-md border border-slate-200 bg-white'
      }`}
      style={
        isProPlan
          ? {
              background: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 100%)',
              border: '2px solid rgba(139,92,246,0.4)',
            }
          : {}
      }
    >
      {isProPlan && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" />
          Most Popular
        </div>
      )}

      {/* Plan name & price */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {isProPlan ? (
            <Crown className="h-5 w-5 text-violet-600" />
          ) : (
            <FileUser className="h-5 w-5 text-slate-500" />
          )}
          <h3
            className={`text-base font-black uppercase tracking-wide ${
              isProPlan ? 'text-violet-700' : 'text-slate-700'
            }`}
          >
            {plan}
          </h3>
        </div>

        <div className="flex items-end gap-1">
          <span
            className={`text-4xl font-black ${isProPlan ? 'text-violet-700' : 'text-slate-800'}`}
          >
            {price}
          </span>
          {period && (
            <span className="text-slate-500 text-xs mb-1.5 font-medium">/{period}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2 flex-1 mb-6">
        {features.map((feat, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check
              className={`h-4 w-4 shrink-0 mt-0.5 ${
                isProPlan ? 'text-violet-600' : 'text-emerald-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isProPlan ? 'text-violet-900' : 'text-slate-700'
              }`}
            >
              {feat}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {current ? (
        <div
          className={`w-full h-10 rounded-xl flex items-center justify-center gap-2 font-bold text-xs ${
            isProPlan
              ? 'bg-violet-100 text-violet-700 border border-violet-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Current Plan
        </div>
      ) : isProPlan ? (
        success ? (
          <div className="w-full h-10 rounded-xl flex items-center justify-center gap-2 font-bold text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Upgraded to Pro!
          </div>
        ) : (
          <button
            onClick={onUpgrade}
            disabled={loading}
            className="w-full h-10 rounded-xl font-black text-white text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-300/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{
              background: loading
                ? '#a78bfa'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                Upgrade Now
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )
      ) : (
        <Link href="/builder">
          <button className="w-full h-10 rounded-xl font-bold text-slate-700 text-xs flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
            Start Building
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      )}
    </div>
  );
}

export default function PricingPage() {
  // ── Fix: destructure `user` so prefill works in Razorpay Checkout ──────────
  const { isSignedIn, isLoaded, user } = useUser();
  const { plan: currentPlan, isLoading: subLoading, refresh } = useSubscription();
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
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setUpgradeError(message);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const isFreePlan = !currentPlan || currentPlan === 'free';
  const isProPlan = currentPlan === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20 font-body">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <FileUser className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">FreshStart</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/pricing" className="text-violet-600 font-black">Pricing</Link>
            <Link href="/builder" className="hover:text-primary transition-colors">Builder</Link>
          </div>

          <div className="flex items-center gap-3">
            {!isLoaded ? null : !isSignedIn ? (
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-bold text-sm">Login</Button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
            <Button asChild className="rounded-full px-5 text-sm bg-primary hover:bg-primary/90 text-white font-bold">
              <Link href="/builder">Build Resume</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero — ~30% less padding, smaller type */}
      <section className="pt-10 pb-8 text-center px-6">
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black mb-4 border border-violet-200 uppercase tracking-widest">
          <Crown className="h-2.5 w-2.5 mr-1.5" />
          Simple, Transparent Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3 uppercase leading-none">
          Invest in Your{' '}
          <span className="text-violet-600">Career</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto font-medium">
          Start free. Upgrade when you need unlimited power to land your dream job.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-14 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PricingCard
              plan="Free"
              price="₹0"
              period=""
              features={FREE_FEATURES}
              isPro={false}
              current={isFreePlan && !subLoading}
              onUpgrade={undefined}
            />
            <PricingCard
              plan="Pro"
              price="₹499"
              period="month"
              features={PRO_FEATURES}
              isPro={true}
              current={isProPlan && !subLoading}
              onUpgrade={isSignedIn ? handleUpgrade : undefined}
              loading={upgradeLoading}
              success={upgradeSuccess}
            />
          </div>

          {!isSignedIn && isLoaded && (
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm font-medium mb-2">
                Sign in to upgrade to Pro
              </p>
              <SignInButton mode="modal">
                <Button className="rounded-full px-6 text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold">
                  Sign In to Upgrade
                </Button>
              </SignInButton>
            </div>
          )}

          {upgradeError && (
            <p className="mt-3 text-center text-red-500 text-sm font-medium">{upgradeError}</p>
          )}
        </div>
      </section>

      {/* Why Go Pro */}
      <section className="py-10 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase">Why Go Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Zap className="h-6 w-6 text-violet-600" />,
                title: 'Unlimited AI Power',
                desc: 'Run as many ATS checks and job tailoring sessions as you need — no daily cap.',
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
                title: 'Version History',
                desc: 'Save unlimited resume versions and switch between them for different applications.',
              },
              {
                icon: <Crown className="h-6 w-6 text-yellow-500" />,
                title: 'Future Features',
                desc: 'Every new premium feature we build is automatically unlocked for Pro members.',
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-black text-slate-800 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-10 text-center px-6">
        <h2 className="text-2xl font-black text-slate-900 mb-3">Ready to land your dream job?</h2>
        <p className="text-slate-500 text-sm mb-6 font-medium">Join thousands of graduates who&apos;ve already levelled up their resumes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
            <Link href="/builder">Start Building Free</Link>
          </Button>
          {isSignedIn && isFreePlan && !subLoading && (
            <Button
              variant="outline"
              className="rounded-full px-8 border-violet-300 text-violet-700 font-bold hover:bg-violet-50"
              onClick={handleUpgrade}
              disabled={upgradeLoading}
            >
              {upgradeLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing…</>
              ) : (
                <>Upgrade to Pro</>
              )}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
