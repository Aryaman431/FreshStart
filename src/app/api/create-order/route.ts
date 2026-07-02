import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// razorpay is a pure CJS package — its entry exports the constructor directly
// as module.exports (no .default). Using `require` avoids the ESM interop
// issue where `import Razorpay from 'razorpay'` resolves to undefined.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay') as typeof import('razorpay');

const AMOUNT_PAISE = 199; // ₹1.99 in paise — TEST PRICE (change back to 49900 for production)

export async function POST(_req: NextRequest) {
  // ── Step 1: Verify env vars exist ──────────────────────────────────────────
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const pubKeyId  = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  console.log('[create-order] env check:', {
    RAZORPAY_KEY_ID:             keyId     ? '✓ set' : '✗ MISSING',
    RAZORPAY_KEY_SECRET:         keySecret ? '✓ set' : '✗ MISSING',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: pubKeyId  ? '✓ set' : '✗ MISSING',
  });

  if (!keyId || !keySecret) {
    console.error('[create-order] Razorpay env vars missing');
    return NextResponse.json(
      { success: false, error: 'Payment configuration error: Razorpay keys not set on server' },
      { status: 500 },
    );
  }

  // ── Step 2: Verify Clerk auth ───────────────────────────────────────────────
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    console.log('[create-order] auth:', userId ? `✓ userId=${userId}` : '✗ not authenticated');
  } catch (authErr) {
    console.error('[create-order] auth() threw:', authErr);
    return NextResponse.json(
      { success: false, error: 'Authentication error' },
      { status: 401 },
    );
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ── Step 3: Initialize Razorpay ─────────────────────────────────────────────
  let razorpay: InstanceType<typeof Razorpay>;
  try {
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    console.log('[create-order] Razorpay client initialized ✓');
  } catch (initErr) {
    const msg = initErr instanceof Error ? initErr.message : String(initErr);
    console.error('[create-order] Razorpay init failed:', msg);
    return NextResponse.json(
      { success: false, error: `Razorpay initialization failed: ${msg}` },
      { status: 500 },
    );
  }

  // ── Step 4: Create order ────────────────────────────────────────────────────
  try {
    // Razorpay enforces a 40-character max on receipt.
    // Format: "FS_" + last 8 chars of userId + "_" + last 9 digits of timestamp = 21 chars max.
    let receipt = `FS_${userId.slice(-8)}_${Date.now().toString().slice(-9)}`;
    if (receipt.length > 40) receipt = receipt.slice(0, 40);
    console.log('[create-order] Creating order:', { amount: AMOUNT_PAISE, currency: 'INR', receipt, receiptLen: receipt.length });

    const order = await razorpay.orders.create({
      amount: AMOUNT_PAISE,
      currency: 'INR',
      receipt,
    });

    console.log('[create-order] Order created ✓:', { id: order.id, amount: order.amount, status: order.status });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: pubKeyId,
    });
  } catch (orderErr: unknown) {
    // Razorpay SDK throws an object (not an Error) with { statusCode, error }
    const razorpayError = orderErr as Record<string, unknown>;
    const detail =
      typeof razorpayError?.error === 'object'
        ? JSON.stringify(razorpayError.error)
        : razorpayError?.message ?? String(orderErr);

    console.error('[create-order] Razorpay order creation failed:', {
      statusCode: razorpayError?.statusCode,
      error: razorpayError?.error,
      stack: orderErr instanceof Error ? orderErr.stack : undefined,
    });

    return NextResponse.json(
      { success: false, error: `Order creation failed: ${detail}` },
      { status: 500 },
    );
  }
}
