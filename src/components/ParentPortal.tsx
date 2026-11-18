import { useMemo, useState } from 'react';
import {
  BookOpen,
  Award,
  CalendarCheck,
  Trophy,
  Plus,
  Heart,
  LogOut,
  User,
  TrendingUp,
  Star,
} from 'lucide-react';
import { useStore } from '../store';
import { AnnouncementBanner } from './AnnouncementBanner';
import { DashboardShell, PageHeader, type NavItem } from './DashboardShell';
import { Modal, Badge, StatCard, EmptyState } from './ui';

const NAV: NavItem[] = [
  { key: 'profile', label: 'ملف الطالب', icon: <User size={20} /> },
];

export function ParentPortal() {
  const store = useStore();
  const { state, parentStudents, activeStudentId, setActiveStudent, clearParentSession, linkParentStudent } = store;
  const [addOpen, setAddOpen] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  const active = state.students.find((s) => s.id === activeStudentId) ?? parentStudents[0] ?? null;

  const submit = () => {
    setErr('');
    const ok = linkParentStudent(code);
    if (!ok) setErr('رمز الطالب غير صحيح.');
    else { setCode(''); setAddOpen(false); }
  };

  return (
    <DashboardShell
      userName="ولي الأمر"
      roleLabel="بوابة ولي الأمر"
      navItems={NAV}
      activeKey="profile"
      onNav={() => {}}
      onLogout={clearParentSession}
      extraSidebar={
        <>
          {parentStudents.length > 0 && (
            <div className="px-2 pt-3">
              <p className="mb-2 px-2 text-xs font-semibold text-slate-400">الأبناء المرتبطون</p>
              <div className="space-y-1">
                {parentStudents.map((s) => {
                  const c = state.circles.find((x) => x.id === s.circleId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveStudent(s.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right transition ${
                        active?.id === s.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart size={15} className="shrink-0 text-rose-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="truncate text-[11px] text-slate-400">{c?.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="px-2 pt-2">
            <button onClick={() => setAddOpen(true)} className="nav-item w-full text-brand-700 hover:bg-brand-50">
              <Plus size={20} /> إضافة رمز طالب آخر
            </button>
          </div>
        </>
      }
    >
      <div className="mb-6">
        <AnnouncementBanner announcements={state.announcements} role="parent" />
      </div>

      {!active ? (
        <div className="card">
          <EmptyState
            icon={<Heart size={28} />}
            title="لم يتم ربط أي طالب بعد"
            subtitle="أدخل رمز طالب لعرض بياناته."
          />
        </div>
      ) : (
        <StudentProfile studentId={active.id} />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة طالب آخر">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">أدخل رمز الطالب الذي تصدره الحلقة لربطه بحسابك.</p>
          <div>
            <label className="label">رمز الطالب</label>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="مثال: QC-1A2B" />
          </div>
          {err && <p className="text-sm text-rose-600">{err}</p>}
          <button onClick={submit} className="btn-primary w-full">
            <Plus size={18} /> ربط الطالب
          </button>
        </div>
      </Modal>
    </DashboardShell>
  );
}

function StudentProfile({ studentId }: { studentId: string }) {
  const { state } = useStore();
  const student = state.students.find((s) => s.id === studentId)!;
  const circle = state.circles.find((c) => c.id === student.circleId);

  const circleStudents = useMemo(
    () => state.students.filter((s) => s.circleId === student.circleId),
    [state.students, student.circleId]
  );

  const rank = useMemo(() => {
    const sorted = [...circleStudents].sort((a, b) => b.points - a.points);
    return sorted.findIndex((s) => s.id === studentId) + 1;
  }, [circleStudents, studentId]);

  const attendancePct = useMemo(() => {
    const recs = state.attendance.filter((a) => a.studentId === studentId);
    if (recs.length === 0) return 0;
    return Math.round((recs.filter((r) => r.present).length / recs.length) * 100);
  }, [state.attendance, studentId]);

  const myPoints = useMemo(
    () => state.pointsRecords.filter((p) => p.studentId === studentId).reverse(),
    [state.pointsRecords, studentId]
  );

  const myAttendance = useMemo(
    () => state.attendance.filter((a) => a.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date)),
    [state.attendance, studentId]
  );

  const totalStudents = circleStudents.length;

  return (
    <>
      <PageHeader title="ملف الطالب" subtitle={circle?.name} />

      {/* Profile header */}
      <div className="card mb-5 overflow-hidden">
        <div className="bg-gradient-to-l from-brand-600 to-teal-600 px-6 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-sm text-white/80">الحلقة: {circle?.name}</p>
              <p className="mt-1 text-xs text-white/60">الوالد: {student.fatherName} — الوالدة: {student.motherName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<BookOpen size={22} />} label="الصفحة الحالية" value={student.currentPage} color="brand" />
        <StatCard icon={<Award size={22} />} label="إجمالي النقاط" value={student.points} color="amber" />
        <StatCard icon={<CalendarCheck size={22} />} label="نسبة الحضور" value={`${attendancePct}%`} color="teal" />
        <StatCard icon={<Trophy size={22} />} label="الترتيب" value={`${rank} / ${totalStudents}`} color="blue" />
      </div>

      {/* Leaderboard */}
      <div className="mt-6 card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <Trophy size={18} className="text-amber-500" /> ترتيب الحلقة
        </h3>
        <div className="space-y-2">
          {[...circleStudents].sort((a, b) => b.points - a.points).map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${
                s.id === studentId ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {i + 1}
                </span>
                <span className={`text-sm font-medium ${s.id === studentId ? 'text-brand-700' : 'text-slate-700'}`}>
                  {s.name} {s.id === studentId && '(ابنك)'}
                </span>
              </div>
              <Badge color="green">{s.points} نقطة</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent points */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <Star size={18} className="text-amber-500" /> آخر النقاط
          </h3>
          {myPoints.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد نقاط مسجلة بعد.</p>
          ) : (
            <div className="space-y-2">
              {myPoints.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{p.activityName}</p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                  <Badge color="green">+{p.points}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <TrendingUp size={18} className="text-brand-600" /> سجل الحضور
          </h3>
          {myAttendance.length === 0 ? (
            <p className="text-sm text-slate-400">لا يوجد سجل حضور بعد.</p>
          ) : (
            <div className="space-y-2">
              {myAttendance.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                  <span className="text-sm text-slate-600">{a.date}</span>
                  {a.present ? <Badge color="green">حاضر</Badge> : <Badge color="rose">غائب</Badge>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
