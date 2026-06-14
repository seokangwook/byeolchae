'use client';
import { useState, useEffect } from 'react';
import type { Messages, Locale } from '@/lib/i18n';

interface Props { locale: Locale; messages: Messages }

export default function NotificationBell({ locale, messages: m }: Props) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const res = await fetch('/api/notifications');
    if (!res.ok) return;
    const { data } = await res.json();
    setItems(data ?? []);
    setCount((data ?? []).filter((n: any) => !n.is_read).length);
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function labelFor(n: any) {
    const name = n.ref_name ?? '누군가';
    switch (n.type) {
      case 'guestbook': return m.notification.guestbook.replace('{name}', name);
      case 'comment': return m.notification.comment.replace('{name}', name);
      case 'friend_request': return m.notification.friend_request.replace('{name}', name);
      case 'friend_accept': return m.notification.friend_accept.replace('{name}', name);
      default: return n.type;
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && count) markAllRead(); }}
        className="relative text-mocha hover:text-bark transition-colors text-lg leading-none"
        aria-label={m.notification.title}
      >
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-sand rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-sand px-3 py-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-bark">{m.notification.title}</span>
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-mocha/60 text-center py-6">{m.notification.empty}</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.id} className={`px-3 py-2 text-xs border-b border-sand/50 last:border-0 ${n.is_read ? 'text-mocha/50' : 'text-bark font-medium'}`}>
                  {labelFor(n)}
                  <span className="block text-mocha/40 text-[10px] mt-0.5">
                    {new Date(n.created_at).toLocaleDateString(locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
