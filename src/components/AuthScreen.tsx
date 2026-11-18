import { useEffect, useState } from 'react';
import {
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  X,
} from 'lucide-react';
import { useStore, type CodeRoute } from '../store';
import type { Role } from '../types';

type Mode = 'gate' | 'staff' | 'pending';

export function AuthScreen() {
  const { resolveCode, loginAdminByCode, loginStaffByCode, linkParentStudent, register, login, logout, state } = useStore();
  const [mode, setMode] = useState<Mode>('gate');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [staffRole, setStaffRole] = useState<Role>('teacher');
  const [staffChoice, setStaffChoice] = useState<'menu' | 'register' | 'login'>('menu');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const submitGate = () => {
    setError('');
    const route: CodeRoute = resolveCode(code);
    if (route.kind === 'invalid') {
      setError('الرمز غير صحيح. يرجى التحقق والمحاولة مرة أخرى.');
      return;
    }
    if (route.kind === 'admin') {
      loginAdminByCode(code);
      return;
    }
    if (route.kind === 'parent') {
      linkParentStudent(code);
      return;
    }
    if (loginStaffByCode(code)) return;
    // staff
    setStaffRole(route.role);
    setStaffChoice('menu');
    setMode('staff');
  };

  const submitRegister = () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('يرجى تعبئة جميع الحقول.');
      return;
    }
    register({ ...form, role: staffRole });
    setMode('pending');
  };

  const submitLogin = () => {
    setLoginError('');
    const u = login(loginForm.email, loginForm.password);
    if (!u) {
      setLoginError('بيانات الدخول غير صحيحة أو أن الحساب لم يُفعّل بعد.');
      return;
    }
    if (u.role !== staffRole) {
      setLoginError('هذا الحساب لا ينتمي للفئة المطلوبة.');
      logout();
      return;
    }
  };

  if (mode === 'pending') return <PendingScreen />;

  if (mode === 'staff') {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <Backdrop />
        <div className="relative z-10 w-full max-w-md">
          <div className="card animate-fade-in p-6 sm:p-8">
            <button onClick={() => { setMode('gate'); setStaffChoice('menu'); setError(''); }} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
              <ArrowRight size={16} /> رجوع
            </button>

            {staffChoice === 'menu' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">اختر طريقة المتابعة</h2>
                <p className="text-sm text-slate-500">
                  {staffRole === 'teacher' ? 'فئة المعلم' : 'فئة المشرف'}
                </p>
                <button onClick={() => setStaffChoice('register')} className="btn-primary w-full justify-start py-3.5">
                  <UserPlus size={20} /> تسجيل حساب جديد
                </button>
                <button onClick={() => setStaffChoice('login')} className="btn-outline w-full justify-start py-3.5">
                  <LogIn size={20} /> تسجيل دخول لحساب معتمد
                </button>
              </div>
            )}

            {staffChoice === 'register' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white">
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">تسجيل حساب جديد</h2>
                    <p className="text-sm text-slate-500">{staffRole === 'teacher' ? 'فئة المعلم' : 'فئة المشرف'}</p>
                  </div>
                </div>
                <div>
                  <label className="label">الاسم الكامل</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم الثلاثي" />
                </div>
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
                </div>
                <div>
                  <label className="label">كلمة المرور</label>
                  <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                </div>
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <button onClick={submitRegister} className="btn-primary w-full">
                  <UserPlus size={18} /> إرسال طلب التسجيل
                </button>
                <p className="text-center text-xs text-slate-400">سيتم مراجعة طلبك من قبل الإدارة قبل التفعيل.</p>
              </div>
            )}

            {staffChoice === 'login' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white">
                    <LogIn size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">تسجيل دخول لحساب معتمد</h2>
                    <p className="text-sm text-slate-500">{staffRole === 'teacher' ? 'فئة المعلم' : 'فئة المشرف'}</p>
                  </div>
                </div>
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input className="input" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="name@example.com" />
                </div>
                <div>
                  <label className="label">كلمة المرور</label>
                  <input className="input" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••••" />
                </div>
                {loginError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                    <AlertCircle size={16} /> {loginError}
                  </div>
                )}
                <button onClick={submitLogin} className="btn-primary w-full">
                  <LogIn size={18} /> دخول
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // gate
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Backdrop />
      <div className="relative z-10 w-full max-w-sm">
        <div className="animate-fade-in space-y-4">
          <div className="mx-auto flex max-w-xs items-center gap-3">
            <input
              className="input bg-white/80 text-center text-base backdrop-blur"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && submitGate()}
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-rose-50/90 px-3 py-2 text-sm text-rose-600 backdrop-blur">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button onClick={submitGate} className="btn-primary w-full py-3 text-base">
            متابعة
          </button>
        </div>
      </div>
    </div>
  );
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-teal-600 to-cyan-700" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
}

function PendingScreen() {
  const { state, pendingUserId, login, clearPending } = useStore();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showToast, setShowToast] = useState(false);

  // Poll for approval/rejection
  useEffect(() => {
    if (!pendingUserId) return;
    const check = () => {
      const u = state.users.find((x) => x.id === pendingUserId);
      if (!u) return;
      if (u.status === 'approved' && status === 'pending') {
        setStatus('approved');
        setShowToast(true);
        setTimeout(() => {
          login(u.email, u.password);
        }, 2500);
      } else if (u.status === 'rejected' && status === 'pending') {
        setStatus('rejected');
        setShowToast(true);
      }
    };
    check();
    const interval = window.setInterval(check, 1500);
    return () => window.clearInterval(interval);
  }, [state.users, pendingUserId, status, login]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Backdrop />
      <div className="relative z-10 w-full max-w-md">
        <div className="card animate-fade-in p-8 text-center">
          {status === 'pending' && (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Clock size={40} className="animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">بانتظار موافقة الإدارة...</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                تم استلام طلبك بنجاح. سيتم نقلك تلقائياً إلى لوحة التحكم بمجرد موافقة الإدارة على حسابك.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                <Clock size={16} /> الحالة: قيد المراجعة
              </div>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                جاري التحقق من الحالة...
              </div>
            </>
          )}
          {status === 'approved' && (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">تم تفعيل حسابك</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">جاري نقلك إلى لوحة التحكم...</p>
            </>
          )}
          {status === 'rejected' && (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <X size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">تم رفض الطلب</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">يرجى مراجعة الإدارة للمتابعة.</p>
              <button onClick={clearPending} className="btn-ghost mt-6 w-full">العودة للصفحة الرئيسية</button>
            </>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-slide-in">
          <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-2xl ${
            status === 'approved' ? 'bg-brand-600' : 'bg-rose-600'
          }`}>
            <Bell size={22} />
            <p className="text-sm font-semibold">
              {status === 'approved'
                ? 'تمت الموافقة على حسابك بنجاح! يمكنك الآن الانتقال للوحة التحكم'
                : 'تم رفض الطلب، يرجى مراجعة الإدارة'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
