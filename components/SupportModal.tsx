'use client';
import type { Messages, Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
  messages: Messages;
  onClose: () => void;
}

export default function SupportModal({ locale, messages: m, onClose }: Props) {
  async function handleSupport(tier: 'bronze' | 'silver' | 'gold') {
    const amounts = { bronze: 3000, silver: 5000, gold: 10000 };
    const amount = amounts[tier];

    // Toss Payments 위젯 초기화 (클라이언트 키 필요)
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      alert('결제 시스템 준비 중입니다.');
      return;
    }

    let tossModule: { loadTossPayments?: (key: string) => Promise<any> } = {};
    try {
      tossModule = await import('@tosspayments/tosspayments-sdk' as string) as any;
    } catch {}
    if (!tossModule.loadTossPayments) {
      alert('결제 모듈을 불러오는 데 실패했습니다.');
      return;
    }

    const tossPayments = await tossModule.loadTossPayments!(clientKey);
    const widgets = tossPayments.widgets({ customerKey: 'GUEST' });
    await widgets.requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: amount },
      orderId: `byeolchae-${tier}-${Date.now()}`,
      orderName: tier === 'bronze' ? m.support.bronze_label : tier === 'silver' ? m.support.silver_label : m.support.gold_label,
      successUrl: `${window.location.origin}/${locale}/me?support=success&tier=${tier}`,
      failUrl: `${window.location.origin}/${locale}/me?support=fail`,
    });
  }

  const tiers = [
    { key: 'bronze' as const, label: m.support.bronze_label, desc: m.support.bronze_desc },
    { key: 'silver' as const, label: m.support.silver_label, desc: m.support.silver_desc },
    { key: 'gold'   as const, label: m.support.gold_label,   desc: m.support.gold_desc },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark/40 backdrop-blur-sm" onClick={onClose}>
      <div className="byeolchae-card w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-bark text-center">{m.support.title}</h2>
        <p className="text-sm text-mocha text-center">{m.support.subtitle}</p>
        <div className="space-y-3">
          {tiers.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => handleSupport(key)}
              className="w-full byeolchae-btn-ghost text-left space-y-0.5"
            >
              <div className="font-semibold text-bark">{label}</div>
              <div className="text-xs text-mocha">{desc}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full text-xs text-mocha/60 hover:text-mocha py-1">{m.common.cancel}</button>
      </div>
    </div>
  );
}
