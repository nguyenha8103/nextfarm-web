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
  const surface = dark ? 'border-[#263244] bg-[#111827]' : 'border-[#e1e4e8] bg-white';
  const muted = dark ? 'text-[#9ca3af]' : 'text-[#687084]';

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
    <div className={`min-h-screen ${dark ? 'bg-[#0b1120] text-white' : 'bg-white text-black'}`}>
      <aside className={`fixed left-0 top-0 h-screen w-[256px] border-r px-[10px] py-[14px] transition-opacity duration-200 ${dark ? 'border-[#263244] bg-[#111827]' : 'border-[#e1e4e8] bg-[#f4f7fb]'}`}>
        <div className="flex items-center gap-2 px-[7px]">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#16a34a] text-xs font-extrabold text-white">
            N
          </div>
          <div>
            <p className="text-lg font-bold leading-5">Nextfarm</p>
            <p className={`text-[10px] ${muted}`}>Hệ thống quản lý</p>
          </div>
        </div>
        <nav className="mt-7 grid gap-1" key={currentModule.id}>
          <Link
            className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${dark ? 'text-[#e5e7eb] hover:bg-[#1f2937]' : 'text-[#1f2937] hover:bg-white'}`}
            href="/iam/"
            onClick={() => window.sessionStorage.setItem('nextfarm:navigatingSubsystem', 'admin')}
          >
            <Shield size={18} />
            Quản trị
          </Link>
          <div className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium ${dark ? 'bg-[#123421] text-[#86efac]' : 'bg-[#e8f5e9] text-[#15803d]'}`}>
            <Sprout size={18} />
            Nông nghiệp
          </div>

          <div className="mt-3 grid gap-1 border-t border-[#dbe3dc] pt-3">
            {farmModules.map((module) => {
              const ModuleIcon = module.icon;
              const moduleActive = currentModule.id === module.id;

              return (
                <Link
                  className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                    moduleActive
                      ? 'bg-[#16a34a] text-white'
                      : dark
                        ? 'text-[#e5e7eb] hover:bg-[#1f2937]'
                        : 'text-[#1f2937] hover:bg-white'
                  }`}
                  href={module.href}
                  key={module.id}
                  onClick={() => window.sessionStorage.setItem('nextfarm:navigatingModule', module.id)}
                >
                  <ModuleIcon size={18} />
                  <span className="min-w-0 flex-1 truncate">{module.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
      <section className="min-h-screen pl-[256px]">
        <header className={`flex h-[45px] items-center justify-between border-b px-[20px] ${surface}`}>
          <div className="relative">
            <button
              className={`flex min-w-[245px] items-center gap-2 rounded-md px-2 py-1 text-left transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f4f7fb]'}`}
              onClick={() => {
                setWorkspaceOpen((current) => !current);
                setProfileOpen(false);
              }}
              type="button"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#16a34a] text-xs font-extrabold text-white">
                {workspace.initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-extrabold leading-4">{workspace.name}</p>
                  <ChevronDown size={12} />
                </div>
                <p className={`text-[10px] ${muted}`}>{workspace.role}</p>
              </div>
            </button>

            {workspaceOpen ? (
              <div className={`absolute left-0 top-[42px] z-40 w-[286px] rounded-lg border p-2 shadow-lg ${surface}`}>
                <p className={`px-2 pb-2 text-[11px] font-bold ${muted}`}>Chuyển workspace</p>
                <div className="grid gap-1">
                  {workspaces.map((item) => (
                    <button
                      className={`flex items-center gap-3 rounded-md px-2 py-2 text-left transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f4f7fb]'}`}
                      key={item.id}
                      onClick={() => switchWorkspace(item)}
                      type="button"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#16a34a] text-sm font-extrabold text-white">
                        {item.initial}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold">{item.name}</span>
                        <span className={`text-[10px] ${muted}`}>{item.role} · {item.members} thành viên</span>
                      </span>
                      {item.id === workspace.id ? <Check className="text-[#16a34a]" size={16} /> : null}
                    </button>
                  ))}
                </div>
                <button
                  className={`mt-2 h-8 w-full rounded-md border border-dashed text-xs font-bold ${dark ? 'border-[#374151] text-[#e5e7eb]' : 'border-[#d8dce3] text-[#111827]'}`}
                  onClick={() => router.push('/select-workspace/')}
                  type="button"
                >
                  Tạo workspace mới
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            <button className={`flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f4f7fb]'}`} onClick={toggleTheme} type="button">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="relative">
              <button
                aria-label="Thông báo"
                className={`relative flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f4f7fb]'}`}
                onClick={() => {
                  setNotificationOpen((current) => !current);
                  setProfileOpen(false);
                  setWorkspaceOpen(false);
                }}
                type="button"
              >
                <Bell size={17} />
                {unreadCount ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-extrabold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notificationOpen ? (
                <div className={`absolute right-0 top-[38px] z-40 w-[360px] rounded-xl border p-2 shadow-lg ${surface}`}>
                  <div className={`flex items-center justify-between border-b px-2 pb-2 ${dark ? 'border-[#263244]' : 'border-[#e1e4e8]'}`}>
                    <div>
                      <p className="text-sm font-extrabold">Thông báo</p>
                      <p className={`mt-0.5 text-[10px] ${muted}`}>{unreadCount} chưa đọc</p>
                    </div>
                    <Link className="text-xs font-bold text-[#16a34a]" href="/notifications/" onClick={() => setNotificationOpen(false)}>
                      Xem tất cả
                    </Link>
                  </div>
                  <div className="mt-2 grid max-h-[370px] gap-1 overflow-auto">
                    {notifications.slice(0, 10).map((item) => (
                      <Link
                        className={`rounded-lg px-2 py-2 transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f8fafc]'} ${item.read ? '' : dark ? 'bg-[#123421]' : 'bg-[#f0fdf4]'}`}
                        href={`/notifications/${item.id}/`}
                        key={item.id}
                        onClick={() => setNotificationOpen(false)}
                      >
                        <div className="flex items-start gap-2">
                          {!item.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#16a34a]" /> : <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" />}
                          <div className="min-w-0">
                            <p className={`truncate text-xs ${item.read ? 'font-semibold' : 'font-extrabold'}`}>{item.title}</p>
                            <p className={`mt-1 line-clamp-2 text-[11px] leading-4 ${muted}`}>{item.body}</p>
                            <p className={`mt-1 text-[10px] ${muted}`}>{item.time}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className={`mt-2 border-t pt-2 ${dark ? 'border-[#263244]' : 'border-[#e1e4e8]'}`}>
                    <button className="h-8 w-full rounded-lg border border-[#16a34a] text-xs font-bold text-[#16a34a]" type="button">
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                aria-label="Tài khoản"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#009688] text-xs font-extrabold text-white"
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
                <div className={`absolute right-0 top-[36px] z-40 w-[210px] rounded-lg border p-2 shadow-lg ${surface}`}>
                  <div className={`border-b px-2 pb-2 ${dark ? 'border-[#263244]' : 'border-[#e1e4e8]'}`}>
                    <p className="text-xs font-extrabold">Admin Nextfarm</p>
                    <p className={`mt-1 text-[10px] ${muted}`}>admin@nextfarm.vn</p>
                  </div>
                  <button
                    className={`mt-2 flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-bold transition ${dark ? 'text-[#fca5a5] hover:bg-[#1f2937]' : 'text-[#dc2626] hover:bg-[#fef2f2]'}`}
                    onClick={logout}
                    type="button"
                  >
                    <LogOut size={15} />
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
  const block = dark ? 'bg-[#1f2937]' : 'bg-[#eef1f4]';

  return (
    <div className="p-6">
      <div className={`h-5 w-28 animate-pulse rounded ${block}`} />
      <div className={`mt-3 h-8 w-64 animate-pulse rounded ${block}`} />
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div className={`h-20 animate-pulse rounded-lg ${block}`} key={item} />
        ))}
      </div>
      <div className={`mt-5 h-[320px] animate-pulse rounded-lg ${block}`} />
    </div>
  );
}
