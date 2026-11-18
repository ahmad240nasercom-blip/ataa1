import { useState } from 'react';
import { LayoutDashboard, Plus, BookOpen, Users, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { DashboardShell, PageHeader, type NavItem } from './DashboardShell';
import { AnnouncementBanner } from './AnnouncementBanner';
import { CircleView } from './CircleView';
import { Modal, EmptyState } from './ui';
import type { TeacherTab } from '../types';

const NAV: NavItem[] = [
  { key: 'circles', label: 'حلقاتي', icon: <LayoutDashboard size={20} /> },
];

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function TeacherDashboard() {
  const store = useStore();
  const [tab, setTab] = useState<TeacherTab>('circles');
  const [openCircleId, setOpenCircleId] = useState<string | null>(null);
  const { currentUser, state, logout, addCircle } = store;

  const myCircles = state.circles.filter((c) => c.teacherId === currentUser?.id);
  const openCircle = openCircleId ? state.circles.find((c) => c.id === openCircleId) : null;

  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState('');
  const [days, setDays] = useState<number[]>([]);

  const toggleDay = (d: number) => setDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));

  const create = () => {
    if (!name) return;
    addCircle(name, days);
    setName(''); setDays([]); setNewOpen(false);
  };

  return (
    <DashboardShell
      userName={currentUser?.name ?? ''}
      roleLabel="معلم"
      navItems={NAV}
      activeKey={openCircle ? 'circles' : tab}
      onNav={(k) => { setTab(k as TeacherTab); setOpenCircleId(null); }}
      onLogout={logout}
      extraSidebar={
        <button onClick={() => setNewOpen(true)} className="nav-item w-full text-brand-700 hover:bg-brand-50">
          <Plus size={20} /> إضافة حلقة جديدة
        </button>
      }
    >
      <div className="mb-6">
        <AnnouncementBanner announcements={state.announcements} role="teacher" />
      </div>

      {openCircle ? (
        <CircleView circle={openCircle} onBack={() => setOpenCircleId(null)} canEdit />
      ) : (
        <>
          <PageHeader
            title="حلقاتي"
            subtitle="اضغط على حلقة لإدارة الطلاب والحضور والحفظ"
            action={
              <button onClick={() => setNewOpen(true)} className="btn-primary">
                <Plus size={18} /> حلقة جديدة
              </button>
            }
          />
          {myCircles.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<BookOpen size={28} />}
                title="لا توجد حلقات بعد"
                subtitle="أنشئ أول حلقة لك لبدء التسجيل."
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCircles.map((c) => {
                const count = state.students.filter((s) => s.circleId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setOpenCircleId(c.id)}
                    className="card group p-5 text-right transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white">
                      <BookOpen size={24} />
                    </div>
                    <p className="font-bold text-slate-800 group-hover:text-brand-700">{c.name}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.workingDays.map((d) => (
                        <span key={d} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                          {DAY_NAMES[d]}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Users size={15} /> {count} طالب
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-brand-600">
                        فتح <ArrowRight size={15} className="rotate-180" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="إنشاء حلقة جديدة">
        <div className="space-y-4">
          <div>
            <label className="label">اسم الحلقة</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: حلقة الفجر" />
          </div>
          <div>
            <label className="label">أيام العمل</label>
            <div className="flex flex-wrap gap-2">
              {DAY_NAMES.map((dn, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    days.includes(i) ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {dn}
                </button>
              ))}
            </div>
          </div>
          <button onClick={create} className="btn-primary w-full">
            <Plus size={18} /> إنشاء الحلقة
          </button>
        </div>
      </Modal>
    </DashboardShell>
  );
}
