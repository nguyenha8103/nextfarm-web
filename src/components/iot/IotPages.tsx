'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Cpu,
  Download,
  Gauge,
  Map,
  PlayCircle,
  Radio,
  Settings2,
  TimerReset,
  Waves,
  type LucideIcon,
} from 'lucide-react';

type DeviceType = 'sensor' | 'actuator';
type DeviceStatus = 'registered' | 'online' | 'offline';
type AlertStatus = 'triggered' | 'acknowledged' | 'resolved';
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type Operator = '>' | '<' | 'between';
type CommandType = 'setpoint' | 'schedule';
type CommandStatus = 'sent' | 'acknowledged' | 'timeout' | 'failed';
type MetricKey = 'temperature' | 'humidity' | 'soilMoisture' | 'soilPh';

type IotDevice = {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  model: string;
  serial: string;
  zone: string;
  parcel: string;
  lastReadingAt: string;
  lastHeartbeat: string;
  mqttTopic: string;
  readings: Record<MetricKey, number>;
  battery: string;
  location: { x: number; y: number };
};

type AlertRule = {
  id: string;
  deviceId: string;
  metric: MetricKey;
  operator: Operator;
  min?: number;
  max?: number;
  breachCount: number;
  cooldown: number;
  channels: string[];
  enabled: boolean;
};

type SensorAlert = {
  id: string;
  triggeredAt: string;
  deviceId: string;
  metric: MetricKey;
  value: number;
  threshold: string;
  severity: AlertSeverity;
  status: AlertStatus;
  resolvedAt?: string;
  ruleId: string;
};

type CommandLog = {
  id: string;
  timestamp: string;
  deviceId: string;
  type: CommandType;
  value: string;
  status: CommandStatus;
  user: string;
};

const devices: IotDevice[] = [
  {
    id: 'DEV-SEN-001',
    name: 'Trạm cảm biến LA-032',
    type: 'sensor',
    status: 'online',
    model: 'NF-SOIL-4IN1',
    serial: 'SN-LA032-2604',
    zone: 'Vùng lúa Long An',
    parcel: 'P-LA-032',
    lastReadingAt: '28/04/2026 14:25',
    lastHeartbeat: '30 giây trước',
    mqttTopic: 'nextfarm/ws-binh-dien/devices/DEV-SEN-001/telemetry',
    readings: { temperature: 29.4, humidity: 74, soilMoisture: 43, soilPh: 6.4 },
    battery: '82%',
    location: { x: 32, y: 38 },
  },
  {
    id: 'DEV-ACT-002',
    name: 'Van tưới Củ Chi 01',
    type: 'actuator',
    status: 'online',
    model: 'NF-VALVE-220V',
    serial: 'SN-HCM001-2604',
    zone: 'Vùng rau Củ Chi',
    parcel: 'P-HCM-001',
    lastReadingAt: '28/04/2026 14:24',
    lastHeartbeat: '45 giây trước',
    mqttTopic: 'nextfarm/ws-binh-dien/devices/DEV-ACT-002/telemetry',
    readings: { temperature: 31.2, humidity: 69, soilMoisture: 38, soilPh: 6.8 },
    battery: 'Nguồn lưới',
    location: { x: 58, y: 52 },
  },
  {
    id: 'DEV-SEN-003',
    name: 'Nút thời tiết Đồng Nai',
    type: 'sensor',
    status: 'offline',
    model: 'NF-WEATHER-01',
    serial: 'SN-DN014-2604',
    zone: 'Vùng cây ăn trái Đồng Nai',
    parcel: 'P-DN-014',
    lastReadingAt: '28/04/2026 12:10',
    lastHeartbeat: '2 giờ trước',
    mqttTopic: 'nextfarm/ws-binh-dien/devices/DEV-SEN-003/telemetry',
    readings: { temperature: 33.6, humidity: 61, soilMoisture: 29, soilPh: 5.9 },
    battery: '24%',
    location: { x: 72, y: 31 },
  },
  {
    id: 'DEV-ACT-004',
    name: 'Bơm tưới Long An',
    type: 'actuator',
    status: 'registered',
    model: 'NF-PUMP-3KW',
    serial: 'SN-PUMP-LA-2604',
    zone: 'Vùng lúa Long An',
    parcel: 'P-LA-032',
    lastReadingAt: 'Chưa có dữ liệu',
    lastHeartbeat: 'Chưa kết nối',
    mqttTopic: 'nextfarm/ws-binh-dien/devices/DEV-ACT-004/telemetry',
    readings: { temperature: 0, humidity: 0, soilMoisture: 0, soilPh: 0 },
    battery: 'Nguồn lưới',
    location: { x: 25, y: 68 },
  },
];

const alertRules: AlertRule[] = [
  { id: 'RULE-001', deviceId: 'DEV-SEN-001', metric: 'temperature', operator: '>', max: 40, breachCount: 3, cooldown: 20, channels: ['Đẩy thông báo', 'Trong ứng dụng'], enabled: true },
  { id: 'RULE-002', deviceId: 'DEV-SEN-003', metric: 'soilMoisture', operator: '<', min: 30, breachCount: 3, cooldown: 30, channels: ['Email', 'Trong ứng dụng'], enabled: true },
  { id: 'RULE-003', deviceId: 'DEV-ACT-002', metric: 'soilPh', operator: 'between', min: 5.5, max: 7.2, breachCount: 2, cooldown: 15, channels: ['Trong ứng dụng'], enabled: false },
];

const alerts: SensorAlert[] = [
  { id: 'ALT-001', triggeredAt: '28/04/2026 12:12', deviceId: 'DEV-SEN-003', metric: 'soilMoisture', value: 29, threshold: '< 30', severity: 'high', status: 'triggered', ruleId: 'RULE-002' },
  { id: 'ALT-002', triggeredAt: '28/04/2026 10:40', deviceId: 'DEV-SEN-001', metric: 'temperature', value: 41.2, threshold: '> 40', severity: 'medium', status: 'acknowledged', ruleId: 'RULE-001' },
  { id: 'ALT-003', triggeredAt: '27/04/2026 16:30', deviceId: 'DEV-ACT-002', metric: 'soilPh', value: 7.4, threshold: '5.5 - 7.2', severity: 'low', status: 'resolved', resolvedAt: '27/04/2026 17:10', ruleId: 'RULE-003' },
];

const commandLogs: CommandLog[] = [
  { id: 'CMD-001', timestamp: '28/04/2026 14:05', deviceId: 'DEV-ACT-002', type: 'setpoint', value: 'Mở van 30 phút', status: 'acknowledged', user: 'Nguyễn Văn An' },
  { id: 'CMD-002', timestamp: '28/04/2026 06:00', deviceId: 'DEV-ACT-004', type: 'schedule', value: 'Hằng ngày 06:00, 25 phút', status: 'sent', user: 'Hệ thống' },
  { id: 'CMD-003', timestamp: '27/04/2026 18:20', deviceId: 'DEV-ACT-002', type: 'setpoint', value: 'Độ ẩm mục tiêu 45%', status: 'timeout', user: 'Trần Thị Bình' },
  { id: 'CMD-004', timestamp: '27/04/2026 09:10', deviceId: 'DEV-ACT-002', type: 'schedule', value: 'Tạm dừng lịch tưới', status: 'failed', user: 'Lê Văn Công' },
];

export const iotDeviceIds = devices.map((device) => device.id);

const deviceTypeLabel: Record<DeviceType, string> = {
  sensor: 'Cảm biến',
  actuator: 'Thiết bị điều khiển',
};

const deviceStatusLabel: Record<DeviceStatus, string> = {
  registered: 'Đã đăng ký',
  online: 'Trực tuyến',
  offline: 'Mất kết nối',
};

const deviceStatusStyle: Record<DeviceStatus, string> = {
  registered: 'border-[#d1d5db] bg-[#f9fafb] text-[#4b5563]',
  online: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
  offline: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
};

const metricLabel: Record<MetricKey, string> = {
  temperature: 'Nhiệt độ',
  humidity: 'Độ ẩm không khí',
  soilMoisture: 'Độ ẩm đất',
  soilPh: 'pH đất',
};

const metricUnit: Record<MetricKey, string> = {
  temperature: '°C',
  humidity: '%',
  soilMoisture: '%',
  soilPh: '',
};

const severityLabel: Record<AlertSeverity, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp',
};

const severityStyle: Record<AlertSeverity, string> = {
  low: 'bg-[#eff6ff] text-[#2563eb]',
  medium: 'bg-[#fffbeb] text-[#a16207]',
  high: 'bg-[#fff7ed] text-[#ea580c]',
  critical: 'bg-[#fef2f2] text-[#dc2626]',
};

const alertStatusLabel: Record<AlertStatus, string> = {
  triggered: 'Đang kích hoạt',
  acknowledged: 'Đã ghi nhận',
  resolved: 'Đã xử lý',
};

const commandTypeLabel: Record<CommandType, string> = {
  setpoint: 'Giá trị đặt',
  schedule: 'Lịch tự động',
};

const commandStatusLabel: Record<CommandStatus, string> = {
  sent: 'Đã gửi',
  acknowledged: 'Đã xác nhận',
  timeout: 'Quá thời gian',
  failed: 'Thất bại',
};

export function IotDevicesPage() {
  const [zone, setZone] = useState('all');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [showMap, setShowMap] = useState(false);

  const filteredDevices = devices.filter((device) => {
    const matchedZone = zone === 'all' || device.zone === zone;
    const matchedType = type === 'all' || device.type === type;
    const matchedStatus = status === 'all' || device.status === status;
    return matchedZone && matchedType && matchedStatus;
  });

  return (
    <IotShell active="devices">
      <div className="grid grid-cols-4 gap-3">
        <Metric icon={Cpu} label="Tổng thiết bị" value={`${devices.length}`} tone="green" />
        <Metric icon={Radio} label="Trực tuyến" value={`${devices.filter((device) => device.status === 'online').length}`} tone="blue" />
        <Metric icon={AlertTriangle} label="Mất kết nối" value={`${devices.filter((device) => device.status === 'offline').length}`} tone="amber" />
        <Metric icon={TimerReset} label="Cập nhật realtime" value="30 giây" tone="gray" />
      </div>

      <section className="mt-4 rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold">Dashboard thiết bị</h2>
            <p className="mt-1 text-xs text-[#687084]">Thiết bị tự chuyển sang mất kết nối nếu không có dữ liệu trong hơn 5 phút.</p>
          </div>
          <div className="flex gap-2">
            <FilterSelect label="" onChange={setZone} value={zone}>
              <option value="all">Tất cả khu vực</option>
              {unique(devices.map((device) => device.zone)).map((item) => <option key={item}>{item}</option>)}
            </FilterSelect>
            <FilterSelect label="" onChange={setType} value={type}>
              <option value="all">Tất cả loại</option>
              <option value="sensor">Cảm biến</option>
              <option value="actuator">Thiết bị điều khiển</option>
            </FilterSelect>
            <FilterSelect label="" onChange={setStatus} value={status}>
              <option value="all">Tất cả trạng thái</option>
              <option value="registered">Đã đăng ký</option>
              <option value="online">Trực tuyến</option>
              <option value="offline">Mất kết nối</option>
            </FilterSelect>
            <button className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold ${showMap ? 'border-[#16a34a] bg-[#ecfdf3] text-[#15803d]' : 'border-[#d8e1d6]'}`} onClick={() => setShowMap((current) => !current)} type="button">
              <Map size={14} />
              {showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}
            </button>
          </div>
        </div>

        {showMap ? <DeviceMap devices={filteredDevices} /> : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {filteredDevices.map((device) => (
            <Link className="rounded-xl border border-[#e1e8df] bg-[#fbfdfb] p-4 transition hover:border-[#16a34a] hover:bg-[#f0fdf4]" href={`/iot/devices/${device.id}/`} key={device.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold">{device.name}</p>
                  <p className="mt-1 text-xs text-[#687084]">{deviceTypeLabel[device.type]} · {device.zone} · {device.parcel}</p>
                </div>
                <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${deviceStatusStyle[device.status]}`}>{deviceStatusLabel[device.status]}</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {(['temperature', 'humidity', 'soilMoisture', 'soilPh'] as MetricKey[]).map((metric) => (
                  <StatBox label={metricLabel[metric]} value={device.status === 'registered' ? '--' : `${device.readings[metric]}${metricUnit[metric]}`} key={metric} />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#687084]">
                <span>Dữ liệu gần nhất: {device.lastReadingAt}</span>
                <span>Pin/nguồn: {device.battery}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </IotShell>
  );
}

export function IotDeviceDetailPage({ deviceId }: { deviceId: string }) {
  const device = devices.find((item) => item.id === deviceId) ?? devices[0];
  const [range, setRange] = useState('24h');
  const deviceRules = alertRules.filter((rule) => rule.deviceId === device.id);
  const deviceCommands = commandLogs.filter((command) => command.deviceId === device.id).slice(0, 20);

  return (
    <IotShell active="devices">
      <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <Link
          className="mb-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[#d7e2d8] bg-white px-3 text-xs font-bold text-[#334155] shadow-sm transition hover:border-[#16a34a] hover:text-[#15803d]"
          href="/iot/devices/"
        >
          <ArrowLeft size={15} />
          Quay lại
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-[#16a34a]">IOT-W02 · Chi tiết thiết bị</p>
            <h2 className="mt-1 text-xl font-extrabold">{device.name}</h2>
            <p className="mt-1 text-xs text-[#687084]">{device.zone} · {device.parcel}</p>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${deviceStatusStyle[device.status]}`}>{deviceStatusLabel[device.status]}</span>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {(['temperature', 'humidity', 'soilMoisture', 'soilPh'] as MetricKey[]).map((metric) => (
            <GaugeCard label={metricLabel[metric]} value={device.readings[metric]} unit={metricUnit[metric]} key={metric} />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_360px] gap-4">
          <section className="rounded-xl border border-[#e1e8df] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold">Biểu đồ lịch sử</h3>
              <div className="flex gap-1">
                {['24h', '7d', '30d'].map((item) => (
                  <button className={`h-8 rounded-lg px-3 text-[11px] font-bold ${range === item ? 'bg-[#16a34a] text-white' : 'bg-[#eef1f4] text-[#475569]'}`} onClick={() => setRange(item)} type="button" key={item}>{item}</button>
                ))}
              </div>
            </div>
            <LineChart title={`Dữ liệu ${range}`} />
            <p className="mt-3 text-xs text-[#687084]">Tự động làm mới mỗi 30 giây. Dữ liệu lịch sử lấy từ bảng cảm biến dạng time-series.</p>
          </section>

          <aside className="grid gap-4">
            <section className="rounded-xl border border-[#e1e8df] p-4">
              <h3 className="text-sm font-extrabold">Thông tin thiết bị</h3>
              <div className="mt-3 grid gap-2 text-xs">
                <SummaryRow label="Model" value={device.model} />
                <SummaryRow label="Số serial" value={device.serial} />
                <SummaryRow label="Heartbeat" value={device.lastHeartbeat} />
                <SummaryRow label="MQTT topic" value={device.mqttTopic} />
              </div>
            </section>
            <section className="rounded-xl border border-[#e1e8df] p-4">
              <h3 className="text-sm font-extrabold">Rule cảnh báo</h3>
              <div className="mt-3 grid gap-2">
                {deviceRules.map((rule) => (
                  <Link className="rounded-lg bg-[#f8fafc] px-3 py-2 text-xs font-bold" href="/iot/alert-rules/" key={rule.id}>{rule.id} · {metricLabel[rule.metric]} {rule.operator} {rule.max ?? rule.min}</Link>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-[#e1e8df] p-4">
              <h3 className="text-sm font-extrabold">Lịch sử lệnh gần nhất</h3>
              <div className="mt-3 grid gap-2">
                {deviceCommands.map((command) => (
                  <div className="rounded-lg bg-[#f8fafc] px-3 py-2 text-xs" key={command.id}>
                    <p className="font-bold">{commandTypeLabel[command.type]} · {commandStatusLabel[command.status]}</p>
                    <p className="mt-1 text-[#687084]">{command.timestamp}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </IotShell>
  );
}

export function IotAlertsPage() {
  const [items, setItems] = useState(alerts);
  const [filters, setFilters] = useState({ device: 'all', severity: 'all', status: 'all', from: '', to: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const filteredAlerts = items.filter((alert) => {
    const matchedDevice = filters.device === 'all' || alert.deviceId === filters.device;
    const matchedSeverity = filters.severity === 'all' || alert.severity === filters.severity;
    const matchedStatus = filters.status === 'all' || alert.status === filters.status;
    return matchedDevice && matchedSeverity && matchedStatus;
  });

  function acknowledgeSelected() {
    setItems((current) => current.map((alert) => (selectedIds.includes(alert.id) && alert.status === 'triggered' ? { ...alert, status: 'acknowledged' } : alert)));
    setSelectedIds([]);
  }

  return (
    <IotShell active="alerts">
      <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold">Danh sách cảnh báo</h2>
            <p className="mt-1 text-xs text-[#687084]">Theo dõi cảnh báo từ engine rule và mở biểu đồ tại thời điểm xảy ra.</p>
          </div>
          <button className="h-10 rounded-lg bg-[#16a34a] px-3 text-xs font-bold text-white disabled:opacity-50" disabled={selectedIds.length === 0} onClick={acknowledgeSelected} type="button">Ghi nhận hàng loạt</button>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-3">
          <FilterSelect label="" onChange={(device) => setFilters({ ...filters, device })} value={filters.device}>
            <option value="all">Tất cả thiết bị</option>
            {devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}
          </FilterSelect>
          <FilterSelect label="" onChange={(severity) => setFilters({ ...filters, severity })} value={filters.severity}>
            <option value="all">Tất cả mức độ</option>
            {Object.entries(severityLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </FilterSelect>
          <FilterSelect label="" onChange={(status) => setFilters({ ...filters, status })} value={filters.status}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(alertStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </FilterSelect>
          <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, from: event.target.value })} type="date" value={filters.from} />
          <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, to: event.target.value })} type="date" value={filters.to} />
        </div>

        <TableShell>
          <thead className="bg-[#f3f4f6] text-[#687084]">
            <tr>
              <th className="px-3 py-3"><input className="accent-[#16a34a]" onChange={(event) => setSelectedIds(event.target.checked ? filteredAlerts.map((alert) => alert.id) : [])} type="checkbox" /></th>
              <th className="px-3 py-3 font-bold">Thời gian</th>
              <th className="px-3 py-3 font-bold">Thiết bị</th>
              <th className="px-3 py-3 font-bold">Loại cảm biến</th>
              <th className="px-3 py-3 font-bold">Giá trị / ngưỡng</th>
              <th className="px-3 py-3 font-bold">Mức độ</th>
              <th className="px-3 py-3 font-bold">Trạng thái</th>
              <th className="px-3 py-3 font-bold">Liên kết</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert) => {
              const device = findDevice(alert.deviceId);
              return (
                <tr className="border-t border-[#e1e8df]" key={alert.id}>
                  <td className="px-3 py-3"><input checked={selectedIds.includes(alert.id)} className="accent-[#16a34a]" onChange={() => setSelectedIds((current) => (current.includes(alert.id) ? current.filter((id) => id !== alert.id) : [...current, alert.id]))} type="checkbox" /></td>
                  <td className="px-3 py-3">{alert.triggeredAt}</td>
                  <td className="px-3 py-3 font-bold">{device.name}</td>
                  <td className="px-3 py-3">{metricLabel[alert.metric]}</td>
                  <td className="px-3 py-3">{alert.value}{metricUnit[alert.metric]} / {alert.threshold}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${severityStyle[alert.severity]}`}>{severityLabel[alert.severity]}</span></td>
                  <td className="px-3 py-3">{alertStatusLabel[alert.status]}</td>
                  <td className="px-3 py-3"><Link className="font-bold text-[#16a34a]" href="/iot/charts/">Xem biểu đồ</Link> · <Link className="font-bold text-[#16a34a]" href="/iot/alert-rules/">Rule</Link></td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </section>
    </IotShell>
  );
}

export function IotAlertRulesPage() {
  const [rules, setRules] = useState(alertRules);
  const [draft, setDraft] = useState({ deviceId: devices[0].id, metric: 'temperature' as MetricKey, operator: '>' as Operator, min: '', max: '40', breachCount: '3', cooldown: '15', channels: ['Trong ứng dụng'] });
  const cooldownValid = Number(draft.cooldown) >= 15;

  function addRule() {
    if (!cooldownValid) return;
    setRules((current) => [
      {
        id: `RULE-${Date.now().toString().slice(-4)}`,
        deviceId: draft.deviceId,
        metric: draft.metric,
        operator: draft.operator,
        min: draft.min ? Number(draft.min) : undefined,
        max: draft.max ? Number(draft.max) : undefined,
        breachCount: Number(draft.breachCount) || 3,
        cooldown: Number(draft.cooldown),
        channels: draft.channels,
        enabled: true,
      },
      ...current,
    ]);
  }

  return (
    <IotShell active="rules">
      <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-4">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold">Cấu hình rule cảnh báo</h2>
          <p className="mt-1 text-xs leading-5 text-[#687084]">Cool-down tối thiểu 15 phút để tránh gửi cảnh báo liên tục. PLC vẫn là lớp kiểm tra an toàn cuối cùng.</p>
          <div className="mt-4 grid gap-3">
            <FilterSelect label="Thiết bị" onChange={(deviceId) => setDraft({ ...draft, deviceId })} value={draft.deviceId}>
              {devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}
            </FilterSelect>
            <FilterSelect label="Loại cảm biến" onChange={(metric) => setDraft({ ...draft, metric: metric as MetricKey })} value={draft.metric}>
              {Object.entries(metricLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </FilterSelect>
            <FilterSelect label="Toán tử" onChange={(operator) => setDraft({ ...draft, operator: operator as Operator })} value={draft.operator}>
              <option value=">">Lớn hơn</option>
              <option value="<">Nhỏ hơn</option>
              <option value="between">Trong khoảng</option>
            </FilterSelect>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ngưỡng tối thiểu" onChange={(min) => setDraft({ ...draft, min })} value={draft.min} />
              <Input label="Ngưỡng tối đa" onChange={(max) => setDraft({ ...draft, max })} value={draft.max} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Số lần vi phạm" onChange={(breachCount) => setDraft({ ...draft, breachCount })} value={draft.breachCount} />
              <Input label="Cool-down (phút)" onChange={(cooldown) => setDraft({ ...draft, cooldown })} value={draft.cooldown} />
            </div>
            {!cooldownValid ? <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs font-bold text-[#dc2626]">Cool-down phải từ 15 phút trở lên.</div> : null}
            <div className="grid gap-2 text-xs font-bold">
              Kênh cảnh báo
              {['Đẩy thông báo', 'Trong ứng dụng', 'Email'].map((channel) => (
                <label className="flex items-center gap-2 font-medium" key={channel}>
                  <input checked={draft.channels.includes(channel)} className="accent-[#16a34a]" onChange={() => setDraft((current) => ({ ...current, channels: current.channels.includes(channel) ? current.channels.filter((item) => item !== channel) : [...current.channels, channel] }))} type="checkbox" />
                  {channel}
                </label>
              ))}
            </div>
            <button className="h-10 rounded-lg bg-[#16a34a] text-xs font-bold text-white disabled:opacity-50" disabled={!cooldownValid} onClick={addRule} type="button">Tạo rule</button>
          </div>
        </section>

        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold">Danh sách rule</h2>
          <div className="mt-4 grid gap-3">
            {rules.map((rule) => (
              <div className="rounded-xl border border-[#e1e8df] p-4" key={rule.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold">{rule.id} · {findDevice(rule.deviceId).name}</p>
                    <p className="mt-1 text-xs text-[#687084]">{metricLabel[rule.metric]} {rule.operator} {rule.operator === 'between' ? `${rule.min} - ${rule.max}` : rule.max ?? rule.min} · {rule.breachCount} lần · nghỉ {rule.cooldown} phút</p>
                    <p className="mt-1 text-xs text-[#687084]">Kênh: {rule.channels.join(', ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className={`h-8 rounded-lg px-3 text-[11px] font-bold ${rule.enabled ? 'bg-[#16a34a] text-white' : 'bg-[#eef1f4] text-[#687084]'}`} onClick={() => setRules((current) => current.map((item) => item.id === rule.id ? { ...item, enabled: !item.enabled } : item))} type="button">{rule.enabled ? 'Đang bật' : 'Đang tắt'}</button>
                    <button className="h-8 rounded-lg border border-[#fecaca] px-3 text-[11px] font-bold text-[#dc2626]" onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))} type="button">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </IotShell>
  );
}

export function IotCommandsPage() {
  const [filters, setFilters] = useState({ device: 'all', type: 'all', status: 'all', from: '', to: '' });
  const filteredCommands = commandLogs.filter((command) => {
    const matchedDevice = filters.device === 'all' || command.deviceId === filters.device;
    const matchedType = filters.type === 'all' || command.type === filters.type;
    const matchedStatus = filters.status === 'all' || command.status === filters.status;
    return matchedDevice && matchedType && matchedStatus;
  });

  return (
    <IotShell active="commands">
      <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold">Lịch sử lệnh & lịch tự động</h2>
            <p className="mt-1 text-xs text-[#687084]">Nextfarm chỉ gửi giá trị đặt hoặc lịch qua MQTT; PLC kiểm tra giới hạn an toàn và phản hồi xác nhận.</p>
          </div>
          <div className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] px-3 py-2 text-xs font-bold text-[#0369a1]">Quá thời gian nếu không có xác nhận sau 60 giây</div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-3">
          <FilterSelect label="" onChange={(device) => setFilters({ ...filters, device })} value={filters.device}>
            <option value="all">Tất cả thiết bị</option>
            {devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}
          </FilterSelect>
          <FilterSelect label="" onChange={(type) => setFilters({ ...filters, type })} value={filters.type}>
            <option value="all">Tất cả loại lệnh</option>
            <option value="setpoint">Giá trị đặt</option>
            <option value="schedule">Lịch tự động</option>
          </FilterSelect>
          <FilterSelect label="" onChange={(status) => setFilters({ ...filters, status })} value={filters.status}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(commandStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </FilterSelect>
          <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, from: event.target.value })} type="date" value={filters.from} />
          <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, to: event.target.value })} type="date" value={filters.to} />
        </div>
        <TableShell>
          <thead className="bg-[#f3f4f6] text-[#687084]">
            <tr>
              <th className="px-3 py-3 font-bold">Thời gian</th>
              <th className="px-3 py-3 font-bold">Thiết bị</th>
              <th className="px-3 py-3 font-bold">Loại lệnh</th>
              <th className="px-3 py-3 font-bold">Giá trị</th>
              <th className="px-3 py-3 font-bold">Trạng thái</th>
              <th className="px-3 py-3 font-bold">Người gửi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommands.map((command) => (
              <tr className="border-t border-[#e1e8df]" key={command.id}>
                <td className="px-3 py-3">{command.timestamp}</td>
                <td className="px-3 py-3 font-bold">{findDevice(command.deviceId).name}</td>
                <td className="px-3 py-3">{commandTypeLabel[command.type]}</td>
                <td className="px-3 py-3">{command.value}</td>
                <td className="px-3 py-3">{commandStatusLabel[command.status]}</td>
                <td className="px-3 py-3">{command.user}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </section>
    </IotShell>
  );
}

export function IotChartsPage() {
  const [selectedDevices, setSelectedDevices] = useState([devices[0].id, devices[1].id]);
  const [metric, setMetric] = useState<MetricKey>('temperature');
  const [range, setRange] = useState('24h');
  const [aggregate, setAggregate] = useState('raw');

  return (
    <IotShell active="charts">
      <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold">Biểu đồ cảm biến</h2>
            <p className="mt-1 text-xs text-[#687084]">So sánh nhiều thiết bị, chọn chỉ số và xuất dữ liệu CSV. Dữ liệu sau 30 ngày hiển thị từ tổng hợp nén.</p>
          </div>
          <button className="flex h-10 items-center gap-2 rounded-lg border border-[#d8e1d6] px-3 text-xs font-bold" type="button"><Download size={14} />Xuất CSV</button>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_180px_160px_180px] gap-3">
          <div className="rounded-xl border border-[#e1e8df] bg-[#fbfdfb] p-3">
            <p className="text-[11px] font-bold">Thiết bị so sánh</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {devices.map((device) => (
                <label className="flex items-center gap-2 text-xs" key={device.id}>
                  <input checked={selectedDevices.includes(device.id)} className="accent-[#16a34a]" onChange={() => setSelectedDevices((current) => current.includes(device.id) ? current.filter((id) => id !== device.id) : [...current, device.id])} type="checkbox" />
                  {device.name}
                </label>
              ))}
            </div>
          </div>
          <FilterSelect label="Chỉ số" onChange={(value) => setMetric(value as MetricKey)} value={metric}>
            {Object.entries(metricLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </FilterSelect>
          <FilterSelect label="Thời gian" onChange={setRange} value={range}>
            <option value="24h">24 giờ</option>
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
          </FilterSelect>
          <FilterSelect label="Tổng hợp" onChange={setAggregate} value={aggregate}>
            <option value="raw">Dữ liệu gốc</option>
            <option value="hourly">Trung bình giờ</option>
            <option value="daily">Trung bình ngày</option>
          </FilterSelect>
        </div>
        <div className="mt-4 rounded-xl border border-[#e1e8df] p-4">
          <LineChart title={`${metricLabel[metric]} · ${range} · ${aggregate === 'raw' ? 'dữ liệu gốc' : aggregate === 'hourly' ? 'trung bình giờ' : 'trung bình ngày'}`} />
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedDevices.map((id) => <span className="rounded-full bg-[#eef1f4] px-3 py-1 text-[11px] font-bold text-[#475569]" key={id}>{findDevice(id).name}</span>)}
          </div>
        </div>
        <section className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs leading-5 text-[#166534]">
          Tích hợp NDVI: khi vùng có lớp GIS vệ tinh, biểu đồ có thể chồng xu hướng NDVI với dữ liệu cảm biến để phân tích stress cây trồng.
        </section>
      </section>
    </IotShell>
  );
}

function IotShell({ active, children }: { active: 'devices' | 'alerts' | 'rules' | 'commands' | 'charts'; children: React.ReactNode }) {
  const tabs = [
    { id: 'devices', href: '/iot/devices/', label: 'Thiết bị', icon: Cpu },
    { id: 'alerts', href: '/iot/alerts/', label: 'Cảnh báo', icon: Bell },
    { id: 'rules', href: '/iot/alert-rules/', label: 'Rule cảnh báo', icon: Settings2 },
    { id: 'commands', href: '/iot/commands/', label: 'Lệnh & lịch', icon: PlayCircle },
    { id: 'charts', href: '/iot/charts/', label: 'Biểu đồ cảm biến', icon: Waves },
  ] as const;

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <div className="border-b border-[#e5eadf] bg-[#f7faf8] px-5 pb-5 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#16a34a]">IoT</p>
        <h1 className="mt-1 text-[26px] font-extrabold leading-8 text-[#111827]">Giám sát thiết bị & cảm biến</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#5f6b7a]">Theo dõi thiết bị theo thời gian thực, quản lý cảnh báo, lịch tưới và dữ liệu cảm biến từ TimescaleDB.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-[#e1e8df] bg-white p-1.5 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = active === tab.id;
            return (
              <Link className={`inline-flex h-9 min-w-[145px] items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${selected ? 'border-[#16a34a] bg-[#ecfdf3] text-[#15803d] shadow-sm' : 'border-transparent text-[#334155] hover:border-[#d5d9df] hover:bg-[#f7faf8] hover:text-[#16a34a]'}`} href={tab.href} key={tab.id}>
                <Icon size={14} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DeviceMap({ devices: items }: { devices: IotDevice[] }) {
  return (
    <div className="relative mt-4 h-72 overflow-hidden rounded-xl border border-[#e1e8df] bg-[#cdefff]">
      <div className="absolute inset-4 rounded-[40%] border-2 border-[#16a34a] bg-[#86efac]/35" />
      <div className="absolute bottom-6 left-[42%] h-28 w-52 rotate-6 rounded-[24px] border-2 border-[#0891b2] bg-[#67e8f9]/35" />
      {items.map((device) => (
        <Link className={`absolute flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white shadow ${device.status === 'online' ? 'bg-[#16a34a]' : device.status === 'offline' ? 'bg-[#dc2626]' : 'bg-[#64748b]'}`} href={`/iot/devices/${device.id}/`} key={device.id} style={{ left: `${device.location.x}%`, top: `${device.location.y}%` }}>
          {device.type === 'sensor' ? 'S' : 'A'}
        </Link>
      ))}
    </div>
  );
}

function GaugeCard({ label, unit, value }: { label: string; unit: string; value: number }) {
  const width = Math.max(8, Math.min(100, label === 'pH đất' ? (value / 14) * 100 : value));
  return (
    <div className="rounded-xl border border-[#e1e8df] bg-[#fbfdfb] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#687084]">{label}</p>
        <Gauge className="text-[#16a34a]" size={16} />
      </div>
      <p className="mt-2 text-xl font-extrabold">{value}{unit}</p>
      <div className="mt-3 h-2 rounded-full bg-[#eef1f4]">
        <div className="h-2 rounded-full bg-[#16a34a]" style={{ width: `${width}%` }} />
      </div>
      <Sparkline />
    </div>
  );
}

function LineChart({ title }: { title: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#687084]">{title}</p>
      <div className="relative mt-3 h-72 rounded-xl bg-[#fbfdfb] p-4">
        <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-[#d8e1d6]" />
        <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-[#d8e1d6]" />
        <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-[#d8e1d6]" />
        <svg className="h-full w-full" viewBox="0 0 600 230" preserveAspectRatio="none">
          <polyline fill="none" stroke="#16a34a" strokeWidth="4" points="0,150 80,120 160,132 240,88 320,96 400,70 500,110 600,76" />
          <polyline fill="none" stroke="#0891b2" strokeWidth="4" points="0,170 80,158 160,140 240,152 320,116 400,124 500,90 600,98" />
        </svg>
      </div>
    </div>
  );
}

function Sparkline() {
  return (
    <svg className="mt-3 h-8 w-full" viewBox="0 0 100 28" preserveAspectRatio="none">
      <polyline fill="none" stroke="#16a34a" strokeWidth="2" points="0,20 15,16 30,18 45,11 60,13 75,7 100,10" />
    </svg>
  );
}

function Metric({ icon: Icon, label, tone, value }: { icon: LucideIcon; label: string; tone: 'green' | 'blue' | 'amber' | 'gray'; value: string }) {
  const colors = {
    green: 'bg-[#f0fdf4] text-[#16a34a]',
    blue: 'bg-[#eff6ff] text-[#2563eb]',
    amber: 'bg-[#fffbeb] text-[#d97706]',
    gray: 'bg-[#f8fafc] text-[#475569]',
  };

  return (
    <div className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[tone]}`}><Icon size={18} /></div>
      <p className="mt-3 text-xs text-[#687084]">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e1e8df] bg-white px-3 py-2">
      <p className="text-[10px] text-[#687084]">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
  );
}

function FilterSelect({ children, label, onChange, value }: { children: React.ReactNode; label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className={`grid gap-2 text-[11px] font-bold ${label ? '' : 'content-end'}`}>
      {label}
      <select className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
    </label>
  );
}

function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="grid gap-2 text-[11px] font-bold">
      {label}
      <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => onChange(event.target.value)} type="number" value={value} />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#e1e8df] pb-2 last:border-b-0 last:pb-0">
      <span className="text-[#687084]">{label}</span>
      <span className="text-right font-extrabold">{value}</span>
    </div>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#e1e8df]">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  );
}

function findDevice(id: string) {
  return devices.find((device) => device.id === id) ?? devices[0];
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
