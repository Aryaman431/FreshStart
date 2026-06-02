"use client";

import { supabase } from '@/lib/supabase';

export type AnalyticsEvent =
  | 'resume_import'
  | 'pdf_download'
  | 'ats_check'
  | 'version_restore'
  | 'version_create'
  | 'resume_tailor'
  | 'cover_letter'
  | 'bullet_improve'
  | 'interview_prep';

interface TrackOptions {
  userId: string;
  email?: string;
  event: AnalyticsEvent;
  metadata?: Record<string, unknown>;
}

export async function trackEvent({ userId, email, event, metadata }: TrackOptions) {
  try {
    await supabase.from('analytics').insert({
      user_id: userId,
      email: email ?? null,
      event,
      metadata: metadata ?? {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // Analytics failures are non-fatal
  }
}
