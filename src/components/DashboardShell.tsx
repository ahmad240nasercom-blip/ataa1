import { type ReactNode, useState } from 'react';
import { LogOut, Menu, X, BookOpen } from 'lucide-react';

export interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export function DashboardShell({
  userName,
  roleLabel,
  navItems,
  activeKey,
  onNav,
  onLogout,
  children,
  extraSidebar,
}: {
  userName: string;
  roleLabel: string;
  navItems: NavItem[];
  activeKey: string;
  onNav: (key: string) => void;
  onLogout: () => void;
  children: ReactNode;
  extraSidebar?: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 text-white shadow-md shadow-brand-600/20">
          <BookOpen size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">مركز عطاء</p>
          <p className="truncate text-xs text-slate-500">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((n) => (
          <button
            key={n.key}
            onClick={() => {
              onNav(n.key);
              setMobileOpen(false);
            }}
            className={`nav-item w-full ${activeKey === n.key ? 'nav-item-active' : ''}`}
          >
            {n.icon}
            <span className="flex-1 text-right">{n.label}</span>
            {!!n.badge && n.badge > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                {n.badge}
              </span>
            )}
          </button>
        ))}
        {extraSidebar}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="truncate text-xs text-slate-500">المستخدم الحالي</p>
          <p className="truncate text-sm font-semibold text-slate-700">{userName}</p>
        </div>
        <button onClick={onLogout} className="nav-item w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700">
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-l border-slate-200 lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 animate-slide-in border-l border-slate-200 shadow-xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-white">
              <BookOpen size={18} />
            </div>
            <span className="font-bold text-slate-800">مركز عطاء</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {mobileOpen && (
        <button
          className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-lg lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
