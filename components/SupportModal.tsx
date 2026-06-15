'use client';
import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import type { Messages, Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
  messages: Messages;
  onClose: () => void;
}

type Tier = 'bronze' | 'silver' | 'gold';

const TIER_CONFIG = {
  bronze: { amount: 3000,  label: 'bronze_label', desc: 'bronze_desc' },
  silver: { amount: 5000,  label: 'silver_label', desc: 'silver_desc' },
  gold:   { amount: 10000, label: 'gold_label',   desc: 'gold_desc'   },
} as const satisfies Record<Tier, { amount: number; label: keyof Messages['support']; desc: keyof Messages['support'] }>;

const TIER_KEYS: Tier[] = ['bronze', 'silver', 'gold'];

export default function SupportModal({ locale, messages: m, onClose }: Props) {
  const [selected, setSelected] = useState<Tier | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function handlePay() {
    if (!selected) return;
    setStatus('loading');

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      setStatus('error');
      return;
    }

    try {
      const toss = await loadTossPayments(clientKey);
      const { amount, label } = TIER_CONFIG[selected];
      const orderId = `byeolchae-${selected}-${Date.now()}`;
      const payment = toss.payment({ customerKey: orderId });
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId,
        orderName: m.support[label],
        successUrl: `${window.location.origin}/api/support/success?orderId=${orderId}&tier=${selected}`,
        failUrl: `${window.location.origin}/${locale}/me`,
      });
    } catch {
      setStatus('error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="byeolchae-card w-full max-w-sm space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-bark text-center">☕ {m.support.title}</h2>
        <p className="text-sm text-mocha text-center">{m.support.subtitle}</p>

        <div className="space-y-2">
          {TIER_KEYS.map((key) => {
            const { label, desc } = TIER_CONFIG[key];
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  selected === key
                    ? 'border-bark bg-parchment'
                    : 'border-sand bg-white hover:border-bark/40'
                }`}
              >
                <div className="font-semibold text-bark text-sm">{m.support[label]}</div>
                <div className="text-xs text-mocha mt-0.5">{m.support[desc]}</div>
              </button>
            );
          })}
        </div>

        {status === 'error' && (
          <p className="text-xs text-red-500 text-center">결제 준비 중입니다. 잠시 후 다시 시도해주세요.</p>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="byeolchae-btn-ghost flex-1 text-sm py-2">
            {m.common.cancel}
          </button>
          <button
            onClick={handlePay}
            disabled={!selected || status === 'loading'}
            className="byeolchae-btn-primary flex-1 text-sm py-2 disabled:opacity-50"
          >
            {status === 'loading' ? m.common.loading : m.support.pay_button}
          </button>
        </div>
      </div>
    </div>
  );
}
