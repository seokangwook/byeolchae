'use client';
import { useEffect, useRef } from 'react';

interface Props {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
}

// 영구 룰: NEXT_PUBLIC_ADS_ENABLED=false 이면 렌더 X
export default function AdSlot({ slot, format = 'auto', className = '' }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
  const adClient = process.env.NEXT_PUBLIC_ADS_CLIENT;

  useEffect(() => {
    if (!adsEnabled || !ref.current) return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {}
  }, [adsEnabled]);

  if (!adsEnabled) return null;

  return (
    <div className={`ad-slot overflow-hidden ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle block"
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
