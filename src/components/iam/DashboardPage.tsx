'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Building2,
  Check,
  ChevronDown,
  Grid2X2,
  LogOut,
  Moon,
  Settings,
  Shield,
  Sprout,
  Sun,
  UsersRound,
} from 'lucide-react';
import { IamSubsystemSwitcher } from './IamSubsystemSwitcher';

const workspaces = [
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

const stats = [
  { label: 'Tổng người dùng', value: 5, icon: UsersRound, bg: 'bg-[#dcfce7]', color: 'text-[#16a34a]' },
  { label: 'Đang hoạt động', value: 3, icon: Activity, bg: 'bg-[#dcfce7]', color: 'text-[#16a34a]' },
  { label: 'Nhóm quyền', value: 4, icon: Shield, bg: 'bg-[#dff7ff]', color: 'text-[#0891b2]' },
  { label: 'Chi nhánh', value: 3, icon: Building2, bg: 'bg-[#ffedd5]', color: 'text-[#f97316]' },
];

const loadedActivities = [
  { id: 'a1', tone: 'bg-[#0891b2]', title: 'Nguyễn Văn An đã đăng nhập', time: '2 phút trước' },
  { id: 'a2', tone: 'bg-[#16a34a]', title: 'Đã tạo nhóm quyền "Farm Manager"', time: '15 phút trước' },
  { id: 'a3', tone: 'bg-[#0891b2]', title: 'Trần Thị Bình đã cập nhật thông tin', time: '1 giờ trước' },
  { id: 'a4', tone: 'bg-[#16a34a]', title: 'Đã thêm chi nhánh mới "Long An"', time: '2 giờ trước' },
];

const branchDistribution = [
  { name: 'Chi nhánh HCM', users: 12, width: '49%', color: 'bg-[#16a34a]' },
  { name: 'Chi nhánh Đồng Nai', users: 8, width: '32%', color: 'bg-[#0891b2]' },
  { name: 'Chi nhánh Long An', users: 5, width: '20%', color: 'bg-[#16a34a]' },
];

const menu = [
  { label: 'Tổng quan', icon: Grid2X2, active: true, href: '/iam/' },
  { label: 'Người dùng', icon: UsersRound, href: '/iam/users/' },
  { label: 'Nhóm & quyền', icon: Shield, href: '/iam/groups/' },
  { label: 'Chi nhánh', icon: Building2, href: '/iam/branches/' },
  { label: 'Cài đặt', icon: Settings, href: '/iam/settings/' },
];

type LoadState = 'loading' | 'ready' | 'empty';
type Theme = 'light' | 'dark';

export function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>('loading');
  const [workspace, setWorkspace] = useState(workspaces[0]);
  const [theme, setTheme] = useState<Theme>('light');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const storedWorkspace = window.localStorage.getItem('nextfarm:selectedWorkspace');
    const storedTheme = window.localStorage.getItem('nextfarm:theme') as Theme | null;

    if (storedWorkspace) {
      try {
        setWorkspace(JSON.parse(storedWorkspace));
      } catch {
        window.localStorage.removeItem('nextfarm:selectedWorkspace');
      }
    }

    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setState(params.get('empty') === '1' ? 'empty' : 'ready');
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  const dark = theme === 'dark';
  const activities = state === 'ready' ? loadedActivities : [];
  const surface = dark ? 'bg-[#111827] border-[#263244]' : 'bg-white border-[#e1e4e8]';
  const muted = dark ? 'text-[#9ca3af]' : 'text-[#687084]';
  const divider = dark ? 'border-[#263244]' : 'border-[#e1e4e8]';

  function switchWorkspace(nextWorkspace: typeof workspace) {
    setWorkspace(nextWorkspace);
    setWorkspaceOpen(false);
    setState('loading');
    window.localStorage.setItem('nextfarm:selectedWorkspace', JSON.stringify(nextWorkspace));
    window.setTimeout(() => setState('ready'), 450);
  }

  function toggleTheme() {
    const nextTheme: Theme = dark ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('nextfarm:theme', nextTheme);
  }

  function logout() {
    window.localStorage.removeItem('nextfarm:selectedWorkspace');
    setProfileOpen(false);
    router.push('/login/');
  }

  return (
    <main className={`relative min-h-[555px] ${dark ? 'bg-[#0b1120] text-white' : 'bg-white text-black'}`}>
      <aside className={`fixed left-0 top-0 h-[555px] min-h-screen w-[190px] border-r px-[6px] py-[18px] ${dark ? 'border-[#263244] bg-[#111827]' : 'border-[#e1e4e8] bg-[#f4f7fb]'}`}>
        <div className="flex items-center gap-2 px-[5px]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#16a34a] text-sm font-extrabold text-white">
            N
          </div>
          <div>
            <p className="text-xl font-bold leading-6">Nextfarm</p>
            <p className={`text-[10px] ${muted}`}>IAM System</p>
          </div>
        </div>

        <IamSubsystemSwitcher dark={dark} />

        <nav className="mt-7 grid gap-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`flex h-[34px] items-center gap-3 rounded-md px-3 text-left text-[13px] font-bold ${
                  item.active
                    ? 'bg-[#16a34a] text-white'
                    : dark
                      ? 'text-[#e5e7eb] hover:bg-[#1f2937]'
                      : 'text-[#111827] hover:bg-white'
                }`}
                key={item.label}
                onClick={() => {
                  if (item.href) router.push(item.href);
                }}
                type="button"
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-h-[555px] pl-[190px]">
        <header className={`flex h-[49px] items-center justify-between border-b px-[27px] ${surface}`}>
          <div className="relative">
            <button
              className={`flex min-w-[255px] items-center gap-2 rounded-md px-2 py-1 text-left transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f4f7fb]'}`}
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
              <div className={`absolute left-0 top-[42px] z-30 w-[286px] rounded-lg border p-2 shadow-lg ${surface}`}>
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
            <button
              aria-label={dark ? 'Chuyển theme sáng' : 'Chuyển theme tối'}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f4f7fb]'}`}
              onClick={toggleTheme}
              title={dark ? 'Theme sáng' : 'Theme tối'}
              type="button"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button
                aria-label="Tài khoản"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#009688] text-xs font-extrabold text-white"
                onClick={() => {
                  setProfileOpen((current) => !current);
                  setWorkspaceOpen(false);
                }}
                type="button"
              >
                A
              </button>

              {profileOpen ? (
                <div className={`absolute right-0 top-[36px] z-30 w-[210px] rounded-lg border p-2 shadow-lg ${surface}`}>
                  <div className={`border-b px-2 pb-2 ${divider}`}>
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

        <div className="px-[18px] pb-10 pt-[18px]">
          <h1 className="text-2xl font-extrabold leading-7">Tổng quan</h1>
          <p className={`mt-2 text-xs ${muted}`}>Thống kê hệ thống IAM</p>

          {state === 'loading' ? (
            <DashboardLoading dark={dark} />
          ) : (
            <>
              <div className="mt-[18px] grid grid-cols-4 gap-[17px] max-lg:grid-cols-2">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article className={`flex h-[84px] items-center justify-between rounded-lg border px-[18px] shadow-sm ${surface}`} key={stat.label}>
                      <div>
                        <p className={`text-xs ${muted}`}>{stat.label}</p>
                        <p className="mt-2 text-2xl font-extrabold">{stat.value}</p>
                      </div>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                        <Icon size={20} />
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-[18px] grid grid-cols-2 gap-[17px] max-lg:grid-cols-1">
                <section className={`min-h-[253px] rounded-lg border px-[18px] py-[19px] shadow-sm ${surface}`}>
                  <h2 className="text-base font-extrabold">Hoạt động gần đây</h2>
                  {activities.length ? (
                    <div className="mt-2 grid">
                      {activities.map((activity) => (
                        <div className={`flex gap-3 border-b py-[6px] last:border-b-0 ${divider}`} key={activity.id}>
                          <span className={`mt-1 h-[6px] w-[6px] rounded-full ${activity.tone}`} />
                          <div>
                            <p className="text-xs leading-4">{activity.title}</p>
                            <p className={`text-[10px] leading-4 ${muted}`}>{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyActivity muted={muted} />
                  )}
                </section>

                <section className={`min-h-[253px] rounded-lg border px-[18px] py-[19px] shadow-sm ${surface}`}>
                  <h2 className="text-base font-extrabold">Phân bổ người dùng theo chi nhánh</h2>
                  <div className="mt-3 grid gap-[12px]">
                    {branchDistribution.map((branch) => (
                      <div key={branch.name}>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span>{branch.name}</span>
                          <span className={muted}>{branch.users} người</span>
                        </div>
                        <div className={`h-[5px] overflow-hidden rounded-full ${dark ? 'bg-[#374151]' : 'bg-[#e8e8ec]'}`}>
                          <div className={`h-full rounded-full ${branch.color}`} style={{ width: branch.width }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </section>

      <button
        aria-label="Trợ giúp"
        className={`absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border text-lg shadow-sm ${dark ? 'border-[#263244] bg-[#111827] text-[#d1d5db]' : 'border-[#e2e2e2] bg-white text-[#4b5563]'}`}
        type="button"
      >
        ?
      </button>
    </main>
  );
}

function DashboardLoading({ dark }: { dark: boolean }) {
  const skeleton = dark ? 'border-[#263244] bg-[#1f2937]' : 'border-[#e1e4e8] bg-[#f5f7f8]';

  return (
    <div className="mt-[18px] grid gap-[18px]">
      <div className="grid grid-cols-4 gap-[17px] max-lg:grid-cols-2">
        {stats.map((stat) => (
          <div className={`h-[84px] animate-pulse rounded-lg border ${skeleton}`} key={stat.label} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-[17px] max-lg:grid-cols-1">
        <div className={`h-[253px] animate-pulse rounded-lg border ${skeleton}`} />
        <div className={`h-[253px] animate-pulse rounded-lg border ${skeleton}`} />
      </div>
    </div>
  );
}

function EmptyActivity({ muted }: { muted: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef8f0] text-[#16a34a]">
        <Sprout size={20} />
      </div>
      <p className="mt-3 text-sm font-bold">Chưa có hoạt động</p>
      <p className={`mt-1 text-xs ${muted}`}>Activity mới sẽ xuất hiện tại đây sau khi người dùng thao tác.</p>
    </div>
  );
}
