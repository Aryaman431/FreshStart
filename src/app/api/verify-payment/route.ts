import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { upgradeSubscriptionToPro } from '@/lib/subscription';

// Use the SDK's own validatePaymentVerification — canonical, battle-tested,
// same HMAC formula as our manual implementation but avoids any subtle bugs.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils') as {
  validatePaymentVerification: (
    params: { order_id: string; payment_id: string },
    signature: string,
    secret: string,
  ) => boolean;
};

export async function POST(req: NextRequest) {
  // ── Step 1: Env guard ───────────────────────────────────────────────────────
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const keyId     = process.env.RAZORPAY_KEY_ID;

  const env = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'LIVE' : 'TEST';

  console.log('[verify-payment] ── START ──────────────────────────────────');
  console.log('[verify-payment] Environment    :', env);
  console.log('[verify-payment] Key ID prefix  :', keyId?.slice(0, 14) ?? 'MISSING');
  console.log('[verify-payment] Secret set     :', keySecret ? `yes (len=${keySecret.length})` : 'NO — MISSING');

  if (!keySecret) {
    console.error('[verify-payment] RAZORPAY_KEY_SECRET is not configured');
    return NextResponse.json(
      { success: false, error: 'Server configuration error: payment secret not set' },
      { status: 500 },
    );
  }

  // ── Step 2: Clerk auth ──────────────────────────────────────────────────────
  let userId: string | null = null;
  try {
    ({ userId } = await auth());
  } catch (authErr) {
    console.error('[verify-payment] auth() threw:', authErr);
    return NextResponse.json({ success: false, error: 'Authentication error' }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  console.log('[verify-payment] User ID        :', userId);

  // ── Step 3: Parse body ──────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  // Log the full incoming body (no secrets here — all fields come from Razorpay checkout)
  console.log('[verify-payment] Raw body       :', JSON.stringify(body));

  const razorpay_payment_id = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id.trim() : '';
  const razorpay_order_id   = typeof body.razorpay_order_id   === 'string' ? body.razorpay_order_id.trim()   : '';
  const razorpay_signature  = typeof body.razorpay_signature  === 'string' ? body.razorpay_signature.trim()  : '';

  console.log('[verify-payment] Payment ID     :', razorpay_payment_id  || 'MISSING');
  console.log('[verify-payment] Order ID       :', razorpay_order_id    || 'MISSING');
  console.log('[verify-payment] Signature rcvd :', razorpay_signature   || 'MISSING', `(len=${razorpay_signature.length})`);

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing payment fields',
        missing: {
          razorpay_payment_id: !razorpay_payment_id,
          razorpay_order_id:   !razorpay_order_id,
          razorpay_signature:  !razorpay_signature,
        },
      },
      { status: 400 },
    );
  }

  // ── Step 4: Verify signature ────────────────────────────────────────────────
  // Razorpay signs: HMAC_SHA256(order_id + "|" + payment_id, key_secret)
  // We use the SDK's own validatePaymentVerification which implements this spec.
  const hmacPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
  console.log('[verify-payment] HMAC payload   :', hmacPayload);

  let isValid = false;
  let expectedSignature = '';
  try {
    // Also compute manually so we can log and compare both
    const crypto = require('crypto') as typeof import('crypto');
    expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(hmacPayload)
      .digest('hex');

    console.log('[verify-payment] Expected sig   :', expectedSignature);
    console.log('[verify-payment] Received sig   :', razorpay_signature);
    console.log('[verify-payment] Signatures match:', expectedSignature === razorpay_signature);

    // Use SDK utility as canonical verification
    isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      keySecret,
    );
  } catch (verifyErr) {
    const msg = verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
    console.error('[verify-payment] Verification threw:', msg);
    return NextResponse.json(
      { success: false, error: `Signature verification error: ${msg}` },
      { status: 500 },
    );
  }

  console.log('[verify-payment] Verification   :', isValid ? '✓ VALID' : '✗ INVALID');

  if (!isValid) {
    console.error(
      '[verify-payment] SIGNATURE MISMATCH\n' +
      '  Expected : ' + expectedSignature + '\n' +
      '  Received : ' + razorpay_signature + '\n' +
      '  Order ID : ' + razorpay_order_id  + '\n' +
      '  Pay ID   : ' + razorpay_payment_id + '\n' +
      '  Env      : ' + env + '\n' +
      '  KEY TIP  : Regenerate your Razorpay key pair and update .env.local if these differ.',
    );
    return NextResponse.json(
      {
        success: false,
        error:
          `Payment verification failed: signature mismatch (${env} mode). ` +
          'Ensure RAZORPAY_KEY_SECRET in your environment matches the key shown in your Razorpay Dashboard → Settings → API Keys.',
      },
      { status: 400 },
    );
  }

  // ── Step 5: Upgrade subscription ───────────────────────────────────────────
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? null;

    console.log('[verify-payment] Upgrading user :', userId);
    const subscription = await upgradeSubscriptionToPro(userId, email);
    console.log('[verify-payment] Upgraded ✓     :', subscription.plan, subscription.status);

    return NextResponse.json({
      success: true,
      plan: subscription.plan,
      status: subscription.status,
    });
  } catch (upgradeErr) {
    const msg = upgradeErr instanceof Error ? upgradeErr.message : String(upgradeErr);
    console.error('[verify-payment] Upgrade failed :', msg);
    return NextResponse.json(
      { success: false, error: `Subscription upgrade failed: ${msg}` },
      { status: 500 },
    );
  }
}
