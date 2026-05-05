'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Bot,
  ChevronRight,
  Clock,
  Leaf,
  Lock,
  MessageSquareText,
  Settings2,
  Smartphone,
} from 'lucide-react';

type NotificationCategory = 'Công việc' | 'Cảnh báo' | 'AI' | 'Thu hoạch' | 'Hệ thống';
type DeliveryStatus = 'Đã gửi' | 'Thất bại' | 'Bị giới hạn';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  time: string;
  read: boolean;
  priority: 'Thấp' | 'Bình thường' | 'Cao' | 'Khẩn cấp';
  link: string;
};

export const notifications: NotificationItem[] = [
  {
    id: 'NOTIF-001',
    title: 'Công việc "Bón phân lần 2" sắp đến hạn',
    body: 'Thửa P-LA-032 cần hoàn thành bón phân trong 2 ngày tới để giữ tiến độ vụ Đông Xuân 2026.',
    category: 'Công việc',
    time: '5 phút trước',
    read: false,
    priority: 'Cao',
    link: '/process/tasks/TASK-001/',
  },
  {
    id: 'NOTIF-002',
    title: 'Cảnh báo cảm biến nhiệt độ vượt ngưỡng',
    body: 'Trạm cảm biến LA-032 ghi nhận nhiệt độ 41.2°C, vượt ngưỡng 40°C trong 3 lần liên tiếp.',
    category: 'Cảnh báo',
    time: '1 giờ trước',
    read: false,
    priority: 'Khẩn cấp',
    link: '/iot/alerts/',
  },
  {
    id: 'NOTIF-003',
    title: 'AI chẩn đoán: nguy cơ sâu tơ',
    body: 'Ảnh mới tại P-HCM-001 có độ tin cậy 86%. Hệ thống đã tạo báo cáo bất thường để theo dõi.',
    category: 'AI',
    time: '3 giờ trước',
    read: false,
    priority: 'Bình thường',
    link: '/ai/pest-detection/',
  },
  {
    id: 'NOTIF-004',
    title: 'Hồ sơ truy xuất đã sẵn sàng',
    body: 'TraceBundle TRC-HR-001 đã được tạo cho lô thu hoạch rau Củ Chi.',
    category: 'Thu hoạch',
    time: 'Hôm qua',
    read: true,
    priority: 'Bình thường',
    link: '/harvest/traceability/TRC-HR-001/',
  },
  {
    id: 'NOTIF-005',
    title: 'Thiết bị Van tưới Củ Chi 01 mất kết nối',
    body: 'Thiết bị không gửi heartbeat hơn 5 phút. Vui lòng kiểm tra gateway hoặc nguồn điện.',
    category: 'Cảnh báo',
    time: '2 ngày trước',
    read: true,
    priority: 'Cao',
    link: '/iot/devices/DEV-ACT-002/',
  },
];

const preferenceGroups = [
  {
    title: 'Công việc & quy trình',
    items: ['Công việc sắp đến hạn', 'Công việc quá hạn', 'Quy trình được duyệt'],
  },
  {
    title: 'IoT & cảnh báo',
    items: ['Cảnh báo cảm biến', 'Thiết bị mất kết nối', 'Lệnh đã thực thi'],
  },
  {
    title: 'AI',
    items: ['Kết quả chẩn đoán AI', 'Gợi ý canh tác mới'],
  },
  {
    title: 'Thu hoạch',
    items: ['Hồ sơ truy xuất sẵn sàng', 'Đơn thu mua đổi trạng thái'],
  },
  {
    title: 'Hệ thống',
    items: ['Mẫu quy trình mới', 'Bảo trì hệ thống'],
  },
];

const templates = [
  {
    id: 'TPL-NOTIF-001',
    type: 'TaskDueSoon',
    title: 'Công việc {{entity_name}} sắp đến hạn',
    body: '{{entity_name}} cần hoàn thành trước {{date}} lúc {{time}}.',
    updated: '04/05/2026 08:30',
    system: true,
  },
  {
    id: 'TPL-NOTIF-002',
    type: 'SensorAlertTriggered',
    title: 'Cảnh báo: {{entity_name}} bất thường',
    body: '{{entity_name}} ghi nhận giá trị {{value}}, vượt ngưỡng {{threshold}}.',
    updated: '03/05/2026 16:20',
    system: true,
  },
  {
    id: 'TPL-NOTIF-003',
    type: 'AIInsightGenerated',
    title: 'AI chẩn đoán: {{entity_name}}',
    body: 'AI đề xuất kiểm tra {{entity_name}} tại {{date}}.',
    updated: '02/05/2026 10:10',
    system: false,
  },
];

const deliveryLogs = [
  { time: '04/05/2026 09:25', recipient: 'Nguyễn Văn An', type: 'TaskDueSoon', channel: 'Đẩy di động', status: 'Đã gửi' as DeliveryStatus, reason: '-' },
  { time: '04/05/2026 09:20', recipient: 'Trần Thị Bình', type: 'SensorAlertTriggered', channel: 'Trong ứng dụng', status: 'Đã gửi' as DeliveryStatus, reason: '-' },
  { time: '04/05/2026 09:10', recipient: 'Lê Văn Công', type: 'DeviceOffline', channel: 'Đẩy di động', status: 'Thất bại' as DeliveryStatus, reason: 'FCM token không hợp lệ' },
  { time: '04/05/2026 08:55', recipient: 'Nguyễn Văn An', type: 'TaskDueSoon', channel: 'Đẩy di động', status: 'Bị giới hạn' as DeliveryStatus, reason: 'Vượt 10 thông báo/giờ cùng loại' },
];

export function NotificationInboxPage() {
  const [filter, setFilter] = useState<'Tất cả' | 'Chưa đọc' | 'Đã đọc'>('Tất cả');
  const [category, setCategory] = useState<'Tất cả' | NotificationCategory>('Tất cả');
  const filtered = notifications.filter((item) => {
    const readMatch = filter === 'Tất cả' || (filter === 'Chưa đọc' ? !item.read : item.read);
    const categoryMatch = category === 'Tất cả' || item.category === category;
    return readMatch && categoryMatch;
  });

  return (
    <NotificationShell active="inbox">
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#16a34a]">NOTIF-W01 · Hộp thư thông báo</p>
            <h2 className="mt-1 text-xl font-extrabold">Thông báo trong ứng dụng</h2>
            <p className="mt-2 text-sm text-[#64748b]">Giữ lại thông báo trong 30 ngày. Thông báo chưa đọc được in đậm và có chấm xanh.</p>
          </div>
          <button className="rounded-lg border border-[#16a34a] px-4 py-2 text-sm font-bold text-[#15803d]" type="button">Đánh dấu tất cả đã đọc</button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <select className="h-10 rounded-lg border border-[#d4ded4] px-3 text-sm font-bold" onChange={(event) => setFilter(event.target.value as typeof filter)} value={filter}>
            {['Tất cả', 'Chưa đọc', 'Đã đọc'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="h-10 rounded-lg border border-[#d4ded4] px-3 text-sm font-bold" onChange={(event) => setCategory(event.target.value as typeof category)} value={category}>
            {['Tất cả', 'Công việc', 'Cảnh báo', 'AI', 'Thu hoạch', 'Hệ thống'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-[#dce7dc] bg-white shadow-sm">
        {filtered.map((item) => (
          <Link className={`flex items-center gap-4 border-b border-[#e3ebe3] px-5 py-4 last:border-b-0 hover:bg-[#f8fbf7] ${item.read ? '' : 'bg-[#f8fff9]'}`} href={`/notifications/${item.id}/`} key={item.id}>
            <NotificationIcon category={item.category} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!item.read ? <span className="h-2 w-2 rounded-full bg-[#16a34a]" /> : null}
                <h3 className={`truncate text-sm ${item.read ? 'font-semibold' : 'font-extrabold'}`}>{item.title}</h3>
                <PriorityBadge priority={item.priority} />
              </div>
              <p className="mt-1 truncate text-sm text-[#64748b]">{item.body}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#64748b]">{item.time}</p>
              <ChevronRight className="ml-auto mt-2 text-[#94a3b8]" size={16} />
            </div>
          </Link>
        ))}
      </section>
    </NotificationShell>
  );
}

export function NotificationDetailPage({ id }: { id: string }) {
  const item = notifications.find((notification) => notification.id === id) ?? notifications[0];

  return (
    <NotificationShell active="inbox">
      <section className="grid grid-cols-[minmax(0,1fr)_360px] gap-5 max-xl:grid-cols-1">
        <article className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-[#16a34a]">NOTIF-W02 · Chi tiết thông báo</p>
          <div className="mt-4 flex items-start gap-4">
            <NotificationIcon category={item.category} />
            <div>
              <h2 className="text-xl font-extrabold">{item.title}</h2>
              <p className="mt-2 text-sm text-[#64748b]">{item.category} · {item.time} · {item.read ? 'Đã đọc' : 'Chưa đọc'}</p>
            </div>
          </div>
          <p className="mt-5 rounded-xl bg-[#f8fafc] p-5 text-sm leading-7 text-[#334155]">{item.body}</p>
          <div className="mt-5 flex gap-3">
            <Link className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-bold text-white" href={item.link}>Đi tới đối tượng liên quan</Link>
            <Link className="rounded-lg border border-[#d4ded4] px-4 py-2 text-sm font-bold" href="/notifications/">Quay lại danh sách</Link>
          </div>
        </article>

        <aside className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold">Thông tin gửi</h3>
          <div className="mt-4 grid gap-3">
            <InfoRow label="Loại" value={item.category} />
            <InfoRow label="Ưu tiên" value={item.priority} />
            <InfoRow label="Kênh" value="Trong ứng dụng + đẩy di động" />
            <InfoRow label="Lưu giữ" value="30 ngày" />
          </div>
        </aside>
      </section>
    </NotificationShell>
  );
}

export function NotificationPreferencesPage() {
  const [pushEnabled, setPushEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(preferenceGroups.flatMap((group) => group.items.map((item) => [item, true]))),
  );

  return (
    <NotificationShell active="preferences">
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <p className="text-xs font-bold text-[#16a34a]">NOTIF-W03 · Cài đặt thông báo</p>
        <h2 className="mt-1 text-xl font-extrabold">Tùy chọn nhận thông báo</h2>
        <p className="mt-2 text-sm text-[#64748b]">Thông báo trong ứng dụng luôn bật. Bạn có thể bật/tắt thông báo đẩy theo từng loại, thay đổi được lưu ngay.</p>
      </section>

      <div className="mt-5 grid gap-5">
        {preferenceGroups.map((group) => (
          <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm" key={group.title}>
            <h3 className="text-base font-extrabold">{group.title}</h3>
            <div className="mt-4 grid gap-3">
              {group.items.map((item) => (
                <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f8fafc] p-3" key={item}>
                  <div>
                    <p className="text-sm font-bold">{item}</p>
                    <p className="mt-1 text-xs text-[#64748b]">Trong ứng dụng: luôn bật · Email/SMS sẽ có ở giai đoạn 2</p>
                  </div>
                  <button
                    className={`h-7 w-12 rounded-full p-1 transition ${pushEnabled[item] ? 'bg-[#16a34a]' : 'bg-[#cbd5e1]'}`}
                    onClick={() => setPushEnabled((current) => ({ ...current, [item]: !current[item] }))}
                    type="button"
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition ${pushEnabled[item] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </NotificationShell>
  );
}

export function NotificationTemplatesPage() {
  const [selected, setSelected] = useState(templates[0]);

  return (
    <NotificationShell active="templates">
      <div className="grid grid-cols-[minmax(0,1fr)_390px] gap-5 max-xl:grid-cols-1">
        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-[#16a34a]">NOTIF-W04 · Quản lý mẫu thông báo</p>
          <h2 className="mt-1 text-xl font-extrabold">Mẫu nội dung thông báo</h2>
          <div className="mt-5 overflow-hidden rounded-xl border border-[#e3ebe3]">
            <div className="grid grid-cols-[180px_1fr_1fr_150px] bg-[#f1f5f9] px-4 py-3 text-xs font-bold text-[#475569]">
              <span>Loại</span><span>Tiêu đề mẫu</span><span>Nội dung mẫu</span><span>Cập nhật</span>
            </div>
            {templates.map((template) => (
              <button className="grid w-full grid-cols-[180px_1fr_1fr_150px] border-t border-[#e3ebe3] px-4 py-3 text-left text-sm hover:bg-[#f8fbf7]" key={template.id} onClick={() => setSelected(template)} type="button">
                <span className="font-bold">{template.type}{template.system ? <Lock className="ml-2 inline text-[#64748b]" size={13} /> : null}</span>
                <span>{template.title}</span>
                <span className="truncate">{template.body}</span>
                <span className="text-[#64748b]">{template.updated}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold">Chỉnh sửa & xem trước</h3>
          <label className="mt-4 block text-xs font-bold">
            Tiêu đề
            <input className="mt-2 h-10 w-full rounded-lg border border-[#d4ded4] px-3 text-sm" defaultValue={selected.title} />
          </label>
          <label className="mt-4 block text-xs font-bold">
            Nội dung
            <textarea className="mt-2 min-h-24 w-full rounded-lg border border-[#d4ded4] p-3 text-sm" defaultValue={selected.body} />
          </label>
          <div className="mt-4 rounded-lg bg-[#f8fafc] p-3 text-sm">
            <p className="font-extrabold">Xem trước</p>
            <p className="mt-2 font-bold">{renderTemplate(selected.title)}</p>
            <p className="mt-1 text-[#64748b]">{renderTemplate(selected.body)}</p>
          </div>
          <div className="mt-4 rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3 text-xs leading-5 text-[#1d4ed8]">
            Biến hỗ trợ: {'{{user_name}}'}, {'{{entity_name}}'}, {'{{date}}'}, {'{{time}}'}, {'{{value}}'}, {'{{threshold}}'}.
          </div>
          <button className="mt-4 h-10 w-full rounded-lg bg-[#16a34a] text-sm font-bold text-white" type="button">Lưu thay đổi</button>
        </aside>
      </div>

      <section className="mt-5 rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold">Nhật ký gửi thông báo</h3>
          <button className="rounded-lg border border-[#d4ded4] px-3 py-2 text-xs font-bold" type="button">Xuất CSV</button>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-[#e3ebe3]">
          <div className="grid grid-cols-[150px_1fr_170px_140px_130px_1fr] bg-[#f1f5f9] px-4 py-3 text-xs font-bold text-[#475569]">
            <span>Thời gian</span><span>Người nhận</span><span>Loại</span><span>Kênh</span><span>Trạng thái</span><span>Lý do</span>
          </div>
          {deliveryLogs.map((log) => (
            <div className="grid grid-cols-[150px_1fr_170px_140px_130px_1fr] border-t border-[#e3ebe3] px-4 py-3 text-sm" key={`${log.time}-${log.recipient}`}>
              <span>{log.time}</span><span className="font-bold">{log.recipient}</span><span>{log.type}</span><span>{log.channel}</span><span><DeliveryBadge status={log.status} /></span><span>{log.reason}</span>
            </div>
          ))}
        </div>
      </section>
    </NotificationShell>
  );
}

function NotificationShell({ active, children }: { active: 'inbox' | 'preferences' | 'templates'; children: React.ReactNode }) {
  const tabs = [
    { id: 'inbox', label: 'Hộp thư', href: '/notifications/', icon: Bell },
    { id: 'preferences', label: 'Tùy chọn nhận', href: '/settings/notifications/', icon: Settings2 },
    { id: 'templates', label: 'Mẫu & nhật ký gửi', href: '/admin/notification-templates/', icon: MessageSquareText },
  ] as const;

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fbf7] p-5 text-[#0f172a]">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#16a34a]">Thông báo</p>
        <h1 className="mt-2 text-2xl font-extrabold leading-8">Trung tâm thông báo</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#526178]">Theo dõi thông báo trong ứng dụng, cấu hình nhận thông báo đẩy, quản lý mẫu nội dung và nhật ký gửi.</p>
      </div>
      <nav className="mt-5 flex flex-wrap gap-2 rounded-xl border border-[#dce7dc] bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;
          return (
            <Link className={`flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition ${selected ? 'border border-[#16a34a] bg-[#ecfdf3] text-[#15803d]' : 'text-[#0f172a] hover:bg-[#f5f7f5]'}`} href={tab.href} key={tab.id}>
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function NotificationIcon({ category }: { category: NotificationCategory }) {
  const config = {
    'Công việc': [Clock, 'bg-[#dcfce7] text-[#16a34a]'],
    'Cảnh báo': [AlertTriangle, 'bg-[#fee2e2] text-[#dc2626]'],
    AI: [Bot, 'bg-[#dbeafe] text-[#2563eb]'],
    'Thu hoạch': [Leaf, 'bg-[#ffedd5] text-[#f97316]'],
    'Hệ thống': [Smartphone, 'bg-[#f1f5f9] text-[#475569]'],
  } satisfies Record<NotificationCategory, [typeof Bell, string]>;
  const Icon = config[category][0];
  return <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config[category][1]}`}><Icon size={18} /></span>;
}

function PriorityBadge({ priority }: { priority: NotificationItem['priority'] }) {
  const style = priority === 'Khẩn cấp' ? 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]' : priority === 'Cao' ? 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]' : 'border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]';
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${style}`}>{priority}</span>;
}

function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  const style = status === 'Đã gửi' ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]' : status === 'Bị giới hạn' ? 'border-[#fde68a] bg-[#fffbeb] text-[#b45309]' : 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]';
  return <span className={`rounded-full border px-2 py-1 text-xs font-bold ${style}`}>{status}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e3ebe3] pb-3 last:border-b-0">
      <span className="text-sm text-[#64748b]">{label}</span>
      <span className="text-right text-sm font-extrabold">{value}</span>
    </div>
  );
}

function renderTemplate(value: string) {
  return value
    .replaceAll('{{user_name}}', 'Nguyễn Văn An')
    .replaceAll('{{entity_name}}', 'Bón phân lần 2')
    .replaceAll('{{date}}', '06/05/2026')
    .replaceAll('{{time}}', '08:00')
    .replaceAll('{{value}}', '41.2°C')
    .replaceAll('{{threshold}}', '40°C');
}
