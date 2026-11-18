import { useMemo, useState } from 'react';
import {
  ArrowRight,
  UserPlus,
  CalendarCheck,
  BookOpen,
  Award,
  Shuffle,
  Pencil,
  Check,
  RefreshCw,
  Users as UsersIcon,
  Trash2,
} from 'lucide-react';
import { useStore, genStudentCode } from '../store';
import { PageHeader } from './DashboardShell';
import { Badge, Modal, EmptyState } from './ui';
import type { Circle, Student } from '../types';

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

type Tab = 'students' | 'attendance' | 'memorization' | 'points';

export function CircleView({
  circle,
  onBack,
  canEdit = true,
}: {
  circle: Circle;
  onBack: () => void;
  canEdit?: boolean;
}) {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('students');
  const students = state.students.filter((s) => s.circleId === circle.id);
  const teacher = state.users.find((u) => u.id === circle.teacherId);

  const tabs: { key: Tab; label: string; icon: typeof UsersIcon }[] = [
    { key: 'students', label: 'الطلاب', icon: UsersIcon },
    { key: 'attendance', label: 'الحضور', icon: CalendarCheck },
    { key: 'memorization', label: 'الحفظ', icon: BookOpen },
    { key: 'points', label: 'النقاط', icon: Award },
  ];

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowRight size={16} /> رجوع للحلقات
      </button>

      <div className="card mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-l from-brand-600 to-teal-600 px-5 py-4 text-white">
          <div>
            <h2 className="text-xl font-bold">{circle.name}</h2>
            <p className="text-sm text-white/80">المعلم: {teacher?.name ?? '—'}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {circle.workingDays.map((d) => (
              <span key={d} className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
                {DAY_NAMES[d]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === t.key ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'students' && <StudentsTab circle={circle} students={students} canEdit={canEdit} />}
      {tab === 'attendance' && <AttendanceTab circle={circle} students={students} canEdit={canEdit} />}
      {tab === 'memorization' && <MemorizationTab students={students} canEdit={canEdit} />}
      {tab === 'points' && <PointsTab students={students} canEdit={canEdit} />}
    </div>
  );
}

function StudentsTab({
  circle,
  students,
  canEdit,
}: {
  circle: Circle;
  students: Student[];
  canEdit: boolean;
}) {
  const { addStudent, renameCircle, deleteCircle } = useStore();
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(circle.name);
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentCode: '',
  });

  const submit = () => {
    if (!form.name) return;
    addStudent({ ...form, parentCode: form.parentCode || genStudentCode() }, circle.id);
    setForm({ name: '', fatherName: '', motherName: '', parentPhone: '', parentCode: '' });
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title={`طلاب ${circle.name}`}
        subtitle={`${students.length} طالب`}
        action={
          canEdit && (
            <div className="flex gap-2">
              <button onClick={() => setEditName((v) => !v)} className="btn-outline">
                <Pencil size={16} /> تعديل الاسم
              </button>
              <button onClick={() => setOpen(true)} className="btn-primary">
                <UserPlus size={18} /> إضافة طالب
              </button>
            </div>
          )
        }
      />

      {editName && (
        <div className="card mb-4 flex items-center gap-2 p-3">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <button
            onClick={() => { renameCircle(circle.id, name); setEditName(false); }}
            className="btn-primary shrink-0"
          >
            <Check size={16} /> حفظ
          </button>
        </div>
      )}

      {canEdit && (
        <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-bold text-slate-800">إضافة طالب إلى {circle.name}</p>
            <p className="text-sm text-slate-500">أدخل بيانات الطالب وأضفه مباشرة إلى قائمة الحلقة.</p>
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary">
            <UserPlus size={18} /> إضافة طالب
          </button>
        </div>
      )}

      {students.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<UsersIcon size={28} />}
            title="لا يوجد طلاب بعد"
            subtitle="أضف أول طالب لبدء التسجيل."
            action={canEdit && (
              <button onClick={() => setOpen(true)} className="btn-primary mx-auto">
                <UserPlus size={18} /> إضافة طالب
              </button>
            )}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">والد: {s.fatherName} — والدة: {s.motherName}</p>
                </div>
                <Badge color="teal">صفحة {s.currentPage}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>هاتف: {s.parentPhone}</span>
                <span className="font-mono font-semibold text-brand-700">{s.parentCode}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-6">
          <button onClick={() => { if (confirm(`حذف حلقة ${circle.name} وكل طلابها؟`)) deleteCircle(circle.id); }} className="btn-danger">
            <Trash2 size={16} /> حذف الحلقة
          </button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة طالب جديد">
        <div className="space-y-3">
          <div>
            <label className="label">اسم الطالب</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">اسم الأب</label>
              <input className="input" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
            </div>
            <div>
              <label className="label">اسم الأم</label>
              <input className="input" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">هاتف ولي الأمر</label>
            <input className="input" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="05xxxxxxxx" />
          </div>
          <div>
            <label className="label">رمز ولي الأمر</label>
            <div className="flex gap-2">
              <input className="input" value={form.parentCode} onChange={(e) => setForm({ ...form, parentCode: e.target.value })} placeholder="تلقائي إن تُرك فارغاً" />
              <button onClick={() => setForm({ ...form, parentCode: genStudentCode() })} className="btn-ghost shrink-0">
                <Shuffle size={16} /> توليد
              </button>
            </div>
          </div>
          <button onClick={submit} className="btn-primary w-full">
            <UserPlus size={18} /> إضافة الطالب
          </button>
        </div>
      </Modal>
    </>
  );
}

function AttendanceTab({
  circle,
  students,
  canEdit,
}: {
  circle: Circle;
  students: Student[];
  canEdit: boolean;
}) {
  const { state, setAttendance } = useStore();
  const [selectedDays, setSelectedDays] = useState<number[]>(circle.workingDays);
  const today = new Date().toISOString().slice(0, 10);

  const last7 = useMemo(() => {
    const arr: { date: string; dayName: string; dow: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      arr.push({ date: d.toISOString().slice(0, 10), dayName: DAY_NAMES[dow], dow });
    }
    return arr;
  }, []);

  const toggleDay = (dow: number) => {
    setSelectedDays((d) => (d.includes(dow) ? d.filter((x) => x !== dow) : [...d, dow]));
  };

  const isPresent = (sid: string, date: string) =>
    state.attendance.find((a) => a.studentId === sid && a.date === date)?.present ?? false;

  return (
    <>
      <PageHeader title="تسجيل الحضور" subtitle="أيام العمل الحلقة (يمكن التسجيل في أي يوم للحصص التعويضية)" />
      <div className="card mb-5 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">أيام العمل</p>
        <div className="flex flex-wrap gap-2">
          {DAY_NAMES.map((dn, i) => (
            <button
              key={i}
              onClick={() => canEdit && toggleDay(i)}
              disabled={!canEdit}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                selectedDays.includes(i) ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-500'
              } ${canEdit ? 'hover:opacity-90' : 'cursor-not-allowed'}`}
            >
              {dn}
            </button>
          ))}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card"><EmptyState icon={<UsersIcon size={28} />} title="لا يوجد طلاب" /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-3 text-right font-medium">الطالب</th>
                {last7.map((d) => (
                  <th key={d.date} className="px-2 py-3 text-center font-medium">
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{d.dayName}</span>
                      <span className={`mt-0.5 text-[10px] ${selectedDays.includes(d.dow) ? 'text-brand-600' : 'text-slate-300'}`}>
                        {d.date.slice(5)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-medium text-slate-700">{s.name}</td>
                  {last7.map((d) => {
                    const present = isPresent(s.id, d.date);
                    const isToday = d.date === today;
                    return (
                      <td key={d.date} className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => canEdit && setAttendance(s.id, d.date, !present)}
                          disabled={!canEdit}
                          className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg transition ${
                            present
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                          } ${isToday ? 'ring-2 ring-brand-400' : ''} ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        >
                          {present ? <Check size={15} /> : <span className="text-xs">✕</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function MemorizationTab({ students, canEdit }: { students: Student[]; canEdit: boolean }) {
  const { logMemorization, overridePage } = useStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  return (
    <>
      <PageHeader title="تسجيل الحفظ" subtitle="اضغط «تسجيل تقدم» لزيادة الصفحة تلقائياً" />
      {students.length === 0 ? (
        <div className="card"><EmptyState icon={<BookOpen size={28} />} title="لا يوجد طلاب" /></div>
      ) : (
        <div className="space-y-2.5">
          {students.map((s) => (
            <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">الصفحة الحالية: <span className="font-bold text-brand-700">{s.currentPage}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editId === s.id ? (
                  <>
                    <input
                      type="number"
                      className="input w-24 py-2"
                      value={page}
                      onChange={(e) => setPage(Number(e.target.value))}
                    />
                    <button
                      onClick={() => { overridePage(s.id, page); setEditId(null); }}
                      className="btn-primary"
                    >
                      <Check size={16} /> حفظ
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-ghost">إلغاء</button>
                  </>
                ) : (
                  <>
                    {canEdit && (
                      <button onClick={() => logMemorization(s.id)} className="btn-primary">
                        <RefreshCw size={16} /> تسجيل تقدم → {s.currentPage + 1}
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => { setEditId(s.id); setPage(s.currentPage); }}
                        className="btn-outline"
                      >
                        <Pencil size={16} /> تعديل
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PointsTab({ students, canEdit }: { students: Student[]; canEdit: boolean }) {
  const { state, assignPoints } = useStore();
  const [sel, setSel] = useState<Record<string, string>>({});

  return (
    <>
      <PageHeader title="النقاط والأنشطة" subtitle="اختر النشاط لإضافة نقاطه للطالب" />
      {students.length === 0 ? (
        <div className="card"><EmptyState icon={<Award size={28} />} title="لا يوجد طلاب" /></div>
      ) : (
        <div className="space-y-2.5">
          {students.map((s) => {
            const actId = sel[s.id] ?? state.activities[0]?.id ?? '';
            const act = state.activities.find((a) => a.id === actId);
            return (
              <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">النقاط: <span className="font-bold text-amber-600">{s.points}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="input w-44 py-2"
                    value={actId}
                    onChange={(e) => setSel({ ...sel, [s.id]: e.target.value })}
                    disabled={!canEdit}
                  >
                    {state.activities.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} (+{a.points})</option>
                    ))}
                  </select>
                  {canEdit && (
                    <button
                      onClick={() => act && assignPoints(s.id, act.id)}
                      className="btn-primary"
                    >
                      <Check size={16} /> إضافة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
