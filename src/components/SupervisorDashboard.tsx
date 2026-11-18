import { useMemo, useState } from 'react';
import { LayoutDashboard, Shuffle, BookOpen, Users, Check, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { DashboardShell, PageHeader, type NavItem } from './DashboardShell';
import { AnnouncementBanner } from './AnnouncementBanner';
import { CircleView } from './CircleView';
import { Modal, Badge, EmptyState, StatCard } from './ui';
import type { SupervisorTab } from '../types';

const NAV: NavItem[] = [
  { key: 'circles', label: 'الحلقات', icon: <LayoutDashboard size={20} /> },
  { key: 'transfer', label: 'نقل الطلاب', icon: <Shuffle size={20} /> },
];

export function SupervisorDashboard() {
  const store = useStore();
  const [tab, setTab] = useState<SupervisorTab>('circles');
  const [openCircleId, setOpenCircleId] = useState<string | null>(null);
  const { currentUser, state, logout } = store;

  const openCircle = openCircleId ? state.circles.find((c) => c.id === openCircleId) : null;

  return (
    <DashboardShell
      userName={currentUser?.name ?? ''}
      roleLabel="مشرف"
      navItems={NAV}
      activeKey={openCircle ? 'circles' : tab}
      onNav={(k) => { setTab(k as SupervisorTab); setOpenCircleId(null); }}
      onLogout={logout}
    >
      <div className="mb-6">
        <AnnouncementBanner announcements={state.announcements} role="supervisor" />
      </div>

      {openCircle ? (
        <CircleView circle={openCircle} onBack={() => setOpenCircleId(null)} canEdit />
      ) : tab === 'circles' ? (
        <CirclesList onOpen={setOpenCircleId} />
      ) : (
        <BulkTransfer />
      )}
    </DashboardShell>
  );
}

export function CirclesList({ onOpen }: { onOpen: (id: string) => void }) {
  const { state } = useStore();
  return (
    <>
      <PageHeader title="جميع حلقات المركز" subtitle="اضغط على حلقة لفتحها والتعامل معها كمعلم" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.circles.map((c) => {
          const count = state.students.filter((s) => s.circleId === c.id).length;
          const teacher = state.users.find((u) => u.id === c.teacherId);
          return (
            <button
              key={c.id}
              onClick={() => onOpen(c.id)}
              className="card group p-5 text-right transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white">
                <BookOpen size={24} />
              </div>
              <p className="font-bold text-slate-800 group-hover:text-brand-700">{c.name}</p>
              <p className="mt-1 text-xs text-slate-500">المعلم: {teacher?.name ?? '—'}</p>
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
    </>
  );
}

function BulkTransfer() {
  const { state, transferStudents } = useStore();
  const [sourceId, setSourceId] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [destId, setDestId] = useState('');
  const [keepData, setKeepData] = useState(true);
  const [resetData, setResetData] = useState(false);
  const [done, setDone] = useState(false);

  const sourceStudents = useMemo(
    () => (sourceId ? state.students.filter((s) => s.circleId === sourceId) : []),
    [state.students, sourceId]
  );

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openConfirm = () => {
    if (selected.length === 0) return;
    setDestId('');
    setKeepData(true);
    setResetData(false);
    setModalOpen(true);
  };

  const confirm = () => {
    if (!destId) return;
    transferStudents(selected, destId, keepData);
    setModalOpen(false);
    setSelected([]);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <>
      <PageHeader title="النقل الجماعي للطلاب" subtitle="انقل عدة طلاب بين الحلقات دفعة واحدة" />

      {done && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          <Check size={18} /> تم نقل الطلاب بنجاح.
        </div>
      )}

      <div className="card mb-5 p-4">
        <label className="label">اختر الحلقة المصدر</label>
        <select className="input" value={sourceId} onChange={(e) => { setSourceId(e.target.value); setSelected([]); }}>
          <option value="">— اختر —</option>
          {state.circles.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!sourceId ? (
        <div className="card">
          <EmptyState icon={<Shuffle size={28} />} title="اختر حلقة مصدر لعرض الطلاب" />
        </div>
      ) : sourceStudents.length === 0 ? (
        <div className="card"><EmptyState icon={<Users size={28} />} title="لا يوجد طلاب في هذه الحلقة" /></div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">{selected.length} محدد من {sourceStudents.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setSelected(sourceStudents.map((s) => s.id))} className="btn-ghost text-sm">
                تحديد الكل
              </button>
              <button onClick={() => setSelected([])} className="btn-ghost text-sm">
                إلغاء التحديد
              </button>
            </div>
          </div>
          <div className="card mb-4 divide-y divide-slate-100">
            {sourceStudents.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 p-3.5 hover:bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{s.name}</p>
                  <p className="text-xs text-slate-500">صفحة {s.currentPage} — {s.points} نقطة</p>
                </div>
              </label>
            ))}
          </div>
          <button onClick={openConfirm} disabled={selected.length === 0} className="btn-primary">
            <Shuffle size={18} /> نقل المحدد ({selected.length})
          </button>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="تأكيد النقل">
        <div className="space-y-4">
          <div>
            <label className="label">الحلقة الوجهة</label>
            <select className="input" value={destId} onChange={(e) => setDestId(e.target.value)}>
              <option value="">— اختر —</option>
              {state.circles.filter((c) => c.id !== sourceId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={16} /> تأكيد أمني
            </p>
            <p className="mt-1 text-amber-600">اختر طريقة النقل. لا يمكن التراجع بعد التأكيد.</p>
          </div>

          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
            keepData ? 'border-brand-400 bg-brand-50' : 'border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={keepData}
              onChange={(e) => { setKeepData(e.target.checked); if (e.target.checked) setResetData(false); }}
              className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <p className="font-medium text-slate-700">نقل الطلاب مع بياناتهم</p>
              <p className="text-xs text-slate-500">النقاط، الحضور، وآخر صفحة محفوظة تبقى كما هي.</p>
            </div>
          </label>

          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
            resetData ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={resetData}
              onChange={(e) => { setResetData(e.target.checked); if (e.target.checked) setKeepData(false); }}
              className="mt-0.5 h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <p className="font-medium text-slate-700">تصفير البيانات والبدء من جديد</p>
              <p className="text-xs text-slate-500">يتم محو النقاط والحضور والصفحات في الحلقة الجديدة.</p>
            </div>
          </label>

          <button onClick={confirm} disabled={!destId || (!keepData && !resetData)} className="btn-primary w-full">
            <Check size={18} /> تأكيد نقل {selected.length} طالب
          </button>
        </div>
      </Modal>
    </>
  );
}
