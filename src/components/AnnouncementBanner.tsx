import { useEffect, useRef, useState, type TouchEvent, type MouseEvent } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import type { Announcement, Role } from '../types';

const ROLE_MATCH: Record<Role, (a: Announcement) => boolean> = {
  admin: () => true,
  supervisor: (a) => a.audience === 'all' || a.audience === 'supervisors' || a.audience === 'teachers',
  teacher: (a) => a.audience === 'all' || a.audience === 'teachers',
  parent: (a) => a.audience === 'all' || a.audience === 'parents',
};

export function AnnouncementBanner({
  announcements,
  role,
}: {
  announcements: Announcement[];
  role: Role;
}) {
  const items = announcements.filter(ROLE_MATCH[role]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (idx >= items.length) setIdx(0);
  }, [items.length, idx]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timer.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, 4000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [paused, items.length]);

  const holdStart = () => setPaused(true);
  const holdEnd = () => setPaused(false);

  if (items.length === 0) return null;
  const current = items[Math.min(idx, items.length - 1)];

  const go = (dir: number) =>
    setIdx((i) => (i + dir + items.length) % items.length);

  return (
    <div
      dir="rtl"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-700 via-brand-600 to-teal-600 text-white shadow-lg shadow-brand-600/20"
      onMouseDown={holdStart}
      onMouseUp={holdEnd}
      onMouseLeave={holdEnd}
      onTouchStart={holdStart}
      onTouchEnd={holdEnd}
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          {paused ? <Pause size={20} /> : <Megaphone size={20} />}
        </div>
        <div className="min-w-0 flex-1">
          <div
            key={current.id}
            className="animate-slide-in"
          >
            <p className="truncate text-sm font-bold sm:text-base">{current.title}</p>
            <p className="truncate text-xs text-white/80 sm:text-sm">{current.body}</p>
          </div>
        </div>
        {items.length > 1 && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={(e: MouseEvent) => { e.stopPropagation(); go(1); }}
              className="rounded-lg p-1.5 transition hover:bg-white/15"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={(e: MouseEvent) => { e.stopPropagation(); go(-1); }}
              className="rounded-lg p-1.5 transition hover:bg-white/15"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-2.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx % items.length ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
