'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Check, ChevronDown, LogOut, Moon, Shield, Sprout, Sun } from 'lucide-react';
import { notifications } from '@/components/notification/NotificationPages';
import { getCurrentModule, getUserRole, isAllowed, modules, type UserRole } from './moduleNavigation';

type Workspace = {
  id: string;
  initial: string;
  name: string;
  role: string;
  members: number;
};

const workspaces: Workspace[] = [
  {
    id: 'binh-dien',
    initial: 'H',
    name: 'HTX Nông nghiệp Bình Điền',
    role: 'Chủ sở hữu',
    members: 15,
  },
  {
    id: 'nong-san-xanh',
    initial: 'C',
    name: 'Công ty Nông sản Xanh',
    role: 'Quản trị viên',
    members: 8,
  },
  {
    id: 'cam-cao-phong',
    initial: 'C',
    name: 'HTX Cam Cao Phong',
    role: 'Quản lý nông trại',
    members: 12,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentModule = getCurrentModule(pathname);
  const [role, setRole] = useState<UserRole>('owner');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [workspace, setWorkspace] = useState<Workspace>(workspaces[0]);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRole(getUserRole());
    const storedTheme = window.localStorage.getItem('nextfarm:theme');
    const storedWorkspace = window.localStorage.getItem('nextfarm:selectedWorkspace');

    if (storedTheme === 'dark') setTheme('dark');
    if (storedWorkspace) {
      try {
        const parsedWorkspace = JSON.parse(storedWorkspace) as Partial<Workspace>;
        setWorkspace({
          id: parsedWorkspace.id ?? workspaces[0].id,
          initial: parsedWorkspace.initial ?? parsedWorkspace.name?.charAt(0).toUpperCase() ?? workspaces[0].initial,
          name: parsedWorkspace.name ?? workspaces[0].name,
          role: parsedWorkspace.role ?? workspaces[0].role,
          members: parsedWorkspace.members ?? workspaces[0].members,
        });
      } catch {
        window.localStorage.removeItem('nextfarm:selectedWorkspace');
      }
    }
  }, []);

  useEffect(() => {
    const marker = window.sessionStorage.getItem('nextfarm:navigatingModule');
    if (!marker) return;
    setLoading(true);
    const timer = window.setTimeout(() => {
      window.sessionStorage.removeItem('nextfarm:navigatingModule');
      setLoading(false);
    }, 260);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const farmModules = useMemo(() => modules.filter((module) => module.id !== 'iam' && isAllowed(module.roles, role)), [role]);
  const dark = theme === 'dark';
  const surface = dark ? 'border-[#263244] bg-[#111827]' : 'border-slate-200/60 bg-white';
  const muted = dark ? 'text-[#9ca3af]' : 'text-slate-500';

  function switchWorkspace(nextWorkspace: Workspace) {
    setWorkspace(nextWorkspace);
    setWorkspaceOpen(false);
    window.localStorage.setItem('nextfarm:selectedWorkspace', JSON.stringify(nextWorkspace));
    setLoading(true);
    window.setTimeout(() => setLoading(false), 280);
  }

  function toggleTheme() {
    const nextTheme = dark ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('nextfarm:theme', nextTheme);
  }

  function logout() {
    window.localStorage.removeItem('nextfarm:selectedWorkspace');
    setWorkspaceOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
    router.push('/login/');
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className={`min-h-screen ${dark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`fixed left-0 top-0 h-screen w-[256px] border-r px-3 py-4 transition-opacity duration-200 ${dark ? 'border-[#263244] bg-[#111827]' : 'border-slate-200/60 bg-slate-50'}`}>
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-semibold text-white">
            N
          </div>
          <div>
            <p className="text-lg font-semibold leading-5 tracking-tight">Nextfarm</p>
            <p className={`text-[10px] ${muted}`}>Hệ thống quản lý</p>
          </div>
        </div>
        <nav className="mt-7 grid gap-1" key={currentModule.id}>
          <Link
            className={`flex h-10 items-center gap-3 rounded-lg border-l-2 border-transparent px-3 text-sm font-medium transition-all duration-150 ${dark ? 'text-[#e5e7eb] hover:bg-[#1f2937]' : 'text-slate-700 hover:bg-slate-100'}`}
            href="/iam/"
            onClick={() => window.sessionStorage.setItem('nextfarm:navigatingSubsystem', 'admin')}
          >
            <Shield size={18} strokeWidth={1.5} />
            Quản trị
          </Link>
          <div className={`flex h-10 items-center gap-3 rounded-lg border-l-2 border-emerald-600 px-3 text-sm font-medium ${dark ? 'bg-[#123421] text-[#86efac]' : 'bg-emerald-50 text-emerald-700'}`}>
            <Sprout size={18} strokeWidth={1.5} />
            Nông nghiệp
          </div>

          <div className={`mt-3 grid gap-1 border-t pt-3 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            {farmModules.map((module) => {
              const ModuleIcon = module.icon;
              const moduleActive = currentModule.id === module.id;

              return (
                <Link
                  className={`flex h-10 items-center gap-3 rounded-lg border-l-2 px-3 text-sm font-medium transition-all duration-150 ${
                    moduleActive
                      ? dark
                        ? 'border-emerald-500 bg-[#123421] text-[#86efac]'
                        : 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : dark
                        ? 'border-transparent text-[#e5e7eb] hover:bg-[#1f2937]'
                        : 'border-transparent text-slate-700 hover:bg-slate-100'
                  }`}
                  href={module.href}
                  key={module.id}
                  onClick={() => window.sessionStorage.setItem('nextfarm:navigatingModule', module.id)}
                >
                  <ModuleIcon size={18} strokeWidth={1.5} />
                  <span className="min-w-0 flex-1 truncate">{module.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
      <section className="min-h-screen pl-[256px]">
        <header className={`flex h-[45px] items-center justify-between border-b px-5 ${dark ? surface : 'border-slate-200/60 bg-white/90 backdrop-blur'}`}>
          <div className="relative">
            <button
              className={`flex min-w-[245px] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all duration-150 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-100'}`}
              onClick={() => {
                setWorkspaceOpen((current) => !current);
                setProfileOpen(false);
              }}
              type="button"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-semibold text-white">
                {workspace.initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-semibold leading-4">{workspace.name}</p>
                  <ChevronDown size={12} strokeWidth={1.5} />
                </div>
                <p className={`text-[10px] ${muted}`}>{workspace.role}</p>
              </div>
            </button>

            {workspaceOpen ? (
              <div className={`absolute left-0 top-[42px] z-40 w-[286px] rounded-xl border p-2 shadow-md ${dark ? surface : 'border-slate-200/60 bg-white'}`}>
                <p className={`px-2 pb-2 text-[11px] font-medium uppercase tracking-wider ${muted}`}>Chuyển workspace</p>
                <div className="grid gap-1">
                  {workspaces.map((item) => (
                    <button
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-all duration-150 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-100'}`}
                      key={item.id}
                      onClick={() => switchWorkspace(item)}
                      type="button"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">
                        {item.initial}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{item.name}</span>
                        <span className={`text-[10px] ${muted}`}>{item.role} · {item.members} thành viên</span>
                      </span>
                      {item.id === workspace.id ? <Check className="text-emerald-600" size={16} strokeWidth={1.5} /> : null}
                    </button>
                  ))}
                </div>
                <button
                  className={`mt-2 h-8 w-full rounded-lg border border-dashed text-xs font-medium transition-all duration-150 ${dark ? 'border-[#374151] text-[#e5e7eb] hover:bg-[#1f2937]' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                  onClick={() => router.push('/select-workspace/')}
                  type="button"
                >
                  Tạo workspace mới
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-100'}`} onClick={toggleTheme} type="button">
              {dark ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
            </button>

            <div className="relative">
              <button
                aria-label="Thông báo"
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-100'}`}
                onClick={() => {
                  setNotificationOpen((current) => !current);
                  setProfileOpen(false);
                  setWorkspaceOpen(false);
                }}
                type="button"
              >
                <Bell size={17} strokeWidth={1.5} />
                {unreadCount ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notificationOpen ? (
                <div className={`absolute right-0 top-[38px] z-40 w-[360px] rounded-xl border p-2 shadow-md ${dark ? surface : 'border-slate-200/60 bg-white'}`}>
                  <div className={`flex items-center justify-between border-b px-2 pb-2 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
                    <div>
                      <p className="text-sm font-semibold">Thông báo</p>
                      <p className={`mt-0.5 text-[10px] ${muted}`}>{unreadCount} chưa đọc</p>
                    </div>
                    <Link className="text-xs font-medium text-emerald-700" href="/notifications/" onClick={() => setNotificationOpen(false)}>
                      Xem tất cả
                    </Link>
                  </div>
                  <div className="mt-2 grid max-h-[370px] gap-1 overflow-auto">
                    {notifications.slice(0, 10).map((item) => (
                      <Link
                        className={`rounded-lg px-2 py-2 transition-all duration-150 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'} ${item.read ? '' : dark ? 'bg-[#123421]' : 'bg-emerald-50'}`}
                        href={`/notifications/${item.id}/`}
                        key={item.id}
                        onClick={() => setNotificationOpen(false)}
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

            <div className="relative">
              <button
                aria-label="Tài khoản"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#009688] text-xs font-semibold text-white transition-all duration-150 hover:ring-2 hover:ring-emerald-500/20"
                onClick={() => {
                  setProfileOpen((current) => !current);
                  setWorkspaceOpen(false);
                  setNotificationOpen(false);
                }}
                type="button"
              >
                A
              </button>

              {profileOpen ? (
                <div className={`absolute right-0 top-[36px] z-40 w-[210px] rounded-xl border p-2 shadow-md ${dark ? surface : 'border-slate-200/60 bg-white'}`}>
                  <div className={`border-b px-2 pb-2 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
                    <p className="text-xs font-semibold">Admin Nextfarm</p>
                    <p className={`mt-1 text-[10px] ${muted}`}>admin@nextfarm.vn</p>
                  </div>
                  <button
                    className={`mt-2 flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-xs font-medium transition-all duration-150 ${dark ? 'text-[#fca5a5] hover:bg-[#1f2937]' : 'text-red-600 hover:bg-red-50'}`}
                    onClick={logout}
                    type="button"
                  >
                    <LogOut size={15} strokeWidth={1.5} />
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="relative min-h-[calc(100vh-45px)] transition-opacity duration-200">
          {loading ? <ContentSkeleton dark={dark} /> : children}
        </main>
      </section>
    </div>
  );
}

function ContentSkeleton({ dark }: { dark: boolean }) {
  const block = dark ? 'bg-[#1f2937]' : 'bg-slate-200/70';

  return (
    <div className="p-6">
      <div className={`h-5 w-28 animate-pulse rounded ${block}`} />
      <div className={`mt-3 h-8 w-64 animate-pulse rounded ${block}`} />
      <div className="mt-6 grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div className={`h-20 animate-pulse rounded-xl ${block}`} key={item} />
        ))}
      </div>
      <div className={`mt-6 h-[320px] animate-pulse rounded-xl ${block}`} />
    </div>
  );
}
