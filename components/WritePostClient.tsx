'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Messages, Locale } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase';
import Header from './Header';
import Footer from './Footer';
import AdSlot from './AdSlot';

interface Props {
  locale: Locale;
  messages: Messages;
  user: User;
  nickname: string;
}

export default function WritePostClient({ locale, messages: m, user, nickname }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    setUploading(true);
    const supabase = getSupabaseBrowser();
    const ext = file.name.split('.').pop();
    const path = `posts/${user.id}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('byeolchae').upload(path, file, { upsert: true });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('byeolchae').getPublicUrl(path);
      setImages((prev) => [...prev, urlData.publicUrl]);
    }
    setUploading(false);
  }

  async function submit() {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), body: body.trim(), image_urls: images }),
    });

    if (res.ok) {
      // 작성 완료 후 인터스티셜 5초 광고 (영구 룰)
      setShowAd(true);
      setTimeout(() => {
        router.push(`/${locale}/${nickname}`);
      }, 5000);
    }
    setSubmitting(false);
  }

  if (showAd) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-6 p-8">
        <p className="text-bark font-semibold text-lg">✅ {m.common.success}</p>
        <AdSlot slot="1234567890" format="rectangle" className="w-full max-w-sm" />
        <p className="text-xs text-mocha/50">5초 후 내 별채로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} messages={m} user={user} nickname={nickname} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        <h1 className="text-2xl font-bold text-bark">{m.post.write_title}</h1>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={m.post.title_placeholder}
          maxLength={100}
          className="byeolchae-input text-lg font-medium"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={m.post.body_placeholder}
          maxLength={5000}
          rows={12}
          className="byeolchae-input resize-none"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="byeolchae-btn-ghost text-sm"
          >
            🖼️ {m.post.image_label}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
          />
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="w-16 h-16 object-cover rounded-xl border border-sand" />
              <button
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
              >×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => router.back()} className="byeolchae-btn-ghost">{m.common.cancel}</button>
          <button
            onClick={submit}
            disabled={submitting || !title.trim() || !body.trim()}
            className="byeolchae-btn-primary"
          >
            {submitting ? m.common.loading : m.post.submit}
          </button>
        </div>
      </main>
      <Footer locale={locale} messages={m} />
    </div>
  );
}
