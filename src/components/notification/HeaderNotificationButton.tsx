'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { notifications } from './NotificationPages';

export function HeaderNotificationButton({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const muted = dark ? 'text-[#9ca3af]' : 'text-slate-500';

  return (
    <div className="relative">
      <button
        aria-label="Thông báo"
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-100'}`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bell size={17} strokeWidth={1.5} />
        {unreadCount ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className={`absolute right-0 top-[38px] z-[100] w-[360px] rounded-xl border p-2 shadow-md ${dark ? 'border-[#263244] bg-[#111827]' : 'border-slate-200/60 bg-white'}`}>
          <div className={`flex items-center justify-between border-b px-2 pb-2 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            <div>
              <p className="text-sm font-semibold">Thông báo</p>
              <p className={`mt-0.5 text-[10px] ${muted}`}>{unreadCount} chưa đọc</p>
            </div>
            <Link className="text-xs font-medium text-emerald-700" href="/notifications/" onClick={() => setOpen(false)}>
              Xem tất cả
            </Link>
          </div>
          <div className="mt-2 grid max-h-[370px] gap-1 overflow-auto">
            {notifications.slice(0, 10).map((item) => (
              <Link
                className={`rounded-lg px-2 py-2 transition-all duration-150 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'} ${item.read ? '' : dark ? 'bg-[#123421]' : 'bg-emerald-50'}`}
                href={`/notifications/${item.id}/`}
                key={item.id}
                onClick={() => setOpen(false)}
              >
                <div className="flex items-start gap-2">
                  {!item.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" /> : <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" />}
                  <div className="min-w-0">
                    <p className={`truncate text-xs ${item.read ? 'font-medium' : 'font-semibold'}`}>{item.title}</p>
                    <p className={`mt-1 line-clamp-2 text-[11px] leading-4 ${muted}`}>{item.body}</p>
                    <p className={`mt-1 text-[10px] ${muted}`}>{item.time}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className={`mt-2 border-t pt-2 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            <button className="h-8 w-full rounded-lg border border-emerald-600 text-xs font-medium text-emerald-700 transition-all duration-150 hover:bg-emerald-50" type="button">
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
