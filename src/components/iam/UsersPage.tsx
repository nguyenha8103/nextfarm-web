'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  ChevronDown,
  Grid2X2,
  LogOut,
  Mail,
  Moon,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Shield,
  Sun,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react';
import { IamSubsystemSwitcher } from './IamSubsystemSwitcher';
import { HeaderNotificationButton } from '@/components/notification/HeaderNotificationButton';

type Theme = 'light' | 'dark';
type LoadState = 'loading' | 'ready' | 'empty' | 'error';
type UserStatus = 'active' | 'pending' | 'locked';
type UserRole = 'owner' | 'admin' | 'farm_manager' | 'field_worker';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  online: boolean;
  branch: string;
  createdAt: string;
  lastLogin: string;
};

type Invitation = {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  role: UserRole;
  branch: string;
  inviter: string;
  invitedAt: string;
  expiresAt: string;
};

const workspaces = [
  { id: 'binh-dien', initial: 'H', name: 'HTX Nông nghiệp Bình Điền', role: 'Chủ sở hữu', members: 15 },
  { id: 'nong-san-xanh', initial: 'C', name: 'Công ty Nông sản Xanh', role: 'Quản trị viên', members: 8 },
  { id: 'cam-cao-phong', initial: 'C', name: 'HTX Cam Cao Phong', role: 'Quản lý nông trại', members: 12 },
];

const roleLabels: Record<UserRole, string> = {
  owner: 'owner',
  admin: 'admin',
  farm_manager: 'farm_manager',
  field_worker: 'field_worker',
};

const statusLabels: Record<UserStatus, string> = {
  active: 'Hoạt động',
  pending: 'Chưa xác thực',
  locked: 'Đã khóa',
};

const branchOptions = ['Chi nhánh Hồ Chí Minh', 'Chi nhánh Đồng Nai', 'Chi nhánh Long An'];

const initialUsers: UserRecord[] = [
  {
    id: 'u-an',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@htx.vn',
    role: 'owner',
    status: 'active',
    online: true,
    branch: '—',
    createdAt: '20/04/2026 08:30',
    lastLogin: '25/04/2026 10:30',
  },
  {
    id: 'u-binh',
    name: 'Trần Thị Bình',
    email: 'binh.tran@htx.vn',
    role: 'admin',
    status: 'active',
    online: true,
    branch: 'Chi nhánh Hồ Chí Minh',
    createdAt: '19/04/2026 14:15',
    lastLogin: '25/04/2026 09:15',
  },
  {
    id: 'u-cong',
    name: 'Lê Văn Công',
    email: 'cong.le@htx.vn',
    role: 'farm_manager',
    status: 'active',
    online: false,
    branch: 'Chi nhánh Đồng Nai',
    createdAt: '18/04/2026 11:00',
    lastLogin: '24/04/2026 16:45',
  },
  {
    id: 'u-dung',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@htx.vn',
    role: 'field_worker',
    status: 'pending',
    online: false,
    branch: 'Chi nhánh Hồ Chí Minh',
    createdAt: '22/04/2026 09:20',
    lastLogin: 'Chưa đăng nhập',
  },
  {
    id: 'u-em',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@htx.vn',
    role: 'field_worker',
    status: 'locked',
    online: false,
    branch: 'Chi nhánh Long An',
    createdAt: '10/04/2026 08:00',
    lastLogin: '10/04/2026 08:00',
  },
  {
    id: 'u-giang',
    name: 'Đỗ Minh Giang',
    email: 'giang.do@htx.vn',
    role: 'farm_manager',
    status: 'active',
    online: true,
    branch: 'Chi nhánh Đồng Nai',
    createdAt: '09/04/2026 13:40',
    lastLogin: '25/04/2026 08:05',
  },
];

const initialInvitations: Invitation[] = [
  {
    id: 'i-nguyen',
    email: 'nguyen.van.f@example.com',
    status: 'pending',
    role: 'field_worker',
    branch: 'Chi nhánh Hồ Chí Minh',
    inviter: 'Nguyễn Văn An',
    invitedAt: '23/04/2026 10:00',
    expiresAt: '30/04/2026 10:00',
  },
  {
    id: 'i-tran',
    email: 'tran.thi.g@example.com',
    status: 'pending',
    role: 'farm_manager',
    branch: 'Chi nhánh Đồng Nai',
    inviter: 'Nguyễn Văn An',
    invitedAt: '24/04/2026 14:30',
    expiresAt: '01/05/2026 14:30',
  },
  {
    id: 'i-le',
    email: 'le.van.h@example.com',
    status: 'accepted',
    role: 'field_worker',
    branch: 'Chi nhánh Hồ Chí Minh',
    inviter: 'Trần Thị Bình',
    invitedAt: '20/04/2026 09:00',
    expiresAt: '27/04/2026 09:00',
  },
  {
    id: 'i-pham',
    email: 'pham.van.i@example.com',
    status: 'declined',
    role: 'field_worker',
    branch: 'Chi nhánh Long An',
    inviter: 'Nguyễn Văn An',
    invitedAt: '18/04/2026 16:00',
    expiresAt: '25/04/2026 16:00',
  },
  {
    id: 'i-hoang',
    email: 'hoang.thi.k@example.com',
    status: 'expired',
    role: 'farm_manager',
    branch: 'Chi nhánh Đồng Nai',
    inviter: 'Trần Thị Bình',
    invitedAt: '10/04/2026 08:00',
    expiresAt: '17/04/2026 08:00',
  },
];

const menu = [
  { label: 'Tổng quan', icon: Grid2X2, href: '/iam/' },
  { label: 'Người dùng', icon: UsersRound, href: '/iam/users/', active: true },
  { label: 'Nhóm & quyền', icon: Shield, href: '/iam/groups/' },
  { label: 'Chi nhánh', icon: Building2, href: '/iam/branches/' },
  { label: 'Cài đặt', icon: Settings, href: '/iam/settings/' },
];

function emitRealtimeUser(detail: { type: 'add' | 'update' | 'remove'; user?: UserRecord; id?: string }) {
  window.dispatchEvent(new CustomEvent('nextfarm:iam:user', { detail }));
}

export function UsersPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>('loading');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [workspace, setWorkspace] = useState(workspaces[0]);
  const [theme, setTheme] = useState<Theme>('light');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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

    if (storedTheme === 'dark' || storedTheme === 'light') setTheme(storedTheme);

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === '1') {
        setState('error');
        return;
      }
      if (params.get('empty') === '1') {
        setUsers([]);
        setState('empty');
        return;
      }
      setUsers(initialUsers);
      setState('ready');
    }, 650);

    function onRealtime(event: Event) {
      const detail = (event as CustomEvent<{ type: 'add' | 'update' | 'remove'; user?: UserRecord; id?: string }>).detail;
      setUsers((current) => {
        if (detail.type === 'add' && detail.user) return [detail.user, ...current];
        if (detail.type === 'update' && detail.user) return current.map((item) => (item.id === detail.user?.id ? detail.user : item));
        if (detail.type === 'remove' && detail.id) return current.filter((item) => item.id !== detail.id);
        return current;
      });
      setState('ready');
    }

    window.addEventListener('nextfarm:iam:user', onRealtime);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('nextfarm:iam:user', onRealtime);
    };
  }, []);

  useEffect(() => {
    if (state !== 'ready') return;

    const onlineTimer = window.setInterval(() => {
      setUsers((current) => {
        if (!current.length) return current;
        const index = Math.floor(Math.random() * current.length);
        return current.map((user, userIndex) => (userIndex === index ? { ...user, online: !user.online } : user));
      });
    }, 3500);

    return () => window.clearInterval(onlineTimer);
  }, [state]);

  const dark = theme === 'dark';
  const surface = dark ? 'bg-[#111827] border-[#263244]' : 'bg-white border-slate-200/60';
  const muted = dark ? 'text-[#9ca3af]' : 'text-slate-500';
  const divider = dark ? 'border-[#263244]' : 'border-slate-200/60';
  const input = dark ? 'border-[#374151] bg-[#1f2937] text-white' : 'border-slate-200 bg-slate-50 text-slate-900';

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        roleLabels[user.role].toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesBranch = branchFilter === 'all' || user.branch === branchFilter;
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [branchFilter, search, statusFilter, users]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, branchFilter, activeTab]);

  function switchWorkspace(nextWorkspace: typeof workspace) {
    setWorkspace(nextWorkspace);
    setWorkspaceOpen(false);
    setState('loading');
    window.localStorage.setItem('nextfarm:selectedWorkspace', JSON.stringify(nextWorkspace));
    window.setTimeout(() => {
      setUsers(initialUsers.map((user, index) => ({ ...user, online: index % 2 === 0 })));
      setState('ready');
    }, 450);
  }

  function toggleTheme() {
    const nextTheme: Theme = dark ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('nextfarm:theme', nextTheme);
  }

  function logout() {
    window.localStorage.removeItem('nextfarm:selectedWorkspace');
    router.push('/login/');
  }

  function updateRole(userId: string, role: UserRole) {
    const current = users.find((user) => user.id === userId);
    if (!current) return;
    emitRealtimeUser({ type: 'update', user: { ...current, role } });
  }

  function toggleActive(userId: string) {
    const current = users.find((user) => user.id === userId);
    if (!current) return;
    emitRealtimeUser({
      type: 'update',
      user: {
        ...current,
        status: current.status === 'locked' ? 'active' : 'locked',
        online: current.status === 'locked' ? current.online : false,
      },
    });
  }

  return (
    <main className={`relative min-h-[555px] ${dark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`fixed left-0 top-0 h-[555px] min-h-screen w-[256px] border-r px-3 py-4 ${dark ? 'border-[#263244] bg-[#111827]' : 'border-slate-200/60 bg-slate-50'}`}>
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-semibold text-white">N</div>
          <div>
            <p className="text-lg font-medium leading-5">Nextfarm</p>
            <p className={`text-[10px] ${muted}`}>IAM System</p>
          </div>
        </div>

        <IamSubsystemSwitcher dark={dark} />

        <nav className="mt-8 grid gap-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`flex h-10 items-center gap-3 rounded-lg border-l-2 px-3 text-left text-sm font-medium ${
                  item.active
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : dark
                      ? 'text-[#e5e7eb] hover:bg-[#1f2937]'
                      : 'border-transparent text-slate-700 hover:bg-slate-100'
                }`}
                key={item.label}
                onClick={() => {
                  if (item.href) router.push(item.href);
                }}
                type="button"
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-h-[555px] pl-[256px]">
        <header className={`sticky top-0 z-[70] flex h-[45px] items-center justify-between border-b px-[20px] ${surface}`}>
          <div className="relative">
            <button
              className={`flex min-w-[245px] items-center gap-2 rounded-lg px-2 py-1 text-left transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'}`}
              onClick={() => {
                setWorkspaceOpen((current) => !current);
                setProfileOpen(false);
              }}
              type="button"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-xs font-semibold text-white">{workspace.initial}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-semibold leading-4">{workspace.name}</p>
                  <ChevronDown size={12} />
                </div>
                <p className={`text-[10px] ${muted}`}>{workspace.role}</p>
              </div>
            </button>

            {workspaceOpen ? (
              <div className={`absolute left-0 top-[40px] z-[90] w-[286px] rounded-xl border p-2 shadow-md ${surface}`}>
                <p className={`px-2 pb-2 text-[11px] font-medium ${muted}`}>Chuyển workspace</p>
                <div className="grid gap-1">
                  {workspaces.map((item) => (
                    <button
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'}`}
                      key={item.id}
                      onClick={() => switchWorkspace(item)}
                      type="button"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">{item.initial}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{item.name}</span>
                        <span className={`text-[10px] ${muted}`}>{item.role} · {item.members} thành viên</span>
                      </span>
                      {item.id === workspace.id ? <Check className="text-emerald-600" size={16} /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            <button className={`flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'}`} onClick={toggleTheme} type="button">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <HeaderNotificationButton dark={dark} />
            <div className="relative">
              <button
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#009688] text-xs font-semibold text-white"
                onClick={() => {
                  setProfileOpen((current) => !current);
                  setWorkspaceOpen(false);
                }}
                type="button"
              >
                A
              </button>
              {profileOpen ? (
                <div className={`absolute right-0 top-[34px] z-[90] w-[210px] rounded-xl border p-2 shadow-md ${surface}`}>
                  <div className={`border-b px-2 pb-2 ${divider}`}>
                    <p className="text-xs font-semibold">Admin Nextfarm</p>
                    <p className={`mt-1 text-[10px] ${muted}`}>admin@nextfarm.vn</p>
                  </div>
                  <button className={`mt-2 flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-xs font-medium ${dark ? 'text-[#fca5a5] hover:bg-[#1f2937]' : 'text-[#dc2626] hover:bg-[#fef2f2]'}`} onClick={logout} type="button">
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="px-[16px] pb-8 pt-[19px]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold leading-7">Quản lý người dùng</h1>
              <p className={`mt-1 text-xs ${muted}`}>Quản lý người dùng và lời mời trong tổ chức</p>
            </div>
            <div className="flex gap-2">
              <button className={`flex h-[30px] items-center gap-2 rounded-xl border px-3 text-xs font-medium ${surface}`} onClick={() => setInviteOpen(true)} type="button">
                <UserPlus size={14} />
                Mời người dùng
              </button>
              <button className="flex h-[30px] items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white" onClick={() => setCreateOpen(true)} type="button">
                <Plus size={14} />
                Tạo người dùng
              </button>
            </div>
          </div>

          <div className={`mt-5 flex border-b ${divider}`}>
            <button className={`h-10 border-b-2 px-3 text-xs font-medium ${activeTab === 'users' ? 'border-emerald-600 text-emerald-600' : `border-transparent ${muted}`}`} onClick={() => setActiveTab('users')} type="button">
              Danh sách người dùng
            </button>
            <button className={`h-10 border-b-2 px-3 text-xs font-medium ${activeTab === 'invites' ? 'border-emerald-600 text-emerald-600' : `border-transparent ${muted}`}`} onClick={() => setActiveTab('invites')} type="button">
              Lời mời
            </button>
          </div>

          <section className={`mt-[12px] rounded-xl border px-[16px] py-[15px] ${surface}`}>
            {state === 'loading' ? (
              <UsersLoading dark={dark} />
            ) : state === 'error' ? (
              <StateMessage title="Không tải được dữ liệu" description="Vui lòng thử lại hoặc kiểm tra kết nối realtime." tone="error" onRetry={() => { setState('loading'); window.setTimeout(() => { setUsers(initialUsers); setState('ready'); }, 450); }} />
            ) : activeTab === 'users' ? (
              <>
                <UserToolbar
                  branchFilter={branchFilter}
                  input={input}
                  search={search}
                  setBranchFilter={setBranchFilter}
                  setSearch={setSearch}
                  setStatusFilter={setStatusFilter}
                  statusFilter={statusFilter}
                />
                {state === 'empty' || !visibleUsers.length ? (
                  <StateMessage title="Chưa có người dùng" description="Người dùng mới sẽ xuất hiện realtime sau khi tạo hoặc nhận invite." tone="empty" />
                ) : (
                  <UserTable
                    dark={dark}
                    divider={divider}
                    input={input}
                    muted={muted}
                    onRoleChange={updateRole}
                    onToggleActive={toggleActive}
                    users={visibleUsers}
                  />
                )}
                <Pagination current={page} total={totalPages} onChange={setPage} muted={muted} />
              </>
            ) : (
              <InviteTable dark={dark} divider={divider} input={input} invitations={invitations} muted={muted} setInvitations={setInvitations} />
            )}
          </section>
        </div>
      </section>

      {inviteOpen ? <InviteModal dark={dark} input={input} onClose={() => setInviteOpen(false)} onInvite={(invite) => { setInvitations((current) => [invite, ...current]); setInviteOpen(false); setActiveTab('invites'); }} /> : null}
      {createOpen ? <CreateUserModal dark={dark} input={input} onClose={() => setCreateOpen(false)} onCreate={(user) => { emitRealtimeUser({ type: 'add', user }); setCreateOpen(false); setActiveTab('users'); }} /> : null}
    </main>
  );
}

function UserToolbar({
  branchFilter,
  input,
  search,
  setBranchFilter,
  setSearch,
  setStatusFilter,
  statusFilter,
}: {
  branchFilter: string;
  input: string;
  search: string;
  setBranchFilter: (value: string) => void;
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  statusFilter: string;
}) {
  return (
    <div className="mb-[16px] flex gap-3">
      <label className={`flex h-7 w-[36px] shrink-0 items-center justify-center rounded-lg border ${input}`}>
        <Search size={15} />
      </label>
      <input
        className={`h-7 min-w-[180px] flex-1 rounded-xl border px-3 text-xs outline-none ${input}`}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Tìm tên, email hoặc role"
        value={search}
      />
      <select className={`h-7 min-w-[220px] rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
        <option value="all">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="pending">Chưa xác thực</option>
        <option value="locked">Đã khóa</option>
      </select>
      <select className={`h-7 min-w-[240px] rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setBranchFilter(event.target.value)} value={branchFilter}>
        <option value="all">Tất cả chi nhánh</option>
        {branchOptions.map((branch) => (
          <option key={branch} value={branch}>{branch}</option>
        ))}
      </select>
    </div>
  );
}

function UserTable({
  dark,
  divider,
  input,
  muted,
  onRoleChange,
  onToggleActive,
  users,
}: {
  dark: boolean;
  divider: string;
  input: string;
  muted: string;
  onRoleChange: (id: string, role: UserRole) => void;
  onToggleActive: (id: string) => void;
  users: UserRecord[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        <thead className={dark ? 'bg-[#1f2937]' : 'bg-slate-50'}>
          <tr className={muted}>
            <th className="px-3 py-[10px] font-medium">Tên</th>
            <th className="px-3 py-[10px] font-medium">Email</th>
            <th className="px-3 py-[10px] font-medium">Role</th>
            <th className="px-3 py-[10px] font-medium">Status</th>
            <th className="px-3 py-[10px] font-medium">Online</th>
            <th className="px-3 py-[10px] font-medium">CreatedAt</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr className={`border-b ${divider}`} key={user.id}>
              <td className="px-3 py-[9px]">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#009688] text-[11px] font-semibold text-white">{user.name.trim()[0]}</span>
                  <span className="font-medium">{user.name}</span>
                </div>
              </td>
              <td className="px-3 py-[9px]">{user.email}</td>
              <td className="px-3 py-[9px]">
                <select className={`h-7 rounded-xl border px-2 text-[11px] outline-none ${input}`} onChange={(event) => onRoleChange(user.id, event.target.value as UserRole)} value={user.role}>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-[9px]">
                <button onClick={() => onToggleActive(user.id)} type="button">
                  <StatusBadge status={user.status} />
                </button>
              </td>
              <td className="px-3 py-[9px]">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${user.online ? 'bg-emerald-50 text-emerald-600' : dark ? 'bg-[#1f2937] text-[#9ca3af]' : 'bg-[#eef0f3] text-slate-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${user.online ? 'bg-emerald-600' : 'bg-[#9ca3af]'}`} />
                  {user.online ? 'Online' : 'Offline'}
                </span>
              </td>
              <td className="px-3 py-[9px]">{user.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InviteTable({
  dark,
  divider,
  input,
  invitations,
  muted,
  setInvitations,
}: {
  dark: boolean;
  divider: string;
  input: string;
  invitations: Invitation[];
  muted: string;
  setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>;
}) {
  return (
    <>
      <div className="mb-[16px] flex gap-3">
        <label className={`flex h-7 w-[36px] shrink-0 items-center justify-center rounded-lg border ${input}`}>
          <Mail size={15} />
        </label>
        <select className={`h-7 flex-1 rounded-xl border px-3 text-xs outline-none ${input}`}>
          <option>Tất cả trạng thái</option>
          <option>Đang chờ</option>
          <option>Đã chấp nhận</option>
          <option>Đã từ chối</option>
          <option>Đã hết hạn</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-xs">
          <thead className={dark ? 'bg-[#1f2937]' : 'bg-slate-50'}>
            <tr className={muted}>
              <th className="px-3 py-[10px] font-medium">Email</th>
              <th className="px-3 py-[10px] font-medium">Trạng thái</th>
              <th className="px-3 py-[10px] font-medium">Nhóm quyền</th>
              <th className="px-3 py-[10px] font-medium">Chi nhánh</th>
              <th className="px-3 py-[10px] font-medium">Người mời</th>
              <th className="px-3 py-[10px] font-medium">Ngày mời</th>
              <th className="px-3 py-[10px] font-medium">Hết hạn</th>
              <th className="px-3 py-[10px] text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invite) => (
              <tr className={`border-b ${divider}`} key={invite.id}>
                <td className="px-3 py-[9px] font-medium">{invite.email}</td>
                <td className="px-3 py-[9px]"><InviteBadge status={invite.status} /></td>
                <td className="px-3 py-[9px]"><RoleBadge role={invite.role} /></td>
                <td className="px-3 py-[9px]">{invite.branch}</td>
                <td className="px-3 py-[9px]">{invite.inviter}</td>
                <td className="px-3 py-[9px]">{invite.invitedAt}</td>
                <td className="px-3 py-[9px]">{invite.expiresAt}</td>
                <td className="px-3 py-[9px]">
                  <div className="flex justify-end gap-4">
                    <button title="Gửi lại lời mời" type="button"><RefreshCcw size={13} /></button>
                    {invite.status === 'pending' ? (
                      <button className="text-[#dc2626]" onClick={() => setInvitations((current) => current.filter((item) => item.id !== invite.id))} title="Hủy lời mời" type="button">
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const tone =
    status === 'active'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
      : status === 'pending'
        ? 'border-[#fed7aa] bg-[#fff7ed] text-[#f97316]'
        : 'border-[#fecaca] bg-[#fef2f2] text-[#ef4444]';

  return <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${tone}`}>{statusLabels[status]}</span>;
}

function RoleBadge({ role }: { role: UserRole }) {
  return <span className="rounded bg-[#edeff3] px-2 py-1 text-[10px] text-slate-500">{roleLabels[role]}</span>;
}

function InviteBadge({ status }: { status: Invitation['status'] }) {
  const map = {
    pending: ['Đang chờ', 'border-[#bae6fd] bg-[#ecfeff] text-[#0891b2]'],
    accepted: ['Đã chấp nhận', 'border-emerald-200 bg-emerald-50 text-emerald-600'],
    declined: ['Đã từ chối', 'border-[#fecaca] bg-[#fef2f2] text-[#ef4444]'],
    expired: ['Đã hết hạn', 'border-[#d1d5db] bg-slate-50 text-[#6b7280]'],
  } satisfies Record<Invitation['status'], [string, string]>;
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-medium ${map[status][1]}`}>{map[status][0]}</span>;
}

function Pagination({ current, muted, onChange, total }: { current: number; muted: string; onChange: (page: number) => void; total: number }) {
  return (
    <div className={`mt-3 flex items-center justify-end gap-3 text-xs ${muted}`}>
      <span>Trang {current}/{total}</span>
      <button className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50" disabled={current <= 1} onClick={() => onChange(current - 1)} type="button">
        Trước
      </button>
      <button className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50" disabled={current >= total} onClick={() => onChange(current + 1)} type="button">
        Sau
      </button>
    </div>
  );
}

function UsersLoading({ dark }: { dark: boolean }) {
  const skeleton = dark ? 'bg-[#1f2937]' : 'bg-slate-100';
  return (
    <div className="grid gap-3">
      <div className={`h-7 animate-pulse rounded-lg ${skeleton}`} />
      <div className={`h-[220px] animate-pulse rounded-lg ${skeleton}`} />
    </div>
  );
}

function StateMessage({ description, onRetry, title, tone }: { description: string; onRetry?: () => void; title: string; tone: 'empty' | 'error' }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <p className={`text-sm font-semibold ${tone === 'error' ? 'text-[#dc2626]' : ''}`}>{title}</p>
      <p className="mt-2 max-w-sm text-xs text-slate-500">{description}</p>
      {onRetry ? (
        <button className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white" onClick={onRetry} type="button">
          Thử lại
        </button>
      ) : null}
    </div>
  );
}

function InviteModal({ dark, input, onClose, onInvite }: { dark: boolean; input: string; onClose: () => void; onInvite: (invite: Invitation) => void }) {
  const [email, setEmail] = useState('example@nextfarm.vn');
  const [role, setRole] = useState<UserRole>('field_worker');
  const [branch, setBranch] = useState(branchOptions[0]);

  return (
    <ModalFrame dark={dark} title="Mời người dùng" icon={<Mail size={17} />} onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onInvite({
            id: `i-${Date.now()}`,
            email,
            role,
            branch,
            status: 'pending',
            inviter: 'Admin Nextfarm',
            invitedAt: '27/04/2026 09:30',
            expiresAt: '04/05/2026 09:30',
          });
        }}
      >
        <Field label="Email *"><input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setEmail(event.target.value)} value={email} /></Field>
        <p className="mt-[-6px] text-[10px] text-slate-500">Lời mời sẽ được gửi đến địa chỉ email này</p>
        <Field label="Nhóm quyền *">
          <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setRole(event.target.value as UserRole)} value={role}>
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field label="Chi nhánh">
          <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setBranch(event.target.value)} value={branch}>
            {branchOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <div className="rounded-lg border border-[#bae6fd] bg-[#ecfeff] px-3 py-2 text-[11px] leading-5 text-[#0891b2]">
          Lưu ý: Lời mời sẽ có hiệu lực trong 7 ngày. Người nhận có thể chấp nhận hoặc từ chối lời mời thông qua email.
        </div>
        <ModalActions onClose={onClose} submitLabel="Gửi lời mời" />
      </form>
    </ModalFrame>
  );
}

function CreateUserModal({ dark, input, onClose, onCreate }: { dark: boolean; input: string; onClose: () => void; onCreate: (user: UserRecord) => void }) {
  const [name, setName] = useState('Nguyễn Văn A');
  const [email, setEmail] = useState('example@nextfarm.vn');
  const [password, setPassword] = useState('SecurePass1');
  const [role, setRole] = useState<UserRole>('field_worker');
  const [branch, setBranch] = useState(branchOptions[0]);

  return (
    <ModalFrame dark={dark} title="Thêm người dùng" onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate({
            id: `u-${Date.now()}`,
            name,
            email,
            role,
            branch,
            status: 'active',
            online: true,
            createdAt: '27/04/2026 09:30',
            lastLogin: 'Chưa đăng nhập',
          });
        }}
      >
        <Field label="Họ và tên *"><input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setName(event.target.value)} value={name} /></Field>
        <Field label="Email *"><input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setEmail(event.target.value)} value={email} /></Field>
        <Field label="Mật khẩu ban đầu *"><input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setPassword(event.target.value)} type="password" value={password} /></Field>
        <p className="mt-[-6px] text-[10px] text-slate-500">Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</p>
        <Field label="Nhóm quyền *">
          <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setRole(event.target.value as UserRole)} value={role}>
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field label="Chi nhánh">
          <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setBranch(event.target.value)} value={branch}>
            {branchOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <ModalActions onClose={onClose} submitLabel="Tạo người dùng" />
      </form>
    </ModalFrame>
  );
}

function ModalFrame({ children, dark, icon, onClose, title }: { children: React.ReactNode; dark: boolean; icon?: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45">
      <section className={`w-[348px] overflow-hidden rounded-lg shadow-xl ${dark ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`flex h-[58px] items-center justify-between border-b px-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
          <div className="flex items-center gap-3">
            {icon ? <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">{icon}</span> : null}
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-[11px] font-medium">
      {label}
      {children}
    </label>
  );
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="mt-3 flex justify-end gap-2 border-t border-slate-200/60 pt-4">
      <button className="h-8 rounded-lg border border-slate-200 px-4 text-xs font-medium" onClick={onClose} type="button">Hủy</button>
      <button className="h-8 rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white" type="submit">{submitLabel}</button>
    </div>
  );
}
