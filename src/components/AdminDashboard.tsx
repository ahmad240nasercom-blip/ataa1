import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Megaphone,
  Check,
  X,
  RefreshCw,
  Trash2,
  Plus,
  ShieldCheck,
  GraduationCap,
  UserCog,
  Activity as ActivityIcon,
  TrendingUp,
  BookOpen,
  Award,
} from 'lucide-react';
import { useStore } from '../store';
import { DashboardShell, PageHeader, type NavItem } from './DashboardShell';
import { AnnouncementBanner } from './AnnouncementBanner';
import { CircleView } from './CircleView';
import { CirclesList } from './SupervisorDashboard';
import { Modal, Badge, StatCard, EmptyState } from './ui';
import type { AdminTab, AnnouncementAudience } from '../types';

function AdminNav({ pendingCount }: { pendingCount: number }): NavItem[] {
  return [
    { key: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard size={20} /> },
    { key: 'users', label: 'إدارة الحسابات', icon: <Users size={20} />, badge: pendingCount },
    { key: 'circles', label: 'الحلقات', icon: <BookOpen size={20} /> },
    { key: 'students', label: 'الطلاب', icon: <GraduationCap size={20} /> },
    { key: 'config', label: 'الإعدادات العامة', icon: <Settings size={20} /> },
    { key: 'analytics', label: 'التقارير والإحصائيات', icon: <BarChart3 size={20} /> },
    { key: 'announcements', label: 'إدارة الإعلانات', icon: <Megaphone size={20} /> },
  ];
}

export function AdminDashboard() {
  const store = useStore();
  const [tab, setTab] = useState<AdminTab>('overview');
  const { currentUser, state, logout } = store;
  const pendingCount = state.users.filter((u) => u.status === 'pending').length;
  const nav = AdminNav({ pendingCount });

  return (
    <DashboardShell
      userName={currentUser?.name ?? ''}
      roleLabel="مدير المركز"
      navItems={nav}
      activeKey={tab}
      onNav={(k) => setTab(k as AdminTab)}
      onLogout={logout}
    >
      <div className="mb-6">
        <AnnouncementBanner announcements={state.announcements} role="admin" />
      </div>

      {tab === 'overview' && <Overview onNavigate={setTab} />}
      {tab === 'users' && <UsersMgmt />}
      {tab === 'circles' && <AdminCircles />}
      {tab === 'students' && <StudentsList />}
      {tab === 'config' && <Config />}
      {tab === 'analytics' && <Analytics />}
      {tab === 'announcements' && <AnnouncementsMgmt />}
    </DashboardShell>
  );
}

function Overview({ onNavigate }: { onNavigate: (t: AdminTab) => void }) {
  const { state } = useStore();
  const teachers = state.users.filter((u) => u.role === 'teacher' && u.status === 'approved');
  const supervisors = state.users.filter((u) => u.role === 'supervisor' && u.status === 'approved');
  const pending = state.users.filter((u) => u.status === 'pending');

  return (
    <>
      <PageHeader title="نظرة عامة" subtitle="ملخص شامل لحالة المركز — اضغط على أي بطاقة للانتقال إلى إدارتها" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button onClick={() => onNavigate('users')} className="text-right transition hover:-translate-y-0.5">
          <StatCard icon={<Users size={22} />} label="المعلمون" value={teachers.length} color="brand" />
        </button>
        <button onClick={() => onNavigate('users')} className="text-right transition hover:-translate-y-0.5">
          <StatCard icon={<ShieldCheck size={22} />} label="المشرفون" value={supervisors.length} color="teal" />
        </button>
        <button onClick={() => onNavigate('students')} className="text-right transition hover:-translate-y-0.5">
          <StatCard icon={<GraduationCap size={22} />} label="الطلاب" value={state.students.length} color="blue" />
        </button>
        <button onClick={() => onNavigate('circles')} className="text-right transition hover:-translate-y-0.5">
          <StatCard icon={<BookOpen size={22} />} label="الحلقات" value={state.circles.length} color="amber" />
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-slate-800">طلبات بانتظار الموافقة</h3>
          {pending.length === 0 ? (
            <EmptyState icon={<Check size={28} />} title="لا توجد طلبات معلقة" />
          ) : (
            <div className="space-y-2">
              {pending.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email} — {u.role === 'teacher' ? 'معلم' : 'مشرف'}</p>
                  </div>
                  <Badge color="amber">معلّق</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-slate-800">الأنشطة المتاحة</h3>
          <div className="space-y-2">
            {state.activities.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                <span className="text-sm font-medium text-slate-700">{a.name}</span>
                <Badge color="green">+{a.points} نقطة</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AdminCircles() {
  const { state } = useStore();
  const [openCircleId, setOpenCircleId] = useState<string | null>(null);
  const openCircle = openCircleId ? state.circles.find((c) => c.id === openCircleId) : null;

  if (openCircle) {
    return <CircleView circle={openCircle} onBack={() => setOpenCircleId(null)} canEdit />;
  }
  return <CirclesList onOpen={setOpenCircleId} />;
}

function StudentsList() {
  const { state } = useStore();
  const [search, setSearch] = useState('');

  const filtered = state.students.filter(
    (s) => s.name.includes(search) || s.parentPhone.includes(search) || s.parentCode.includes(search)
  );

  return (
    <>
      <PageHeader title="جميع الطلاب" subtitle={`${state.students.length} طالب في المركز`} />
      <div className="mb-4">
        <input
          className="input"
          placeholder="ابحث بالاسم أو الهاتف أو الرمز..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={<GraduationCap size={28} />} title="لا يوجد طلاب مطابقون للبحث" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">الطالب</th>
                  <th className="px-4 py-3 text-right font-medium">الحلقة</th>
                  <th className="px-4 py-3 text-right font-medium">الصفحة</th>
                  <th className="px-4 py-3 text-right font-medium">النقاط</th>
                  <th className="px-4 py-3 text-right font-medium">هاتف ولي الأمر</th>
                  <th className="px-4 py-3 text-left font-medium">رمز ولي الأمر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const circle = state.circles.find((c) => c.id === s.circleId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-700">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500">{circle?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{s.currentPage}</td>
                      <td className="px-4 py-3 text-slate-500">{s.points}</td>
                      <td className="px-4 py-3 text-slate-500">{s.parentPhone}</td>
                      <td className="px-4 py-3 text-left font-mono text-brand-700">{s.parentCode}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function UsersMgmt() {
  const { state, approveUser, rejectUser } = useStore();
  const [tick, setTick] = useState(0);
  const list = useMemo(() => {
    void tick;
    return [...state.users].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [state.users, tick]);

  const roleLabel = (r: string) => (r === 'admin' ? 'مدير' : r === 'supervisor' ? 'مشرف' : r === 'teacher' ? 'معلم' : 'ولي أمر');

  return (
    <>
      <PageHeader
        title="إدارة الحسابات"
        subtitle="الموافقة على الحسابات الجديدة وإدارة الصلاحيات"
        action={
          <button onClick={() => setTick((t) => t + 1)} className="btn-outline">
            <RefreshCw size={18} /> تحديث
          </button>
        }
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-right font-medium">الاسم</th>
                <th className="px-4 py-3 text-right font-medium">البريد</th>
                <th className="px-4 py-3 text-right font-medium">الفئة</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-left font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge color={u.role === 'admin' ? 'green' : u.role === 'supervisor' ? 'teal' : 'blue'}>
                      {roleLabel(u.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.status === 'approved' && <Badge color="green">مفعّل</Badge>}
                    {u.status === 'pending' && <Badge color="amber">بانتظار الموافقة</Badge>}
                    {u.status === 'rejected' && <Badge color="rose">مرفوض</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {u.role !== 'admin' && u.status === 'pending' && (
                        <>
                          <button onClick={() => approveUser(u.id)} className="rounded-lg bg-brand-50 p-2 text-brand-600 hover:bg-brand-100" title="موافقة">
                            <Check size={16} />
                          </button>
                          <button onClick={() => rejectUser(u.id)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100" title="رفض">
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {u.role !== 'admin' && u.status === 'approved' && (
                        <button onClick={() => rejectUser(u.id)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100" title="إلغاء الوصول">
                          <UserCog size={16} />
                        </button>
                      )}
                      {u.role === 'admin' && <span className="text-xs text-slate-400">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Config() {
  const { state, setCategoryCodes } = useStore();
  const [codes, setCodes] = useState(state.categoryCodes);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setCategoryCodes(codes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHeader title="الإعدادات العامة" subtitle="تعديل رموز الفئات للدخول" />
      <div className="card max-w-xl p-6">
        <div className="space-y-4">
          {([
            { key: 'admin', label: 'رمز المدير', icon: <ShieldCheck size={18} /> },
            { key: 'supervisor', label: 'رمز المشرف', icon: <Users size={18} /> },
            { key: 'teacher', label: 'رمز المعلم', icon: <GraduationCap size={18} /> },
          ] as const).map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{f.icon}</span>
                <input
                  className="input pr-10"
                  value={codes[f.key]}
                  onChange={(e) => setCodes({ ...codes, [f.key]: e.target.value })}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} className="btn-primary">
              <Settings size={18} /> حفظ التغييرات
            </button>
            {saved && <span className="text-sm font-medium text-brand-600">تم الحفظ بنجاح</span>}
          </div>
        </div>
      </div>
    </>
  );
}

function Analytics() {
  const { state } = useStore();
  const [range, setRange] = useState<number>(7);
  const ranges = [
    { label: 'أسبوع واحد', days: 7 },
    { label: 'أسبوعان', days: 14 },
    { label: 'شهر واحد', days: 30 },
    { label: 'شهران', days: 60 },
  ];

  const stats = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const points = state.pointsRecords
      .filter((p) => p.date >= cutoffStr)
      .reduce((sum, p) => sum + p.points, 0);
    const pages = state.memorization
      .filter((m) => m.date >= cutoffStr)
      .reduce((sum, m) => sum + (m.toPage - m.fromPage), 0);
    return { students: state.students.length, points, pages };
  }, [state, range]);

  return (
    <>
      <PageHeader title="التقارير والإحصائيات" subtitle="تحليل أداء المركز خلال فترة محددة" />
      <div className="mb-5 flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r.days}
            onClick={() => setRange(r.days)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              range === r.days ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<GraduationCap size={22} />} label="إجمالي الطلاب" value={stats.students} color="brand" />
        <StatCard icon={<Award size={22} />} label="النقاط الممنوحة" value={stats.points} color="amber" />
        <StatCard icon={<BookOpen size={22} />} label="الصفحات المحفوظة" value={stats.pages} color="teal" />
      </div>
      <div className="mt-6 card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
          <TrendingUp size={18} className="text-brand-600" /> آخر النشاطات
        </h3>
        <div className="space-y-2">
          {state.pointsRecords.slice(-6).reverse().map((p) => {
            const st = state.students.find((s) => s.id === p.studentId);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                <span className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">{st?.name ?? '—'}</span> — {p.activityName}
                </span>
                <Badge color="green">+{p.points}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function AnnouncementsMgmt() {
  const { state, addAnnouncement, deleteAnnouncement } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>('all');

  const submit = () => {
    if (!title || !body) return;
    addAnnouncement({ title, body, audience });
    setTitle(''); setBody(''); setAudience('all'); setOpen(false);
  };

  const audienceLabel = (a: AnnouncementAudience) =>
    a === 'all' ? 'الجميع' : a === 'parents' ? 'أولياء الأمور' : a === 'teachers' ? 'المعلمون' : 'المشرفون';

  return (
    <>
      <PageHeader
        title="إدارة الإعلانات"
        subtitle="إنشاء وتوجيه الإعلانات للفئات المختلفة"
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus size={18} /> إعلان جديد
          </button>
        }
      />
      <div className="space-y-3">
        {state.announcements.map((a) => (
          <div key={a.id} className="card flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-800">{a.title}</p>
                <Badge color={a.audience === 'all' ? 'teal' : 'blue'}>{audienceLabel(a.audience)}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{a.body}</p>
              <p className="mt-1 text-xs text-slate-400">{a.createdAt}</p>
            </div>
            <button onClick={() => deleteAnnouncement(a.id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="إعلان جديد">
        <div className="space-y-4">
          <div>
            <label className="label">عنوان الإعلان</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">نص الإعلان</label>
            <textarea className="input min-h-[90px]" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div>
            <label className="label">الفئة المستهدفة</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                { v: 'all', l: 'الجميع' },
                { v: 'parents', l: 'أولياء الأمور' },
                { v: 'teachers', l: 'المعلمون' },
                { v: 'supervisors', l: 'المشرفون' },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setAudience(o.v)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    audience === o.v ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={submit} className="btn-primary w-full">
            <Megaphone size={18} /> نشر الإعلان
          </button>
        </div>
      </Modal>
    </>
  );
}
