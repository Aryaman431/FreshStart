/**
 * FreshStart Subscription Helpers
 *
 * All writes and reads use supabaseAdmin (service role) by default so they
 * are always authoritative and bypass RLS.
 *
 * Individual route handlers that want operations to run *under* RLS (so
 * Supabase policies can validate the Clerk identity) can pass in a
 * Clerk-authenticated client obtained from createClerkSupabaseClient().
 *
 * Security model:
 *  - supabaseAdmin  → service role, bypasses RLS, trusted server-side only
 *  - Clerk JWT client → anon key + Clerk JWT, RLS enforced per user
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-admin';

// ── Constants ─────────────────────────────────────────────────────────────────

export const FREE_LIMITS = {
  atsChecks: 3,
  tailorUses: 3,
} as const;

export type Plan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  user_id: string;
  email: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface UsageResult {
  allowed: boolean;
  used: number;
  limit: number | null; // null = unlimited (pro)
  remaining: number | null; // null = unlimited
}

// ── Internal helper: resolve client ──────────────────────────────────────────

/**
 * Returns the provided client, or falls back to the service-role admin client.
 * Passing a Clerk-JWT client makes operations subject to RLS policies.
 */
function db(client?: SupabaseClient): SupabaseClient {
  return client ?? supabaseAdmin;
}

// ── Subscription helpers ──────────────────────────────────────────────────────

/**
 * Get or auto-create a subscription record for a user.
 * Creates a free plan if one doesn't exist (called on first sign-in).
 *
 * @param userId  Clerk user ID
 * @param email   User email (stored on first creation only)
 * @param client  Optional Clerk-authenticated Supabase client.
 *                If omitted, the service-role admin client is used.
 */
export async function getOrCreateSubscription(
  userId: string,
  email?: string | null,
  client?: SupabaseClient,
): Promise<Subscription> {
  const supabase = db(client);

  // Try to fetch existing
  const { data: existing, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing && !fetchError) {
    return existing as Subscription;
  }

  // Not found — create free plan
  const { data: created, error: createError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      email: email ?? null,
      plan: 'free',
      status: 'active',
    })
    .select()
    .single();

  if (createError || !created) {
    throw new Error(`Failed to create subscription: ${createError?.message}`);
  }

  return created as Subscription;
}

/**
 * Returns true if the user is on an active Pro plan.
 * This is the single source of truth — always call server-side.
 *
 * @param client  Optional Clerk-authenticated Supabase client.
 */
export async function isPro(
  userId: string,
  client?: SupabaseClient,
): Promise<boolean> {
  const { data, error } = await db(client)
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single();

  if (error || !data) return false;
  return data.plan === 'pro' && data.status === 'active';
}

/**
 * Upgrade a user's subscription to Pro.
 * Always uses the admin client — payment verification is trusted server-side.
 */
export async function upgradeSubscriptionToPro(
  userId: string,
  email?: string | null,
): Promise<Subscription> {
  // Always use service role for payment upgrades — must not be gateable by RLS
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        email: email ?? null,
        plan: 'pro',
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to upgrade subscription: ${error?.message}`);
  }

  return data as Subscription;
}

// ── Daily usage helpers ───────────────────────────────────────────────────────

function todayDate(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get today's usage record, creating it if it doesn't exist.
 */
async function getOrCreateUsage(userId: string, client?: SupabaseClient) {
  const supabase = db(client);
  const date = todayDate();

  const { data: existing } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from('daily_usage')
    .insert({ user_id: userId, date, ats_checks: 0, tailor_uses: 0 })
    .select()
    .single();

  if (error || !created) {
    // Concurrent insert race — fetch again
    const { data: retry } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    return retry;
  }

  return created;
}

/**
 * Check if user can use ATS Check.
 * Pro users: unlimited. Free users: 3/day, auto-resets each new day.
 *
 * @param client  Optional Clerk-authenticated Supabase client.
 */
export async function canUseATS(
  userId: string,
  client?: SupabaseClient,
): Promise<UsageResult> {
  const pro = await isPro(userId, client);

  if (pro) {
    return { allowed: true, used: 0, limit: null, remaining: null };
  }

  const usage = await getOrCreateUsage(userId, client);
  const used = usage?.ats_checks ?? 0;
  const limit = FREE_LIMITS.atsChecks;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
  };
}

/**
 * Increment ATS check usage for today.
 * Uses the admin client because RPC must always succeed regardless of RLS.
 */
export async function incrementATSUsage(userId: string): Promise<void> {
  const date = todayDate();
  await supabaseAdmin.rpc('increment_ats_checks', { p_user_id: userId, p_date: date });
}

/**
 * Check if user can use Tailor to Job.
 *
 * @param client  Optional Clerk-authenticated Supabase client.
 */
export async function canTailorResume(
  userId: string,
  client?: SupabaseClient,
): Promise<UsageResult> {
  const pro = await isPro(userId, client);

  if (pro) {
    return { allowed: true, used: 0, limit: null, remaining: null };
  }

  const usage = await getOrCreateUsage(userId, client);
  const used = usage?.tailor_uses ?? 0;
  const limit = FREE_LIMITS.tailorUses;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
  };
}

/**
 * Increment tailor usage for today.
 * Uses the admin client because RPC must always succeed regardless of RLS.
 */
export async function incrementTailorUsage(userId: string): Promise<void> {
  const date = todayDate();
  await supabaseAdmin.rpc('increment_tailor_uses', { p_user_id: userId, p_date: date });
}

/**
 * Manual increment fallback (used by usage route handlers).
 * Always uses the admin client — atomicity over RLS here.
 */
export async function incrementUsageManual(
  userId: string,
  field: 'ats_checks' | 'tailor_uses',
): Promise<void> {
  const date = todayDate();
  const usage = await getOrCreateUsage(userId);
  if (!usage) return;

  const current = usage[field] ?? 0;

  await supabaseAdmin
    .from('daily_usage')
    .update({ [field]: current + 1 })
    .eq('user_id', userId)
    .eq('date', date);
}
