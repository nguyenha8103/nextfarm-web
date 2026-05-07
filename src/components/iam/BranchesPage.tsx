'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  ChevronDown,
  Grid2X2,
  LogOut,
  MapPin,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import { IamSubsystemSwitcher } from './IamSubsystemSwitcher';
import { HeaderNotificationButton } from '@/components/notification/HeaderNotificationButton';

type Theme = 'light' | 'dark';

type Workspace = {
  id: string;
  initial: string;
  name: string;
  role: string;
  members: number;
};

type Branch = {
  id: string;
  name: string;
  address: string;
  manager: string;
  assignedUserIds: string[];
  createdAt: string;
};

type AssignableUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const workspaces: Workspace[] = [
  { id: 'binh-dien', initial: 'H', name: 'HTX Nông nghiệp Bình Điền', role: 'Chủ sở hữu', members: 15 },
  { id: 'nong-san-xanh', initial: 'C', name: 'Công ty Nông sản Xanh', role: 'Quản trị viên', members: 8 },
  { id: 'cam-cao-phong', initial: 'C', name: 'HTX Cam Cao Phong', role: 'Quản lý nông trại', members: 12 },
];

const users: AssignableUser[] = [
  { id: 'u-an', name: 'Nguyễn Văn An', email: 'an.nguyen@htx.vn', role: 'Owner' },
  { id: 'u-binh', name: 'Trần Thị Bình', email: 'binh.tran@htx.vn', role: 'Admin' },
  { id: 'u-cong', name: 'Lê Văn Công', email: 'cong.le@htx.vn', role: 'Farm Manager' },
  { id: 'u-dung', name: 'Phạm Thị Dung', email: 'dung.pham@htx.vn', role: 'Field Worker' },
  { id: 'u-em', name: 'Hoàng Văn Em', email: 'em.hoang@htx.vn', role: 'Field Worker' },
  { id: 'u-giang', name: 'Đỗ Minh Giang', email: 'giang.do@htx.vn', role: 'Farm Manager' },
];

const initialBranches: Branch[] = [
  {
    id: 'hcm',
    name: 'Chi nhánh Hồ Chí Minh',
    address: 'Khu nông nghiệp công nghệ cao, Củ Chi, TP. Hồ Chí Minh',
    manager: 'Trần Thị Bình',
    assignedUserIds: ['u-binh', 'u-dung'],
    createdAt: '12/04/2026',
  },
  {
    id: 'dong-nai',
    name: 'Chi nhánh Đồng Nai',
    address: 'Xã Xuân Lộc, Đồng Nai',
    manager: 'Lê Văn Công',
    assignedUserIds: ['u-cong', 'u-giang'],
    createdAt: '15/04/2026',
  },
  {
    id: 'long-an',
    name: 'Chi nhánh Long An',
    address: 'Huyện Đức Hòa, Long An',
    manager: 'Hoàng Văn Em',
    assignedUserIds: ['u-em'],
    createdAt: '20/04/2026',
  },
];

const menu = [
  { label: 'Tổng quan', icon: Grid2X2, href: '/iam/' },
  { label: 'Người dùng', icon: UsersRound, href: '/iam/users/' },
  { label: 'Nhóm & quyền', icon: Shield, href: '/iam/groups/' },
  { label: 'Chi nhánh', icon: Building2, href: '/iam/branches/', active: true },
  { label: 'Cài đặt', icon: Settings, href: '/iam/settings/' },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function todayLabel() {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
}

export function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [workspace, setWorkspace] = useState<Workspace>(workspaces[0]);
  const [theme, setTheme] = useState<Theme>('light');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
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
  }, []);

  const dark = theme === 'dark';
  const surface = dark ? 'bg-[#111827] border-[#263244]' : 'bg-white border-slate-200/60';
  const muted = dark ? 'text-[#9ca3af]' : 'text-slate-500';
  const divider = dark ? 'border-[#263244]' : 'border-slate-200/60';
  const input = dark ? 'border-[#374151] bg-[#1f2937] text-white' : 'border-slate-200 bg-slate-50 text-slate-900';

  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return branches;
    return branches.filter((branch) =>
      [branch.name, branch.address, branch.manager].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [branches, search]);

  function switchWorkspace(nextWorkspace: Workspace) {
    setWorkspace(nextWorkspace);
    setWorkspaceOpen(false);
    window.localStorage.setItem('nextfarm:selectedWorkspace', JSON.stringify(nextWorkspace));
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

  function saveBranch(branch: Branch) {
    setBranches((current) => {
      const exists = current.some((item) => item.id === branch.id);
      if (exists) return current.map((item) => (item.id === branch.id ? branch : item));
      return [branch, ...current];
    });
    setCreateOpen(false);
    setEditingBranch(null);
  }

  function deleteBranch(branchId: string) {
    setBranches((current) => current.filter((branch) => branch.id !== branchId));
    setDeletingBranch(null);
  }

  return (
    <main className={`relative min-h-screen ${dark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`fixed left-0 top-0 h-screen min-h-screen w-[256px] border-r px-3 py-4 ${dark ? 'border-[#263244] bg-[#111827]' : 'border-slate-200/60 bg-slate-50'}`}>
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

      <section className="min-h-screen pl-[256px]">
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
              <h1 className="text-[22px] font-semibold leading-7">Quản lý chi nhánh</h1>
              <p className={`mt-1 text-xs ${muted}`}>Quản lý chi nhánh, người phụ trách và phân bổ người dùng</p>
            </div>
            <button className="flex h-[30px] items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white" onClick={() => setCreateOpen(true)} type="button">
              <Plus size={14} />
              Tạo chi nhánh
            </button>
          </div>

          <section className={`mt-8 rounded-xl border p-4 ${surface}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-9 items-center justify-center rounded-lg border ${dark ? 'border-[#374151] bg-[#1f2937]' : 'border-slate-200 bg-slate-50'}`}>
                <Search size={15} className={muted} />
              </div>
              <input
                className={`h-8 flex-1 rounded-xl border px-3 text-xs outline-none ${input}`}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên chi nhánh, địa chỉ, quản lý"
                value={search}
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left text-xs">
                <thead className={dark ? 'bg-[#1f2937]' : 'bg-slate-50'}>
                  <tr className={muted}>
                    <th className="px-3 py-[10px] font-medium">Tên chi nhánh</th>
                    <th className="px-3 py-[10px] font-medium">Địa chỉ</th>
                    <th className="px-3 py-[10px] font-medium">Quản lý</th>
                    <th className="px-3 py-[10px] font-medium">Người dùng</th>
                    <th className="px-3 py-[10px] font-medium">Ngày tạo</th>
                    <th className="px-3 py-[10px] text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch) => (
                    <tr className={`border-b last:border-b-0 ${divider}`} key={branch.id}>
                      <td className="px-3 py-[12px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#009688] text-[11px] font-semibold text-white">{branch.name.charAt(10) || 'C'}</div>
                          <div>
                            <p className="font-medium">{branch.name}</p>
                            <p className={`mt-1 text-[10px] ${muted}`}>Mã: {branch.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[310px] px-3 py-[12px]">
                        <div className="flex items-start gap-2">
                          <MapPin className={`mt-[1px] shrink-0 ${muted}`} size={13} />
                          <span className="leading-4">{branch.address}</span>
                        </div>
                      </td>
                      <td className="px-3 py-[12px] font-medium">{branch.manager}</td>
                      <td className="px-3 py-[12px]">{branch.assignedUserIds.length} người</td>
                      <td className={`px-3 py-[12px] ${muted}`}>{branch.createdAt}</td>
                      <td className="px-3 py-[12px]">
                        <div className="flex justify-end gap-2">
                          <button className={`flex h-7 w-7 items-center justify-center rounded-lg border ${dark ? 'border-[#374151] hover:bg-[#1f2937]' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => setEditingBranch(branch)} type="button">
                            <Pencil size={13} />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#fecaca] text-[#dc2626] hover:bg-[#fef2f2]" onClick={() => setDeletingBranch(branch)} type="button">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBranches.length === 0 ? (
              <div className={`mt-4 rounded-lg border border-dashed px-4 py-8 text-center text-xs ${divider}`}>
                <p className="font-medium">Không có chi nhánh phù hợp</p>
                <p className={`mt-1 ${muted}`}>Thay đổi từ khóa tìm kiếm hoặc tạo chi nhánh mới.</p>
              </div>
            ) : null}
          </section>
        </div>
      </section>

      {createOpen ? (
        <BranchModal
          dark={dark}
          input={input}
          onClose={() => setCreateOpen(false)}
          onSave={saveBranch}
          users={users}
        />
      ) : null}

      {editingBranch ? (
        <BranchModal
          branch={editingBranch}
          dark={dark}
          input={input}
          onClose={() => setEditingBranch(null)}
          onSave={saveBranch}
          users={users}
        />
      ) : null}

      {deletingBranch ? (
        <DeleteBranchModal
          branch={deletingBranch}
          dark={dark}
          onClose={() => setDeletingBranch(null)}
          onDelete={() => deleteBranch(deletingBranch.id)}
        />
      ) : null}

      <button
        aria-label="Trợ giúp"
        className={`fixed bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border text-lg  ${dark ? 'border-[#263244] bg-[#111827] text-[#d1d5db]' : 'border-[#e2e2e2] bg-white text-slate-600'}`}
        type="button"
      >
        ?
      </button>
    </main>
  );
}

function BranchModal({
  branch,
  dark,
  input,
  onClose,
  onSave,
  users,
}: {
  branch?: Branch;
  dark: boolean;
  input: string;
  onClose: () => void;
  onSave: (branch: Branch) => void;
  users: AssignableUser[];
}) {
  const [name, setName] = useState(branch?.name ?? '');
  const [address, setAddress] = useState(branch?.address ?? '');
  const [manager, setManager] = useState(branch?.manager ?? users[0]?.name ?? '');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(branch?.assignedUserIds ?? []);
  const [error, setError] = useState('');

  function toggleUser(userId: string) {
    setAssignedUserIds((current) => (current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <section className={`w-[430px] overflow-hidden rounded-lg shadow-xl ${dark ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`flex h-[52px] items-center justify-between border-b px-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
          <h2 className="text-sm font-semibold">{branch ? 'Sửa chi nhánh' : 'Tạo chi nhánh mới'}</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <form
          className="grid gap-3 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const finalName = name.trim();
            const finalAddress = address.trim();

            if (!finalName || !finalAddress || !manager) {
              setError('Vui lòng nhập tên chi nhánh, địa chỉ và quản lý.');
              return;
            }

            onSave({
              id: branch?.id ?? slugify(finalName),
              name: finalName,
              address: finalAddress,
              manager,
              assignedUserIds,
              createdAt: branch?.createdAt ?? todayLabel(),
            });
          }}
        >
          <label className="grid gap-2 text-[11px] font-medium">
            Tên chi nhánh *
            <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Chi nhánh Cần Thơ" value={name} />
          </label>
          <label className="grid gap-2 text-[11px] font-medium">
            Địa chỉ *
            <textarea className={`min-h-[64px] rounded-xl border px-3 py-2 text-xs outline-none ${input}`} onChange={(event) => setAddress(event.target.value)} placeholder="Nhập địa chỉ chi nhánh" value={address} />
          </label>
          <label className="grid gap-2 text-[11px] font-medium">
            Quản lý *
            <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setManager(event.target.value)} value={manager}>
              {users.map((user) => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 text-[11px] font-medium">
            Gán người dùng
            <div className={`max-h-[132px] overflow-y-auto rounded-lg border p-2 ${dark ? 'border-[#374151]' : 'border-slate-200'}`}>
              {users.map((user) => (
                <label className={`flex items-center gap-2 rounded px-2 py-2 ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'}`} key={user.id}>
                  <input checked={assignedUserIds.includes(user.id)} className="h-3 w-3 accent-emerald-600" onChange={() => toggleUser(user.id)} type="checkbox" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium">{user.name}</span>
                    <span className={`block truncate text-[10px] font-normal ${dark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>{user.email} · {user.role}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error ? <p className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[11px] font-medium text-[#dc2626]">{error}</p> : null}

          <div className={`mt-2 flex justify-end gap-2 border-t pt-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            <button className="h-8 rounded-lg border border-slate-200 px-4 text-xs font-medium" onClick={onClose} type="button">Hủy</button>
            <button className="h-8 rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white" type="submit">{branch ? 'Lưu thay đổi' : 'Tạo chi nhánh'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeleteBranchModal({
  branch,
  dark,
  onClose,
  onDelete,
}: {
  branch: Branch;
  dark: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <section className={`w-[360px] overflow-hidden rounded-lg shadow-xl ${dark ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`flex h-[52px] items-center justify-between border-b px-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
          <h2 className="text-sm font-semibold">Xóa chi nhánh</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="grid gap-4 p-4">
          <div>
            <p className="text-xs font-medium">Bạn có chắc chắn muốn xóa {branch.name}?</p>
            <p className={`mt-2 text-[11px] ${dark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
              Chi nhánh sẽ bị gỡ khỏi danh sách. Người dùng đang gán vào chi nhánh này cần được gán lại ở bước vận hành thật.
            </p>
          </div>
          <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-[11px] font-medium text-[#ea580c]">
            Hiện có {branch.assignedUserIds.length} người dùng trong chi nhánh này.
          </div>
          <div className={`flex justify-end gap-2 border-t pt-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            <button className="h-8 rounded-lg border border-slate-200 px-4 text-xs font-medium" onClick={onClose} type="button">Hủy</button>
            <button className="h-8 rounded-lg bg-[#dc2626] px-4 text-xs font-medium text-white" onClick={onDelete} type="button">Xóa chi nhánh</button>
          </div>
        </div>
      </section>
    </div>
  );
}
