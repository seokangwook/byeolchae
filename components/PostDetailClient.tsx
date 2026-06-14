'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Messages, Locale } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';
import Header from './Header';
import Footer from './Footer';
import AdSlot from './AdSlot';

interface Props {
  locale: Locale;
  messages: Messages;
  post: any;
  comments: any[];
  viewer: User | null;
  nickname: string;
}

export default function PostDetailClient({ locale, messages: m, post, comments: initial, viewer, nickname }: Props) {
  const [comments, setComments] = useState(initial);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = viewer?.id === post.author_user;

  async function submitComment() {
    if (!content.trim() || content.length > 500) return;
    setSubmitting(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id, content: content.trim() }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setComments([...comments, { ...data, profiles: { nickname: '나' } }]);
      setContent('');
    }
    setSubmitting(false);
  }

  async function deleteComment(id: string) {
    const res = await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setComments(comments.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header locale={locale} messages={m} user={viewer} nickname={isOwner ? nickname : undefined} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <div>
          <Link href={`/${locale}/${nickname}`} className="text-xs text-mocha hover:text-bark mb-3 inline-block">
            ← {nickname}의 별채
          </Link>
          <article className="byeolchae-card space-y-4">
            <h1 className="text-2xl font-bold text-bark">{post.title}</h1>
            <div className="flex items-center gap-2 text-xs text-mocha/60">
              <span>{post.profiles?.nickname ?? nickname}</span>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleDateString(locale)}</span>
              <span>·</span>
              <span>{m.post.view_count.replace('{count}', String(post.view_count ?? 0))}</span>
            </div>
            <div className="border-t border-sand pt-4">
              <p className="text-bark leading-relaxed whitespace-pre-wrap">{post.body}</p>
            </div>
            {post.image_urls?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.image_urls.map((url: string, i: number) => (
                  <img key={i} src={url} alt="" className="max-w-full rounded-xl border border-sand" />
                ))}
              </div>
            )}
          </article>
        </div>

        {/* 댓글 섹션 */}
        <section className="byeolchae-card space-y-4">
          <h2 className="font-bold text-bark">{m.post.comment_title} ({comments.length})</h2>
          {viewer ? (
            <div className="space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={m.post.comment_placeholder}
                maxLength={500}
                rows={3}
                className="byeolchae-input resize-none"
              />
              <div className="flex justify-end">
                <button onClick={submitComment} disabled={submitting || !content.trim()} className="byeolchae-btn-primary text-sm px-4 py-1.5">
                  {submitting ? m.common.loading : m.post.comment_submit}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-mocha/60">댓글을 달려면 로그인이 필요합니다.</p>
          )}
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="border-t border-sand/60 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-mocha">{c.profiles?.nickname ?? '익명'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-mocha/40">{new Date(c.created_at).toLocaleDateString(locale)}</span>
                    {viewer?.id === c.author_user && (
                      <button onClick={() => deleteComment(c.id)} className="text-[10px] text-red-400 hover:text-red-600">{m.common.delete}</button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-bark">{c.content}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 알림 페이지 하단 광고 */}
        <AdSlot slot="2345678901" format="horizontal" />
      </main>
      <Footer locale={locale} messages={m} />
    </div>
  );
}
