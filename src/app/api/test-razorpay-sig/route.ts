/**
 * GET /api/test-razorpay-sig
 * Diagnostic endpoint — remove after verifying signature flow works.
 *
 * Call this after a real payment fails. Copy the order_id and payment_id
 * from the Razorpay Checkout response and pass them as query params:
 *   /api/test-razorpay-sig?order_id=order_XXX&payment_id=pay_XXX&signature=SIG
 *
 * It logs what our server would generate and whether it matches the
 * signature Razorpay sent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const order_id   = searchParams.get('order_id')   ?? '';
  const payment_id = searchParams.get('payment_id') ?? '';
  const signature  = searchParams.get('signature')  ?? '';

  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
  const keyId     = process.env.RAZORPAY_KEY_ID     ?? '';
  const env       = keyId.startsWith('rzp_live_') ? 'LIVE' : 'TEST';

  const payload  = `${order_id}|${payment_id}`;
  const expected = keySecret
    ? crypto.createHmac('sha256', keySecret).update(payload).digest('hex')
    : 'SECRET_MISSING';

  const match = signature ? expected === signature : null;

  return NextResponse.json({
    environment:        env,
    key_id_prefix:      keyId.slice(0, 14),
    secret_length:      keySecret.length,
    payload:            payload,
    expected_signature: expected,
    received_signature: signature || '(not provided)',
    signatures_match:   match,
    instruction:
      match === false
        ? 'MISMATCH: Go to Razorpay Dashboard → Settings → API Keys, regenerate your key pair, and update RAZORPAY_KEY_ID, NEXT_PUBLIC_RAZORPAY_KEY_ID, and RAZORPAY_KEY_SECRET in .env.local'
        : match === true
        ? 'MATCH: Signature is valid — the key pair is correct'
        : 'Pass ?signature=... to compare',
  });
}
