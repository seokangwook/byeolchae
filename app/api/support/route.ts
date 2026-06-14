import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const TIERS = {
  bronze: { amount: 3000, adsMonths: 0 },
  silver: { amount: 5000, adsMonths: 3 },
  gold:   { amount: 10000, adsMonths: 12 },
} as const;

// POST /api/support — confirm Toss payment and record supporter
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paymentKey, orderId, amount, tier } = await req.json();
  if (!tier || !(tier in TIERS)) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });

  const tierConfig = TIERS[tier as keyof typeof TIERS];
  if (amount !== tierConfig.amount) return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });

  // Confirm with Toss Payments
  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!tossRes.ok) {
    const err = await tossRes.json();
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const adsDisabledUntil = tierConfig.adsMonths > 0
    ? new Date(now.getTime() + tierConfig.adsMonths * 30 * 24 * 3600 * 1000)
    : null;

  const { error } = await supabase.from('byeolchae_supporters').insert({
    user_id: user.id,
    tier,
    amount_krw: amount,
    toss_payment_key: paymentKey,
    expires_at: expiresAt.toISOString(),
    ads_disabled_until: adsDisabledUntil?.toISOString() ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, tier });
}
