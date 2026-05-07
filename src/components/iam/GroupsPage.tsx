'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  ChevronDown,
  Grid2X2,
  LockKeyhole,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Settings,
  Shield,
  Sun,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import { IamSubsystemSwitcher } from './IamSubsystemSwitcher';

type Theme = 'light' | 'dark';
type Tab = 'groups' | 'matrix';

type Workspace = {
  id: string;
  initial: string;
  name: string;
  role: string;
  members: number;
};

type Group = {
  id: string;
  name: string;
  code: string;
  description: string;
  members: number;
  permissionCount: number;
  system: boolean;
};

type Permission = {
  module: 'IAM' | 'GIS' | 'Process' | 'Harvest' | 'IoT' | 'AI' | 'Report' | 'Notification' | 'Operator';
  name: string;
  code: string;
  groups: string[];
};

const workspaces: Workspace[] = [
  { id: 'binh-dien', initial: 'H', name: 'HTX Nông nghiệp Bình Điền', role: 'Chủ sở hữu', members: 15 },
  { id: 'nong-san-xanh', initial: 'C', name: 'Công ty Nông sản Xanh', role: 'Quản trị viên', members: 8 },
  { id: 'cam-cao-phong', initial: 'C', name: 'HTX Cam Cao Phong', role: 'Quản lý nông trại', members: 12 },
];

const initialGroups: Group[] = [
  {
    id: 'owner',
    name: 'Owner',
    code: 'owner',
    description: 'Chủ sở hữu workspace, có toàn quyền quản trị',
    members: 1,
    permissionCount: 0,
    system: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    code: 'admin',
    description: 'Quản trị viên tổ chức, quản lý người dùng và vận hành',
    members: 3,
    permissionCount: 25,
    system: true,
  },
  {
    id: 'farm_manager',
    name: 'Farm Manager',
    code: 'farm_manager',
    description: 'Quản lý vận hành nông trại, quy trình và báo cáo',
    members: 12,
    permissionCount: 15,
    system: false,
  },
  {
    id: 'field_worker',
    name: 'Field Worker',
    code: 'field_worker',
    description: 'Nhân sự hiện trường, cập nhật công việc và nhật ký',
    members: 28,
    permissionCount: 8,
    system: false,
  },
];

const permissions: Permission[] = [
  { module: 'IAM', name: 'Xem danh sách người dùng', code: 'iam.users.view', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Tạo người dùng mới', code: 'iam.users.create', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Chỉnh sửa thông tin người dùng', code: 'iam.users.edit', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Xóa người dùng', code: 'iam.users.delete', groups: ['owner'] },
  { module: 'IAM', name: 'Khóa/Mở khóa tài khoản', code: 'iam.users.lock', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Xem nhóm quyền', code: 'iam.groups.view', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Quản lý nhóm quyền', code: 'iam.groups.manage', groups: ['owner'] },
  { module: 'IAM', name: 'Xem chi nhánh', code: 'iam.branches.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'IAM', name: 'Quản lý chi nhánh', code: 'iam.branches.manage', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Quản lý lời mời', code: 'iam.invitations.manage', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Xem cài đặt', code: 'iam.settings.view', groups: ['owner', 'admin'] },
  { module: 'IAM', name: 'Quản lý cài đặt', code: 'iam.settings.manage', groups: ['owner'] },
  { module: 'IAM', name: 'Xem nhật ký hệ thống', code: 'iam.audit_logs.view', groups: ['owner'] },

  { module: 'GIS', name: 'Xem thửa đất', code: 'gis.parcels.view', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'GIS', name: 'Tạo thửa đất', code: 'gis.parcels.create', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'GIS', name: 'Chỉnh sửa thửa đất', code: 'gis.parcels.edit', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'GIS', name: 'Nhập dữ liệu thửa đất', code: 'gis.parcels.import', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'GIS', name: 'Xem vùng canh tác', code: 'gis.zones.view', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'GIS', name: 'Tạo vùng canh tác', code: 'gis.zones.create', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'GIS', name: 'Quản lý lớp bản đồ', code: 'gis.layers.manage', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'GIS', name: 'Xem bản đồ NDVI', code: 'gis.ndvi.view', groups: ['owner', 'admin', 'farm_manager'] },

  { module: 'Process', name: 'Xem công việc', code: 'process.tasks.view', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'Process', name: 'Tạo công việc', code: 'process.tasks.create', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Process', name: 'Cập nhật trạng thái công việc', code: 'process.tasks.update_status', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'Process', name: 'Xem quy trình', code: 'process.processes.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Process', name: 'Tạo quy trình canh tác', code: 'process.processes.create', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Process', name: 'Quản lý mẫu quy trình', code: 'process.templates.manage', groups: ['owner', 'admin'] },
  { module: 'Process', name: 'Ghi nhật ký canh tác', code: 'process.logs.create', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },

  { module: 'Harvest', name: 'Xem bản ghi thu hoạch', code: 'harvest.records.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Harvest', name: 'Tạo bản ghi thu hoạch', code: 'harvest.records.create', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'Harvest', name: 'Xem đơn mua hàng', code: 'harvest.purchase_orders.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Harvest', name: 'Tạo đơn mua hàng', code: 'harvest.purchase_orders.create', groups: ['owner', 'admin'] },
  { module: 'Harvest', name: 'Xem truy xuất nguồn gốc', code: 'harvest.traceability.view', groups: ['owner', 'admin', 'farm_manager'] },

  { module: 'IoT', name: 'Xem thiết bị IoT', code: 'iot.devices.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'IoT', name: 'Đăng ký thiết bị', code: 'iot.devices.create', groups: ['owner', 'admin'] },
  { module: 'IoT', name: 'Xem telemetry realtime', code: 'iot.telemetry.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'IoT', name: 'Cấu hình cảnh báo', code: 'iot.alerts.manage', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'IoT', name: 'Gửi lệnh điều khiển', code: 'iot.commands.send', groups: ['owner', 'admin'] },
  { module: 'IoT', name: 'Lập lịch điều khiển', code: 'iot.commands.schedule', groups: ['owner', 'admin', 'farm_manager'] },

  { module: 'AI', name: 'Dùng trợ lý AI', code: 'ai.chat.use', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'AI', name: 'Xem dự đoán AI', code: 'ai.forecast.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'AI', name: 'Tải ảnh phát hiện sâu bệnh', code: 'ai.pest_detection.create', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'AI', name: 'Xem lịch sử phát hiện sâu bệnh', code: 'ai.pest_detection.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'AI', name: 'Quản lý mô hình AI', code: 'ai.models.manage', groups: ['owner', 'admin'] },

  { module: 'Report', name: 'Xem báo cáo tổng hợp vùng', code: 'report.zone_summary.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Report', name: 'Xem báo cáo thu hoạch', code: 'report.yield.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Report', name: 'Xem báo cáo tuân thủ', code: 'report.compliance.view', groups: ['owner', 'admin'] },
  { module: 'Report', name: 'Xem báo cáo NDVI', code: 'report.ndvi.view', groups: ['owner', 'admin', 'farm_manager'] },
  { module: 'Report', name: 'Xuất báo cáo', code: 'report.export', groups: ['owner', 'admin'] },
  { module: 'Report', name: 'Lập lịch báo cáo', code: 'report.schedule.manage', groups: ['owner', 'admin'] },

  { module: 'Notification', name: 'Xem thông báo cá nhân', code: 'notification.inbox.read', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'Notification', name: 'Đánh dấu thông báo đã đọc', code: 'notification.inbox.mark_read', groups: ['owner', 'admin', 'farm_manager', 'field_worker'] },
  { module: 'Notification', name: 'Quản lý mẫu thông báo', code: 'notification.templates.manage', groups: ['owner', 'admin'] },
  { module: 'Notification', name: 'Xem nhật ký gửi thông báo', code: 'notification.logs.read', groups: ['owner', 'admin'] },
  { module: 'Notification', name: 'Quản lý cài đặt thông báo', code: 'notification.settings.manage', groups: ['owner', 'admin'] },

  { module: 'Operator', name: 'Xem danh sách workspace', code: 'operator.workspaces.view', groups: ['owner'] },
  { module: 'Operator', name: 'Tạo workspace', code: 'operator.workspaces.create', groups: ['owner'] },
  { module: 'Operator', name: 'Chỉnh sửa workspace', code: 'operator.workspaces.edit', groups: ['owner'] },
  { module: 'Operator', name: 'Xóa/khôi phục workspace', code: 'operator.workspaces.delete_restore', groups: ['owner'] },
  { module: 'Operator', name: 'Quản lý agent', code: 'operator.agents.manage', groups: ['owner'] },
  { module: 'Operator', name: 'Xem đơn hàng & billing', code: 'operator.orders.view', groups: ['owner'] },
  { module: 'Operator', name: 'Quản lý gói dịch vụ', code: 'operator.plans.manage', groups: ['owner'] },
  { module: 'Operator', name: 'Quản lý domain tùy chỉnh', code: 'operator.domains.manage', groups: ['owner'] },
  { module: 'Operator', name: 'Quản lý tài khoản ngân hàng', code: 'operator.bank_accounts.manage', groups: ['owner'] },
];

const menu = [
  { label: 'Tổng quan', icon: Grid2X2, href: '/iam/' },
  { label: 'Người dùng', icon: UsersRound, href: '/iam/users/' },
  { label: 'Nhóm & quyền', icon: Shield, href: '/iam/groups/', active: true },
  { label: 'Chi nhánh', icon: Building2, href: '/iam/branches/' },
  { label: 'Cài đặt', icon: Settings, href: '/iam/settings/' },
];

export function GroupsPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace>(workspaces[0]);
  const [theme, setTheme] = useState<Theme>('light');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('groups');
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [permissionCatalog, setPermissionCatalog] = useState<Permission[]>(permissions);
  const [selectedGroupId, setSelectedGroupId] = useState('owner');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('all');

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
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];

  const visiblePermissions = useMemo(() => {
    if (moduleFilter === 'all') return permissionCatalog;
    return permissionCatalog.filter((permission) => permission.module === moduleFilter);
  }, [moduleFilter, permissionCatalog]);

  const groupedPermissions = useMemo(() => {
    return visiblePermissions.reduce<Record<string, Permission[]>>((acc, permission) => {
      acc[permission.module] = acc[permission.module] ?? [];
      acc[permission.module].push(permission);
      return acc;
    }, {});
  }, [visiblePermissions]);

  const groupedAllPermissions = useMemo(() => {
    return permissionCatalog.reduce<Record<string, Permission[]>>((acc, permission) => {
      acc[permission.module] = acc[permission.module] ?? [];
      acc[permission.module].push(permission);
      return acc;
    }, {});
  }, [permissionCatalog]);

  function groupHasPermission(permission: Permission, groupId: string) {
    return groupId === 'owner' || permission.groups.includes(groupId);
  }

  function countGroupPermissions(groupId: string) {
    if (groupId === 'owner') return permissionCatalog.length;
    return permissionCatalog.filter((permission) => permission.groups.includes(groupId)).length;
  }

  function toggleGroupPermission(permissionCode: string, groupId: string) {
    if (groupId === 'owner') return;

    setPermissionCatalog((current) =>
      current.map((permission) => {
        if (permission.code !== permissionCode) return permission;

        const assigned = permission.groups.includes(groupId);
        return {
          ...permission,
          groups: assigned ? permission.groups.filter((id) => id !== groupId) : [...permission.groups, groupId],
        };
      }),
    );
  }

  function updateGroup(updatedGroup: Group) {
    const previousGroupId = selectedGroup.id;

    setGroups((current) => current.map((group) => (group.id === previousGroupId ? updatedGroup : group)));

    if (updatedGroup.id !== previousGroupId) {
      setPermissionCatalog((current) =>
        current.map((permission) => ({
          ...permission,
          groups: permission.groups.map((groupId) => (groupId === previousGroupId ? updatedGroup.id : groupId)),
        })),
      );
      setSelectedGroupId(updatedGroup.id);
    }

    setEditOpen(false);
  }

  function deleteGroup(groupId: string) {
    if (selectedGroup.system) return;

    const nextGroups = groups.filter((group) => group.id !== groupId);
    setGroups(nextGroups);
    setSelectedGroupId(nextGroups.find((group) => group.id !== 'owner')?.id ?? nextGroups[0]?.id ?? 'owner');
    setPermissionCatalog((current) =>
      current.map((permission) => ({
        ...permission,
        groups: permission.groups.filter((id) => id !== groupId),
      })),
    );
    setDeleteOpen(false);
  }

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
        <header className={`flex h-[45px] items-center justify-between border-b px-[20px] ${surface}`}>
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
              <div className={`absolute left-0 top-[40px] z-30 w-[286px] rounded-xl border p-2 shadow-md ${surface}`}>
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
                <div className={`absolute right-0 top-[34px] z-30 w-[210px] rounded-xl border p-2 shadow-md ${surface}`}>
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
              <h1 className="text-[22px] font-semibold leading-7">Quản lý quyền hạn</h1>
              <p className={`mt-1 text-xs ${muted}`}>Quản lý nhóm quyền và xem tổng quan phân quyền</p>
            </div>
          </div>

          <div className={`mt-5 flex border-b ${divider}`}>
            <button className={`h-10 border-b-2 px-3 text-xs font-medium ${tab === 'groups' ? 'border-emerald-600 text-emerald-600' : `border-transparent ${muted}`}`} onClick={() => setTab('groups')} type="button">
              Quản lý nhóm
            </button>
            <button className={`h-10 border-b-2 px-3 text-xs font-medium ${tab === 'matrix' ? 'border-emerald-600 text-emerald-600' : `border-transparent ${muted}`}`} onClick={() => setTab('matrix')} type="button">
              Ma trận quyền
            </button>
          </div>

          {tab === 'groups' ? (
            <>
              <div className="mt-3 flex justify-end">
                <button className="flex h-[30px] items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white" onClick={() => setCreateOpen(true)} type="button">
                  <Plus size={14} />
                  Tạo nhóm mới
                </button>
              </div>
              <div className="mt-4 grid grid-cols-[302px_1fr] gap-4">
                <section className={`rounded-xl border p-3 ${surface}`}>
                  <h2 className="text-sm font-semibold">Danh sách nhóm</h2>
                  <div className="mt-3 grid gap-2">
                    {groups.map((group) => (
                      <button
                        className={`rounded-xl border px-3 py-[10px] text-left transition ${
                          selectedGroupId === group.id
                            ? 'border-emerald-600 bg-emerald-50'
                            : dark
                              ? 'border-[#263244] hover:bg-[#1f2937]'
                              : 'border-slate-200/60 hover:bg-slate-50'
                        }`}
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold">{group.name}</p>
                          {group.system ? <LockKeyhole className={muted} size={12} /> : null}
                        </div>
                        <p className={`mt-1 text-[10px] ${muted}`}>{group.members} người · {countGroupPermissions(group.id)} quyền</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={`rounded-xl border px-4 py-5 ${surface}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold">{selectedGroup.name}</h2>
                      {selectedGroup.system ? (
                        <span className="rounded border border-[#fed7aa] bg-[#fff7ed] px-2 py-1 text-[10px] font-medium text-[#f97316]">Hệ thống</span>
                      ) : null}
                    </div>
                    {!selectedGroup.system ? (
                      <div className="flex items-center gap-2">
                        <button
                          className={`flex h-8 items-center gap-2 rounded-xl border px-3 text-xs font-medium ${dark ? 'border-[#374151] hover:bg-[#1f2937]' : 'border-slate-200 hover:bg-slate-50'}`}
                          onClick={() => setEditOpen(true)}
                          type="button"
                        >
                          <Pencil size={13} />
                          Sửa
                        </button>
                        <button
                          className="flex h-8 items-center gap-2 rounded-lg border border-[#fecaca] px-3 text-xs font-medium text-[#dc2626] hover:bg-[#fef2f2]"
                          onClick={() => setDeleteOpen(true)}
                          type="button"
                        >
                          <Trash2 size={13} />
                          Xóa
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <p className={`mt-2 text-[11px] ${muted}`}>Mã: {selectedGroup.code}</p>
                  <p className="mt-4 text-xs leading-5">{selectedGroup.description}</p>
                  <div className={`mt-5 border-t pt-5 ${divider}`}>
                    <h3 className="text-xs font-semibold">Quyền hạn</h3>
                    {selectedGroup.id === 'owner' ? (
                      <div className="mt-3 rounded-lg border border-[#fdba74] bg-[#fff7ed] px-3 py-3 text-[11px] text-[#ea580c]">
                        Nhóm Owner có toàn quyền truy cập vào tất cả các chức năng (bypass permissions)
                      </div>
                    ) : null}
                    <div className="mt-3 grid gap-4">
                      {Object.entries(groupedAllPermissions).map(([moduleName, modulePermissions]) => (
                        <section className={`overflow-hidden rounded-lg border ${divider}`} key={moduleName}>
                          <div className={`px-3 py-2 text-xs font-semibold ${dark ? 'bg-[#1f2937]' : 'bg-slate-50'}`}>{moduleName}</div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-3 py-3">
                            {modulePermissions.map((permission) => (
                              <label className="flex min-h-[18px] items-start gap-2 text-[11px] font-medium leading-4" key={permission.code}>
                                <input
                                  checked={groupHasPermission(permission, selectedGroup.id)}
                                  className="mt-[2px] h-3 w-3 rounded border-[#d1d5db] accent-emerald-600"
                                  aria-disabled={selectedGroup.id === 'owner'}
                                  onChange={() => toggleGroupPermission(permission.code, selectedGroup.id)}
                                  type="checkbox"
                                />
                                <span>{permission.name}</span>
                              </label>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <section className="mt-3">
              <div className="mb-4 flex justify-end">
                <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setModuleFilter(event.target.value)} value={moduleFilter}>
                  <option value="all">Tất cả module</option>
                  {['IAM', 'GIS', 'Process', 'Harvest', 'IoT', 'AI', 'Report', 'Notification', 'Operator'].map((moduleName) => (
                    <option key={moduleName} value={moduleName}>{moduleName}</option>
                  ))}
                </select>
              </div>
              <div className={`overflow-hidden rounded-lg border ${surface}`}>
                <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                  <thead className={dark ? 'bg-[#1f2937]' : 'bg-slate-50'}>
                    <tr className={muted}>
                      <th className="w-[38%] px-3 py-[12px] font-medium">Quyền</th>
                      {groups.map((group) => (
                        <th className="px-3 py-[12px] text-center font-medium" key={group.id}>
                          <span className="block">{group.name}</span>
                          <span className="text-[10px] font-normal">{group.members} người</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                      <Fragment key={moduleName}>
                        <tr className={dark ? 'bg-[#111827]' : 'bg-[#f7f7f8]'} key={`${moduleName}-head`}>
                          <td className="px-3 py-[10px] text-xs font-semibold">{moduleName}</td>
                          {groups.map((group) => <td key={`${moduleName}-${group.id}`} />)}
                        </tr>
                        {modulePermissions.map((permission) => (
                          <tr className={`border-t ${divider}`} key={permission.code}>
                            <td className="px-3 py-[10px]">
                              <p className="text-[11px] font-medium">{permission.name}</p>
                              <p className={`text-[10px] ${muted}`}>{permission.code}</p>
                            </td>
                            {groups.map((group) => (
                              <td className="px-3 py-[10px] text-center" key={group.id}>
                                {groupHasPermission(permission, group.id) ? (
                                  <span className="mx-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#bbf7d0] text-emerald-600">
                                    <Check size={11} />
                                  </span>
                                ) : (
                                  <span className={`mx-auto block h-4 w-4 rounded-full ${dark ? 'bg-[#374151]' : 'bg-[#e5e7eb]'}`} />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </section>

      {createOpen ? (
        <CreateGroupModal
          dark={dark}
          input={input}
          onClose={() => setCreateOpen(false)}
          onCreate={(group) => {
            setGroups((current) => [...current, group]);
            setSelectedGroupId(group.id);
            setCreateOpen(false);
          }}
        />
      ) : null}

      {editOpen && !selectedGroup.system ? (
        <EditGroupModal
          dark={dark}
          existingGroups={groups}
          group={selectedGroup}
          input={input}
          onClose={() => setEditOpen(false)}
          onSave={updateGroup}
        />
      ) : null}

      {deleteOpen && !selectedGroup.system ? (
        <DeleteGroupModal
          dark={dark}
          group={selectedGroup}
          onClose={() => setDeleteOpen(false)}
          onDelete={() => deleteGroup(selectedGroup.id)}
        />
      ) : null}

      <button
        aria-label="Trợ giúp"
        className={`absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border text-lg  ${dark ? 'border-[#263244] bg-[#111827] text-[#d1d5db]' : 'border-[#e2e2e2] bg-white text-slate-600'}`}
        type="button"
      >
        ?
      </button>
    </main>
  );
}

function CreateGroupModal({
  dark,
  input,
  onClose,
  onCreate,
}: {
  dark: boolean;
  input: string;
  onClose: () => void;
  onCreate: (group: Group) => void;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  function slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <section className={`w-[344px] overflow-hidden rounded-lg shadow-xl ${dark ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`flex h-[52px] items-center justify-between border-b px-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
          <h2 className="text-sm font-semibold">Tạo nhóm quyền mới</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <form
          className="grid gap-3 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const finalCode = code.trim() || slugify(name);
            if (!name.trim() || !finalCode) return;
            onCreate({
              id: finalCode,
              name,
              code: finalCode,
              description: description || 'Nhóm quyền tùy chỉnh',
              members: 0,
              permissionCount: 0,
              system: false,
            });
          }}
        >
          <label className="grid gap-2 text-[11px] font-medium">
            Tên nhóm
            <input
              className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`}
              onChange={(event) => {
                setName(event.target.value);
                setCode(slugify(event.target.value));
              }}
              placeholder="Ví dụ: Farm Manager"
              value={name}
            />
          </label>
          <label className="grid gap-2 text-[11px] font-medium">
            Mã nhóm
            <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setCode(event.target.value)} placeholder="farm_manager" value={code} />
          </label>
          <label className="grid gap-2 text-[11px] font-medium">
            Mô tả
            <textarea
              className={`min-h-[62px] rounded-xl border px-3 py-2 text-xs outline-none ${input}`}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả vai trò và trách nhiệm của nhóm"
              value={description}
            />
          </label>
          <div className={`mt-2 flex justify-end gap-2 border-t pt-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            <button className="h-8 rounded-lg border border-slate-200 px-4 text-xs font-medium" onClick={onClose} type="button">Hủy</button>
            <button className="h-8 rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white" type="submit">Tạo nhóm</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EditGroupModal({
  dark,
  existingGroups,
  group,
  input,
  onClose,
  onSave,
}: {
  dark: boolean;
  existingGroups: Group[];
  group: Group;
  input: string;
  onClose: () => void;
  onSave: (group: Group) => void;
}) {
  const [name, setName] = useState(group.name);
  const [code, setCode] = useState(group.code);
  const [description, setDescription] = useState(group.description);
  const [error, setError] = useState('');

  function slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <section className={`w-[344px] overflow-hidden rounded-lg shadow-xl ${dark ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`flex h-[52px] items-center justify-between border-b px-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
          <h2 className="text-sm font-semibold">Sửa nhóm quyền</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <form
          className="grid gap-3 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const finalCode = slugify(code || name);
            const duplicated = existingGroups.some((item) => item.id !== group.id && item.id === finalCode);

            if (!name.trim() || !finalCode) {
              setError('Vui lòng nhập tên nhóm và mã nhóm.');
              return;
            }

            if (duplicated) {
              setError('Mã nhóm đã tồn tại.');
              return;
            }

            onSave({
              ...group,
              id: finalCode,
              name: name.trim(),
              code: finalCode,
              description: description.trim() || 'Nhóm quyền tùy chỉnh',
            });
          }}
        >
          <label className="grid gap-2 text-[11px] font-medium">
            Tên nhóm
            <input
              className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`}
              onChange={(event) => {
                setName(event.target.value);
                setCode(slugify(event.target.value));
                setError('');
              }}
              placeholder="Ví dụ: Farm Manager"
              value={name}
            />
          </label>
          <label className="grid gap-2 text-[11px] font-medium">
            Mã nhóm
            <input
              className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`}
              onChange={(event) => {
                setCode(event.target.value);
                setError('');
              }}
              placeholder="farm_manager"
              value={code}
            />
          </label>
          <label className="grid gap-2 text-[11px] font-medium">
            Mô tả
            <textarea
              className={`min-h-[62px] rounded-xl border px-3 py-2 text-xs outline-none ${input}`}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả vai trò và trách nhiệm của nhóm"
              value={description}
            />
          </label>
          {error ? <p className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[11px] font-medium text-[#dc2626]">{error}</p> : null}
          <div className={`mt-2 flex justify-end gap-2 border-t pt-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            <button className="h-8 rounded-lg border border-slate-200 px-4 text-xs font-medium" onClick={onClose} type="button">Hủy</button>
            <button className="h-8 rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white" type="submit">Lưu thay đổi</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeleteGroupModal({
  dark,
  group,
  onClose,
  onDelete,
}: {
  dark: boolean;
  group: Group;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <section className={`w-[344px] overflow-hidden rounded-lg shadow-xl ${dark ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`flex h-[52px] items-center justify-between border-b px-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
          <h2 className="text-sm font-semibold">Xóa nhóm quyền</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="grid gap-4 p-4">
          <div>
            <p className="text-xs font-medium">Bạn có chắc chắn muốn xóa nhóm {group.name}?</p>
            <p className={`mt-2 text-[11px] ${dark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
              Nhóm sẽ bị gỡ khỏi danh sách và tất cả quyền đang gán cho nhóm này cũng sẽ được bỏ chọn.
            </p>
          </div>
          {group.members > 0 ? (
            <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-[11px] font-medium text-[#ea580c]">
              Nhóm hiện có {group.members} người dùng. Đây là dữ liệu demo nên thao tác xóa vẫn được mô phỏng trên giao diện.
            </div>
          ) : null}
          <div className={`flex justify-end gap-2 border-t pt-4 ${dark ? 'border-[#263244]' : 'border-slate-200/60'}`}>
            <button className="h-8 rounded-lg border border-slate-200 px-4 text-xs font-medium" onClick={onClose} type="button">Hủy</button>
            <button className="h-8 rounded-lg bg-[#dc2626] px-4 text-xs font-medium text-white" onClick={onDelete} type="button">Xóa nhóm</button>
          </div>
        </div>
      </section>
    </div>
  );
}
