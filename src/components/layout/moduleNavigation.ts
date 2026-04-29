import {
  Bell,
  Bot,
  CalendarDays,
  ClipboardList,
  Cpu,
  FileText,
  Grid2X2,
  Layers3,
  Map,
  PackageCheck,
  PlayCircle,
  Scale,
  Settings,
  Settings2,
  Shield,
  Sprout,
  UsersRound,
  Waves,
  Wheat,
  Building2,
  QrCode,
  Truck,
} from 'lucide-react';

export type UserRole = 'owner' | 'admin' | 'farm_manager' | 'field_worker';

export type ModuleId = 'iam' | 'gis' | 'process' | 'harvest' | 'iot' | 'ai';

export type NavItem = {
  href: string;
  label: string;
  permission: string;
  roles: UserRole[];
  icon: typeof Grid2X2;
};

export type ModuleConfig = {
  id: ModuleId;
  label: string;
  shortLabel: string;
  href: string;
  permission: string;
  roles: UserRole[];
  icon: typeof Grid2X2;
  nav: NavItem[];
};

const allRoles: UserRole[] = ['owner', 'admin', 'farm_manager', 'field_worker'];
const managerRoles: UserRole[] = ['owner', 'admin', 'farm_manager'];
const adminRoles: UserRole[] = ['owner', 'admin'];

export const modules: ModuleConfig[] = [
  {
    id: 'iam',
    label: 'IAM',
    shortLabel: 'IAM',
    href: '/iam/',
    permission: 'iam.dashboard.view',
    roles: allRoles,
    icon: Shield,
    nav: [
      { href: '/iam/', label: 'Tổng quan', permission: 'iam.dashboard.view', roles: allRoles, icon: Grid2X2 },
      { href: '/iam/users/', label: 'Người dùng', permission: 'iam.users.view', roles: adminRoles, icon: UsersRound },
      { href: '/iam/groups/', label: 'Nhóm & quyền', permission: 'iam.groups.view', roles: adminRoles, icon: Shield },
      { href: '/iam/branches/', label: 'Chi nhánh', permission: 'iam.branches.view', roles: managerRoles, icon: Building2 },
      { href: '/iam/settings/', label: 'Cài đặt', permission: 'iam.settings.view', roles: adminRoles, icon: Settings },
    ],
  },
  {
    id: 'gis',
    label: 'GIS',
    shortLabel: 'GIS',
    href: '/gis/map/',
    permission: 'gis.parcels.view',
    roles: allRoles,
    icon: Map,
    nav: [
      { href: '/gis/map/', label: 'Bản đồ', permission: 'gis.map.view', roles: allRoles, icon: Map },
      { href: '/gis/parcels/', label: 'Thửa đất', permission: 'gis.parcels.view', roles: managerRoles, icon: Layers3 },
      { href: '/gis/zones/', label: 'Vùng canh tác', permission: 'gis.zones.view', roles: allRoles, icon: Sprout },
    ],
  },
  {
    id: 'process',
    label: 'Mùa vụ',
    shortLabel: 'PRO',
    href: '/process/tasks/',
    permission: 'process.tasks.view',
    roles: allRoles,
    icon: ClipboardList,
    nav: [
      { href: '/process/tasks/', label: 'Công việc', permission: 'process.tasks.view', roles: allRoles, icon: ClipboardList },
      { href: '/process/templates/', label: 'Mẫu quy trình', permission: 'process.templates.manage', roles: adminRoles, icon: Grid2X2 },
      { href: '/process/active/', label: 'Quy trình đang chạy', permission: 'process.active.view', roles: managerRoles, icon: Scale },
      { href: '/process/calendar/', label: 'Lịch công việc', permission: 'process.calendar.view', roles: allRoles, icon: CalendarDays },
      { href: '/process/logs/', label: 'Nhật ký', permission: 'process.logs.view', roles: managerRoles, icon: FileText },
      { href: '/process/inputs/', label: 'Vật tư', permission: 'process.inputs.manage', roles: adminRoles, icon: PackageCheck },
    ],
  },
  {
    id: 'harvest',
    label: 'Thu hoạch',
    shortLabel: 'HAR',
    href: '/harvest/records/',
    permission: 'harvest.records.view',
    roles: managerRoles,
    icon: Wheat,
    nav: [
      { href: '/harvest/records/', label: 'Ghi nhận thu hoạch', permission: 'harvest.records.view', roles: managerRoles, icon: Wheat },
      { href: '/harvest/purchase-orders/', label: 'Đơn thu mua', permission: 'harvest.purchase_orders.view', roles: managerRoles, icon: Truck },
      { href: '/harvest/traceability/TRC-HR-001/', label: 'Truy xuất nguồn gốc', permission: 'harvest.traceability.view', roles: allRoles, icon: QrCode },
    ],
  },
  {
    id: 'iot',
    label: 'IoT',
    shortLabel: 'IOT',
    href: '/iot/devices/',
    permission: 'iot.devices.view',
    roles: managerRoles,
    icon: Cpu,
    nav: [
      { href: '/iot/devices/', label: 'Thiết bị', permission: 'iot.devices.view', roles: managerRoles, icon: Cpu },
      { href: '/iot/alerts/', label: 'Cảnh báo', permission: 'iot.alerts.view', roles: managerRoles, icon: Bell },
      { href: '/iot/alert-rules/', label: 'Rule cảnh báo', permission: 'iot.alert_rules.manage', roles: managerRoles, icon: Settings2 },
      { href: '/iot/commands/', label: 'Lệnh & lịch', permission: 'iot.commands.view', roles: managerRoles, icon: PlayCircle },
      { href: '/iot/charts/', label: 'Biểu đồ cảm biến', permission: 'iot.telemetry.view', roles: managerRoles, icon: Waves },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    shortLabel: 'AI',
    href: '/ai/chat/',
    permission: 'ai.chat.use',
    roles: allRoles,
    icon: Bot,
    nav: [
      { href: '/ai/chat/', label: 'Trợ lý AI', permission: 'ai.chat.use', roles: allRoles, icon: Bot },
    ],
  },
];

export function isAllowed(roles: UserRole[], role: UserRole) {
  return roles.includes(role);
}

export function getCurrentModule(pathname: string) {
  return modules.find((module) => pathname === module.href || pathname.startsWith(`/${module.id}/`)) ?? modules[0];
}

export function getUserRole() {
  if (typeof window === 'undefined') return 'owner' as UserRole;
  const storedRole = window.localStorage.getItem('nextfarm:userRole');
  if (storedRole === 'admin' || storedRole === 'farm_manager' || storedRole === 'field_worker') return storedRole;
  return 'owner';
}
