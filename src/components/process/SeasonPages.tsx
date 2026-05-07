'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  QrCode,
  Scale,
  Search,
  Sprout,
  Trash2,
  Truck,
  Upload,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react';

type SeasonStatus = 'active' | 'ready' | 'review';
type TaskStatus = 'done' | 'doing' | 'blocked' | 'todo';
type ReadinessStatus = 'done' | 'pending' | 'blocked';
type ProcessPageKey = 'overview' | 'templates' | 'active' | 'calendar' | 'logs' | 'inputs';
type CropProcessStatus = 'draft' | 'active' | 'suspended' | 'completed' | 'abandoned';
type FarmingTaskStatus = 'pending' | 'due_soon' | 'overdue' | 'in_progress' | 'completed' | 'skipped';
type InputStatus = 'active' | 'banned';

type Season = {
  id: string;
  name: string;
  zone: string;
  province: string;
  crop: string;
  area: string;
  progress: number;
  expectedYield: string;
  declaredYield: string;
  harvestWindow: string;
  status: SeasonStatus;
  parcels: number;
  gradeTarget: string;
  tracePending: number;
  poLinked: number;
};

type ProcessTemplate = {
  code: string;
  name: string;
  stages: number;
  crop: string;
  harvestGate: string;
  status?: 'draft' | 'published' | 'archived';
  version?: number;
};

type TemplateTaskDraft = {
  id: string;
  name: string;
  taskType: string;
  dayOffset: string;
  inputName: string;
  quantity: string;
  unit: string;
  requiredPhoto: boolean;
  allowSkip: boolean;
};

type TemplateStageDraft = {
  id: string;
  key: string;
  name: string;
  start: string;
  end: string;
  tasks: TemplateTaskDraft[];
};

type ActiveProcess = {
  id: string;
  name: string;
  parcel: string;
  zone: string;
  crop: string;
  template: string;
  templateVersion: number;
  plantedDate: string;
  status: CropProcessStatus;
  progress: number;
  assignee: string;
};

type ProcessTaskItem = {
  id: string;
  processId: string;
  stage: string;
  name: string;
  type: string;
  parcel: string;
  assignee: string;
  dueDate: string;
  status: FarmingTaskStatus;
  requiredPhoto: boolean;
  allowSkip: boolean;
};

type FarmingLog = {
  id: string;
  taskId: string;
  parcel: string;
  loggedBy: string;
  loggedAt: string;
  status: 'partial' | 'complete';
  source: 'manual' | 'iot_trigger' | 'ai_suggestion';
  inputs: string;
  notes: string;
  photos: number;
  anomaly?: string;
};

type InputCatalogItem = {
  id: string;
  name: string;
  activeIngredient: string;
  category: string;
  unit: string;
  scope: 'system' | 'workspace';
  status: InputStatus;
  vietgap: boolean;
  enabled: boolean;
};

const seasons: Season[] = [
  {
    id: 'season-dx-2026',
    name: 'Vụ Đông Xuân 2026',
    zone: 'Vùng lúa Long An',
    province: 'Long An',
    crop: 'Lúa ST25',
    area: '84.6 ha',
    progress: 78,
    expectedYield: '512 tấn',
    declaredYield: '186 tấn',
    harvestWindow: '05/05 - 22/05/2026',
    status: 'ready',
    parcels: 31,
    gradeTarget: 'A / VietGAP',
    tracePending: 18,
    poLinked: 4,
  },
  {
    id: 'season-ht-2026',
    name: 'Vụ Hè Thu 2026',
    zone: 'Vùng rau Củ Chi',
    province: 'TP. Hồ Chí Minh',
    crop: 'Rau ăn lá',
    area: '38.4 ha',
    progress: 46,
    expectedYield: '96 tấn',
    declaredYield: '0 tấn',
    harvestWindow: '18/06 - 30/06/2026',
    status: 'active',
    parcels: 18,
    gradeTarget: 'B / VietGAP',
    tracePending: 0,
    poLinked: 1,
  },
  {
    id: 'season-fruit-2026',
    name: 'Niên vụ 2026',
    zone: 'Vùng cây ăn trái Đồng Nai',
    province: 'Đồng Nai',
    crop: 'Sầu riêng',
    area: '52.8 ha',
    progress: 64,
    expectedYield: '148 tấn',
    declaredYield: '21 tấn',
    harvestWindow: '12/05 - 18/06/2026',
    status: 'review',
    parcels: 24,
    gradeTarget: 'A / GlobalGAP',
    tracePending: 6,
    poLinked: 2,
  },
];

const tasks = [
  { name: 'Kiểm tra độ chín lúa ST25', owner: 'Nguyễn Văn An', due: 'Hôm nay', status: 'doing' as TaskStatus },
  { name: 'Chốt danh sách thửa đủ điều kiện thu hoạch', owner: 'Trần Thị Bình', due: '28/04', status: 'todo' as TaskStatus },
  { name: 'Đối chiếu sản lượng thực tế với dự kiến', owner: 'Lê Văn Công', due: '30/04', status: 'blocked' as TaskStatus },
  { name: 'Tạo gói truy xuất cho lô đã xác nhận', owner: 'Hệ thống', due: 'Tự động', status: 'done' as TaskStatus },
];

const activeProcesses: ActiveProcess[] = [
  { id: 'CP-2026-001', name: 'Lúa Đông Xuân 2026', parcel: 'P-LA-032', zone: 'Vùng lúa Long An', crop: 'Lúa ST25', template: 'TPL-RICE-01', templateVersion: 1, plantedDate: '2026-01-12', status: 'active', progress: 78, assignee: 'Lê Văn Công' },
  { id: 'CP-2026-002', name: 'Rau Củ Chi Hè Thu', parcel: 'P-HCM-001', zone: 'Vùng rau Củ Chi', crop: 'Rau ăn lá', template: 'TPL-VEG-02', templateVersion: 2, plantedDate: '2026-04-18', status: 'active', progress: 46, assignee: 'Nguyễn Văn An' },
  { id: 'CP-2026-003', name: 'Sầu riêng Xuân Lộc', parcel: 'P-DN-014', zone: 'Vùng cây ăn trái Đồng Nai', crop: 'Sầu riêng', template: 'TPL-FRUIT-03', templateVersion: 1, plantedDate: '2025-12-20', status: 'suspended', progress: 64, assignee: 'Trần Thị Bình' },
];

const processTasks: ProcessTaskItem[] = [
  { id: 'TASK-001', processId: 'CP-2026-001', stage: 'Làm đòng', name: 'Kiểm tra đạo ôn', type: 'inspect', parcel: 'P-LA-032', assignee: 'Lê Văn Công', dueDate: '2026-04-27', status: 'due_soon', requiredPhoto: true, allowSkip: false },
  { id: 'TASK-002', processId: 'CP-2026-001', stage: 'Làm đòng', name: 'Bón đòng lần 2', type: 'fertilize', parcel: 'P-LA-032', assignee: 'Lê Văn Công', dueDate: '2026-04-25', status: 'overdue', requiredPhoto: true, allowSkip: false },
  { id: 'TASK-003', processId: 'CP-2026-002', stage: 'Chăm sóc', name: 'Tưới định kỳ', type: 'irrigate', parcel: 'P-HCM-001', assignee: 'Nguyễn Văn An', dueDate: '2026-04-28', status: 'pending', requiredPhoto: false, allowSkip: true },
  { id: 'TASK-004', processId: 'CP-2026-002', stage: 'Chăm sóc', name: 'Phun chế phẩm sinh học', type: 'spray', parcel: 'P-HCM-001', assignee: 'Nguyễn Văn An', dueDate: '2026-04-29', status: 'in_progress', requiredPhoto: true, allowSkip: false },
  { id: 'TASK-005', processId: 'CP-2026-003', stage: 'Nuôi trái', name: 'Đo kích thước trái', type: 'inspect', parcel: 'P-DN-014', assignee: 'Trần Thị Bình', dueDate: '2026-04-24', status: 'completed', requiredPhoto: true, allowSkip: false },
];

const farmingLogs: FarmingLog[] = [
  { id: 'LOG-001', taskId: 'TASK-005', parcel: 'P-DN-014', loggedBy: 'Trần Thị Bình', loggedAt: '2026-04-24 08:30', status: 'complete', source: 'manual', inputs: 'Không dùng vật tư', notes: 'Trái phát triển ổn định, ảnh đã lưu.', photos: 3 },
  { id: 'LOG-002', taskId: 'TASK-004', parcel: 'P-HCM-001', loggedBy: 'Nguyễn Văn An', loggedAt: '2026-04-26 16:45', status: 'partial', source: 'ai_suggestion', inputs: 'Chế phẩm sinh học 2 lít · số lô BIO2604', notes: 'Có dấu hiệu sâu ăn lá nhẹ.', photos: 2, anomaly: 'sâu hại / mức trung bình' },
  { id: 'LOG-003', taskId: 'TASK-001', parcel: 'P-LA-032', loggedBy: 'Lê Văn Công', loggedAt: '2026-04-27 07:20', status: 'complete', source: 'iot_trigger', inputs: 'NPK 16-16-8 35kg · số lô NPK2604', notes: 'Độ ẩm phù hợp, không phát hiện bệnh.', photos: 1 },
];

const inputCatalog: InputCatalogItem[] = [
  { id: 'INP-001', name: 'NPK 16-16-8', activeIngredient: 'N-P-K', category: 'fertilizer', unit: 'kg', scope: 'system', status: 'active', vietgap: true, enabled: true },
  { id: 'INP-002', name: 'Chế phẩm sinh học BIO-01', activeIngredient: 'Bacillus spp.', category: 'pesticide', unit: 'lít', scope: 'workspace', status: 'active', vietgap: true, enabled: true },
  { id: 'INP-003', name: 'Thuốc trừ cỏ Paraquat', activeIngredient: 'Paraquat', category: 'herbicide', unit: 'lít', scope: 'system', status: 'banned', vietgap: false, enabled: false },
  { id: 'INP-004', name: 'Phân hữu cơ vi sinh', activeIngredient: 'Chất hữu cơ', category: 'fertilizer', unit: 'kg', scope: 'workspace', status: 'active', vietgap: true, enabled: true },
];

const templates: ProcessTemplate[] = [
  { code: 'TPL-RICE-01', name: 'Quy trình lúa ST25', stages: 8, crop: 'Lúa', harvestGate: 'Kiểm tra độ chín + nhật ký đầu vào' },
  { code: 'TPL-VEG-02', name: 'Quy trình rau ăn lá VietGAP', stages: 9, crop: 'Rau', harvestGate: 'Cách ly thuốc BVTV + kiểm tra lô' },
  { code: 'TPL-FRUIT-03', name: 'Quy trình sầu riêng', stages: 11, crop: 'Cây ăn trái', harvestGate: 'Chỉ số trưởng thành + phân hạng' },
];

const templateStages: Record<string, Array<{ name: string; range: string; tasks: string; status: string }>> = {
  'TPL-RICE-01': [
    { name: 'Làm đất', range: 'Ngày 0 - 7', tasks: 'Cày ải, san phẳng mặt ruộng, kiểm tra pH', status: 'Sẽ sinh 4 công việc' },
    { name: 'Gieo sạ', range: 'Ngày 8 - 15', tasks: 'Ngâm ủ giống, gieo sạ, tưới giữ ẩm', status: 'Sẽ sinh 5 công việc' },
    { name: 'Đẻ nhánh', range: 'Ngày 16 - 45', tasks: 'Bón thúc NPK, quản lý nước, kiểm tra sâu cuốn lá', status: 'Sẽ sinh 9 công việc' },
    { name: 'Làm đòng', range: 'Ngày 46 - 75', tasks: 'Bón đòng, phòng đạo ôn, ghi nhận ảnh đồng ruộng', status: 'Sẽ sinh 7 công việc' },
    { name: 'Thu hoạch', range: 'Ngày 76 - 95', tasks: 'Kiểm tra độ chín, đo ẩm, khai báo xác nhận thu hoạch', status: 'Sẽ sinh 5 công việc' },
  ],
  'TPL-VEG-02': [
    { name: 'Chuẩn bị đất', range: 'Ngày 0 - 5', tasks: 'Làm đất, bón lót, kiểm tra pH', status: 'Sẽ sinh 3 công việc' },
    { name: 'Gieo trồng', range: 'Ngày 6 - 10', tasks: 'Gieo hạt, tưới lần 1, ảnh hiện trường', status: 'Sẽ sinh 4 công việc' },
    { name: 'Chăm sóc', range: 'Ngày 11 - 32', tasks: 'Tưới, bón thúc, kiểm tra sâu bệnh', status: 'Sẽ sinh 8 công việc' },
    { name: 'Thu hoạch', range: 'Ngày 33 - 45', tasks: 'Kiểm tra cách ly, phân hạng, khai báo thu hoạch', status: 'Sẽ sinh 5 công việc' },
  ],
  'TPL-FRUIT-03': [
    { name: 'Ra hoa', range: 'Ngày 0 - 30', tasks: 'Theo dõi ra hoa, tưới giữ ẩm, ghi nhận thời tiết', status: 'Sẽ sinh 5 công việc' },
    { name: 'Đậu trái', range: 'Ngày 31 - 65', tasks: 'Tỉa trái, bón phân hữu cơ, kiểm tra sâu bệnh', status: 'Sẽ sinh 7 công việc' },
    { name: 'Nuôi trái', range: 'Ngày 66 - 120', tasks: 'Bón Kali, đo kích thước trái, ảnh định kỳ', status: 'Sẽ sinh 9 công việc' },
    { name: 'Phân hạng', range: 'Ngày 121 - 145', tasks: 'Kiểm tra độ già, phân loại hạng A/B, chuẩn bị đơn hàng', status: 'Sẽ sinh 6 công việc' },
    { name: 'Thu hoạch', range: 'Ngày 146 - 165', tasks: 'Cắt trái, cân kg, tạo gói truy xuất', status: 'Sẽ sinh 5 công việc' },
  ],
};

const harvestFlow: Array<{ icon: LucideIcon; title: string; detail: string }> = [
  { icon: CalendarDays, title: 'Lập kế hoạch mùa vụ', detail: 'Chọn vùng, thửa đất, cây trồng và khung thời gian canh tác.' },
  { icon: ClipboardCheck, title: 'Hoàn tất giai đoạn bắt buộc', detail: 'Đủ nhật ký đầu vào, kiểm tra hiện trường và phân hạng trước thu.' },
  { icon: Wheat, title: 'Khai báo sản lượng', detail: 'Nhập sản phẩm, kg, hạng chất lượng, ngày thu hoạch và ảnh minh chứng.' },
  { icon: PackageCheck, title: 'Xác nhận thu hoạch', detail: 'Sau xác nhận, bản ghi chỉ được bổ sung, không sửa/xóa.' },
  { icon: Truck, title: 'Liên kết đơn thu mua', detail: 'Đơn thu mua đi qua các trạng thái: nháp, xác nhận, đã giao, hoàn tất.' },
  { icon: QrCode, title: 'Tạo gói truy xuất', detail: 'Bản ghi cố định phục vụ mã QR và tra cứu công khai.' },
];

const statusStyle: Record<SeasonStatus, string> = {
  active: 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]',
  ready: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
  review: 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]',
};

const statusLabel: Record<SeasonStatus, string> = {
  active: 'Đang chăm sóc',
  ready: 'Sẵn sàng thu hoạch',
  review: 'Cần rà soát',
};

const taskStyle: Record<TaskStatus, string> = {
  done: 'bg-[#dcfce7] text-[#15803d]',
  doing: 'bg-[#dbeafe] text-[#2563eb]',
  blocked: 'bg-[#fee2e2] text-[#dc2626]',
  todo: 'bg-[#f3f4f6] text-[#4b5563]',
};

const taskLabel: Record<TaskStatus, string> = {
  done: 'Đã xong',
  doing: 'Đang làm',
  blocked: 'Chặn',
  todo: 'Mới',
};

const readinessStyle: Record<ReadinessStatus, string> = {
  done: 'bg-[#dcfce7] text-[#15803d]',
  pending: 'bg-[#fef3c7] text-[#a16207]',
  blocked: 'bg-[#fee2e2] text-[#dc2626]',
};

const cropProcessStatusLabel: Record<CropProcessStatus, string> = {
  draft: 'Nháp',
  active: 'Đang chạy',
  suspended: 'Tạm dừng',
  completed: 'Hoàn thành',
  abandoned: 'Bỏ vụ',
};

const cropProcessStatusStyle: Record<CropProcessStatus, string> = {
  draft: 'border-[#d1d5db] bg-[#f9fafb] text-[#4b5563]',
  active: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
  suspended: 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]',
  completed: 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]',
  abandoned: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
};

const farmingTaskStatusLabel: Record<FarmingTaskStatus, string> = {
  pending: 'Chờ làm',
  due_soon: 'Sắp đến hạn',
  overdue: 'Quá hạn',
  in_progress: 'Đang làm',
  completed: 'Hoàn thành',
  skipped: 'Bỏ qua',
};

const farmingTaskStatusStyle: Record<FarmingTaskStatus, string> = {
  pending: 'bg-[#f3f4f6] text-[#4b5563]',
  due_soon: 'bg-[#fef3c7] text-[#a16207]',
  overdue: 'bg-[#fee2e2] text-[#dc2626]',
  in_progress: 'bg-[#dbeafe] text-[#2563eb]',
  completed: 'bg-[#dcfce7] text-[#15803d]',
  skipped: 'bg-[#f3f4f6] text-[#6b7280]',
};

const taskTypeLabel: Record<string, string> = {
  fertilize: 'Bón phân',
  irrigate: 'Tưới nước',
  spray: 'Phun thuốc',
  inspect: 'Kiểm tra',
  harvest: 'Thu hoạch',
  other: 'Khác',
};

const logSourceLabel: Record<FarmingLog['source'], string> = {
  manual: 'Thủ công',
  iot_trigger: 'Từ cảm biến IoT',
  ai_suggestion: 'Gợi ý AI',
};

const logStatusLabel: Record<FarmingLog['status'], string> = {
  partial: 'Một phần',
  complete: 'Hoàn tất',
};

const inputCategoryLabel: Record<string, string> = {
  fertilizer: 'Phân bón',
  pesticide: 'Thuốc bảo vệ thực vật',
  fungicide: 'Thuốc nấm',
  herbicide: 'Thuốc cỏ',
  seed: 'Giống cây',
  other: 'Khác',
};

function ProcessHeader({ active }: { active: ProcessPageKey }) {
  return (
    <div className="border-b border-[#e5eadf] bg-[#f7faf8] px-5 pb-5 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#16a34a]">Mùa vụ</p>
          <h1 className="mt-1 text-[26px] font-extrabold leading-8 text-[#111827]">Quản lý quy trình canh tác</h1>
          <p className="mt-2 text-sm leading-6 text-[#5f6b7a]">
            Theo dõi tiến độ trồng trọt, công việc theo giai đoạn, hạn xử lý và nhật ký canh tác của từng thửa ruộng.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(260px,1fr)_180px_180px] gap-3 rounded-xl border border-[#e1e8df] bg-white p-3 shadow-sm">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 text-[#7a8699]" size={15} />
          <input className="h-10 w-full rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] pl-9 pr-3 text-sm outline-none focus:border-[#16a34a]" placeholder="Tìm quy trình, công việc, thửa ruộng" />
        </label>
        <select className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-sm font-medium outline-none focus:border-[#16a34a]">
          <option>Tất cả thửa ruộng</option>
          <option>P-LA-032</option>
          <option>P-HCM-001</option>
          <option>P-DN-014</option>
        </select>
        <select className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-sm font-medium outline-none focus:border-[#16a34a]">
          <option>Tất cả cây trồng</option>
          <option>Lúa ST25</option>
          <option>Rau ăn lá</option>
          <option>Sầu riêng</option>
        </select>
      </div>

      <div className="mt-4 flex">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e1e8df] bg-white p-1.5 shadow-sm">
          {[
            { id: 'overview', href: '/process/tasks/', label: 'Tổng quan mùa vụ', icon: Sprout },
            { id: 'templates', href: '/process/templates/', label: 'Mẫu quy trình', icon: ClipboardCheck },
            { id: 'active', href: '/process/active/', label: 'Quy trình đang chạy', icon: Scale },
            { id: 'calendar', href: '/process/calendar/', label: 'Lịch công việc', icon: CalendarDays },
            { id: 'logs', href: '/process/logs/', label: 'Nhật ký', icon: FileText },
            { id: 'inputs', href: '/process/inputs/', label: 'Vật tư', icon: PackageCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const selected = active === tab.id;

            return (
              <Link
                aria-current={selected ? 'page' : undefined}
                className={`inline-flex h-9 min-w-[148px] items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${
                  selected
                    ? 'border-[#16a34a] bg-[#ecfdf3] text-[#15803d] shadow-sm'
                    : 'border-transparent text-[#334155] hover:border-[#d5d9df] hover:bg-[#f7faf8] hover:text-[#16a34a]'
                }`}
                href={tab.href}
                key={tab.id}
              >
                <Icon size={14} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SeasonOverviewPage() {
  const [seasonList, setSeasonList] = useState<Season[]>(seasons);
  const [selectedId, setSelectedId] = useState(seasons[0].id);
  const [region, setRegion] = useState('all');
  const [crop, setCrop] = useState('all');
  const [status, setStatus] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [harvestOpen, setHarvestOpen] = useState(false);

  const selectedSeason = seasonList.find((season) => season.id === selectedId) ?? seasonList[0];

  const filteredSeasons = useMemo(() => {
    return seasonList.filter((season) => {
      const matchedRegion = region === 'all' || season.province === region;
      const matchedCrop = crop === 'all' || season.crop === crop;
      const matchedStatus = status === 'all' || season.status === status;
      return matchedRegion && matchedCrop && matchedStatus;
    });
  }, [crop, region, seasonList, status]);

  function createSeason(season: Season) {
    setSeasonList((current) => [season, ...current]);
    setSelectedId(season.id);
    setCreateOpen(false);
  }

  function updateSeason(season: Season) {
    setSeasonList((current) => current.map((item) => (item.id === season.id ? season : item)));
    setSelectedId(season.id);
    setEditingSeason(null);
  }

  function deleteSeason(seasonId: string) {
    const deleting = seasonList.find((season) => season.id === seasonId);
    if (!deleting) return;
    if (!window.confirm(`Xóa mùa vụ "${deleting.name}"?`)) return;

    setSeasonList((current) => {
      const next = current.filter((season) => season.id !== seasonId);
      if (selectedId === seasonId && next[0]) setSelectedId(next[0].id);
      return next;
    });
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="overview" />
      <div className="p-5">
        <div className="grid grid-cols-4 gap-3">
          <Metric icon={Sprout} label="Mùa vụ đang chạy" value={String(seasonList.length)} tone="green" />
          <Metric icon={Scale} label="Sản lượng dự kiến" value="756 tấn" tone="blue" />
          <Metric icon={PackageCheck} label="Đã khai báo thu hoạch" value="207 tấn" tone="amber" />
          <Metric icon={QrCode} label="Gói truy xuất chờ tạo" value="24 lô" tone="gray" />
        </div>

        <section className="mt-4 rounded-xl border border-[#e1e8df] bg-white p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            <FilterSelect label="Khu vực" onChange={setRegion} value={region}>
              <option value="all">Tất cả khu vực</option>
              <option value="Long An">Long An</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đồng Nai">Đồng Nai</option>
            </FilterSelect>
            <FilterSelect label="Cây trồng" onChange={setCrop} value={crop}>
              <option value="all">Tất cả cây trồng</option>
              <option value="Lúa ST25">Lúa ST25</option>
              <option value="Rau ăn lá">Rau ăn lá</option>
              <option value="Sầu riêng">Sầu riêng</option>
            </FilterSelect>
            <FilterSelect label="Trạng thái" onChange={setStatus} value={status}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang chăm sóc</option>
              <option value="ready">Sẵn sàng thu hoạch</option>
              <option value="review">Cần rà soát</option>
            </FilterSelect>
            <button className="mt-[18px] h-9 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" onClick={() => setCreateOpen(true)} type="button">
              + Tạo mùa vụ
            </button>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_380px] gap-4">
          <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold">Danh sách mùa vụ</h2>
                <p className="mt-1 text-xs text-[#687084]">Mỗi mùa vụ liên kết vùng canh tác, thửa đất, quy trình và bản ghi thu hoạch chỉ được bổ sung.</p>
              </div>
              <span className="rounded-full border border-[#d5d9df] px-3 py-1 text-[11px] font-bold text-[#687084]">{filteredSeasons.length} mùa vụ</span>
            </div>

            <div className="mt-4 grid gap-3">
              {filteredSeasons.map((season) => (
                <article
                  className={`cursor-pointer rounded-xl border p-4 text-left shadow-sm transition ${
                    selectedSeason.id === season.id ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e1e8df] bg-white hover:border-[#86efac]'
                  }`}
                  key={season.id}
                  onClick={() => setSelectedId(season.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold">{season.name}</h3>
                      <p className="mt-1 text-xs text-[#687084]">{season.zone} · {season.crop} · {season.area}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusStyle[season.status]}`}>
                        {statusLabel[season.status]}
                      </span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d5d9df] bg-white text-[#475569] hover:text-[#16a34a]"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingSeason(season);
                        }}
                        title="Sửa mùa vụ"
                        type="button"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteSeason(season.id);
                        }}
                        title="Xóa mùa vụ"
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-[1fr_120px_120px_150px] gap-3 text-xs">
                    <div>
                      <p className="font-bold">Tiến độ canh tác</p>
                      <div className="mt-2 h-2 rounded-full bg-[#eef1f4]">
                        <div className="h-2 rounded-full bg-[#16a34a]" style={{ width: `${season.progress}%` }} />
                      </div>
                      <p className="mt-1 text-[#687084]">{season.progress}% hoàn thành</p>
                    </div>
                    <StatInline label="Dự kiến" value={season.expectedYield} />
                    <StatInline label="Đã khai báo" value={season.declaredYield} />
                    <StatInline label="Khung thu hoạch" value={season.harvestWindow} />
                  </div>
                </article>
              ))}

              {filteredSeasons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d5d9df] bg-white p-8 text-center text-xs text-[#687084]">Không có mùa vụ phù hợp bộ lọc.</div>
              ) : null}
            </div>
          </section>

          {selectedSeason ? <SeasonDetailPanel onDeclareHarvest={() => setHarvestOpen(true)} season={selectedSeason} /> : null}
        </div>
      </div>

      {createOpen ? <SeasonFormModal mode="create" onClose={() => setCreateOpen(false)} onSubmit={createSeason} /> : null}
      {editingSeason ? <SeasonFormModal initialSeason={editingSeason} mode="edit" onClose={() => setEditingSeason(null)} onSubmit={updateSeason} /> : null}
      {harvestOpen && selectedSeason ? <HarvestEntryModal onClose={() => setHarvestOpen(false)} season={selectedSeason} /> : null}
    </section>
  );
}

function SeasonDetailPanel({ onDeclareHarvest, season }: { onDeclareHarvest: () => void; season: Season }) {
  const readiness: Array<{ label: string; detail: string; status: ReadinessStatus }> = [
    { label: 'Nhật ký đầu vào', detail: 'Đủ phân bón, thuốc BVTV và số lô vật tư', status: 'done' },
    { label: 'Kiểm tra thửa đủ điều kiện', detail: `${season.parcels} thửa trong vùng đang được theo dõi`, status: season.status === 'active' ? 'pending' : 'done' },
    { label: 'Phân hạng chất lượng', detail: `Mục tiêu ${season.gradeTarget}`, status: season.status === 'review' ? 'blocked' : 'done' },
    { label: 'Gói truy xuất', detail: `${season.tracePending} lô chờ tạo bản ghi truy xuất cố định`, status: season.tracePending > 0 ? 'pending' : 'done' },
  ];

  return (
    <aside className="grid gap-4">
      <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-[#16a34a]">Chi tiết mùa vụ</p>
            <h2 className="mt-1 text-lg font-extrabold">{season.name}</h2>
            <p className="mt-1 text-xs text-[#687084]">{season.zone}</p>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusStyle[season.status]}`}>{statusLabel[season.status]}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatInline label="Cây trồng" value={season.crop} />
          <StatInline label="Diện tích" value={season.area} />
          <StatInline label="Thửa đất" value={`${season.parcels} thửa`} />
          <StatInline label="Đơn hàng liên kết" value={`${season.poLinked} đơn`} />
        </div>

        <button className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#16a34a] text-xs font-bold text-white" onClick={onDeclareHarvest} type="button">
          <Plus size={14} />
          Khai báo sản lượng thu hoạch
        </button>
      </section>

      <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold">Điều kiện thu hoạch</h2>
        <div className="mt-3 grid gap-2">
          {readiness.map((item) => (
            <div className="rounded-md border border-[#e1e4e8] p-3" key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold">{item.label}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${readinessStyle[item.status]}`}>
                  {item.status === 'done' ? 'Đạt' : item.status === 'pending' ? 'Chờ' : 'Rà soát'}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-[#687084]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold">Công việc cần xử lý</h2>
        <div className="mt-3 grid gap-2">
          {tasks.map((task) => (
            <div className="rounded-md border border-[#e1e4e8] p-3" key={task.name}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-extrabold">{task.name}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${taskStyle[task.status]}`}>{taskLabel[task.status]}</span>
              </div>
              <p className="mt-2 text-[11px] text-[#687084]">{task.owner} · {task.due}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function SeasonFormModal({
  initialSeason,
  mode,
  onClose,
  onSubmit,
}: {
  initialSeason?: Season;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (season: Season) => void;
}) {
  const editing = mode === 'edit';
  const [name, setName] = useState(initialSeason?.name ?? '');
  const [zone, setZone] = useState(initialSeason?.zone ?? '');
  const [province, setProvince] = useState(initialSeason?.province ?? '');
  const [crop, setCrop] = useState(initialSeason?.crop ?? '');
  const [template, setTemplate] = useState(initialSeason ? templateFromCrop(initialSeason.crop) : '');
  const [plantedDate, setPlantedDate] = useState('');
  const [harvestStart, setHarvestStart] = useState(initialSeason ? dateFromHarvestWindow(initialSeason.harvestWindow, 0) : '');
  const [harvestEnd, setHarvestEnd] = useState(initialSeason ? dateFromHarvestWindow(initialSeason.harvestWindow, 1) : '');
  const [area, setArea] = useState(initialSeason ? initialSeason.area.replace(' ha', '') : '');
  const [parcels, setParcels] = useState(initialSeason ? String(initialSeason.parcels) : '');
  const [expectedYield, setExpectedYield] = useState(initialSeason ? initialSeason.expectedYield.replace(' tấn', '') : '');
  const [owner, setOwner] = useState(editing ? 'Nguyễn Văn An' : '');
  const [notes, setNotes] = useState('');

  const selectedTemplate = templates.find((item) => item.code === template);
  const stagePreview = template ? templateStages[template] ?? [] : [];
  const canSubmit = Boolean(name && zone && province && crop && template && harvestStart && harvestEnd && area && parcels && expectedYield);

  function submitSeason() {
    if (!canSubmit) return;

    const saved: Season = {
      id: initialSeason?.id ?? `season-${Date.now()}`,
      name,
      zone,
      province,
      crop,
      area: `${area} ha`,
      progress: initialSeason?.progress ?? 0,
      expectedYield: `${expectedYield} tấn`,
      declaredYield: initialSeason?.declaredYield ?? '0 tấn',
      harvestWindow: `${formatDate(harvestStart)} - ${formatDate(harvestEnd)}`,
      status: initialSeason?.status ?? 'active',
      parcels: Number(parcels) || 0,
      gradeTarget: selectedTemplate?.crop === 'Rau' ? 'B / VietGAP' : 'A / VietGAP',
      tracePending: initialSeason?.tracePending ?? 0,
      poLinked: initialSeason?.poLinked ?? 0,
    };

    onSubmit(saved);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="flex max-h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e1e4e8] px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold">{editing ? 'Sửa mùa vụ' : 'Tạo mùa vụ mới'}</h2>
            <p className="mt-1 text-xs text-[#687084]">{editing ? 'Cập nhật thông tin quy trình canh tác, lịch và kế hoạch sản lượng.' : 'Tạo quy trình canh tác, chọn mẫu và sinh lịch giai đoạn/công việc theo ngày trồng.'}</p>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f3f4f6]" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_300px] gap-4 overflow-y-auto p-5">
          <section className="grid gap-4">
            <div className="rounded-xl border border-[#e1e8df] bg-white p-4 shadow-sm">
              <h3 className="text-sm font-extrabold">Thông tin mùa vụ</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="col-span-2 grid gap-2 text-xs font-bold">
                  Tên mùa vụ
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Vụ Đông Xuân 2026" value={name} />
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Vùng canh tác
                  <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setZone(event.target.value)} value={zone}>
                    <option disabled value="">Chọn vùng canh tác</option>
                    <option>Vùng rau Củ Chi</option>
                    <option>Vùng lúa Long An</option>
                    <option>Vùng cây ăn trái Đồng Nai</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Tỉnh/Thành
                  <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setProvince(event.target.value)} value={province}>
                    <option disabled value="">Chọn tỉnh/thành</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Long An</option>
                    <option>Đồng Nai</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Cây trồng
                  <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setCrop(event.target.value)} value={crop}>
                    <option disabled value="">Chọn cây trồng</option>
                    <option>Rau ăn lá</option>
                    <option>Lúa ST25</option>
                    <option>Sầu riêng</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Người phụ trách
                  <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setOwner(event.target.value)} value={owner}>
                    <option disabled value="">Chọn người phụ trách</option>
                    <option>Nguyễn Văn An</option>
                    <option>Trần Thị Bình</option>
                    <option>Lê Văn Công</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-[#e1e4e8] p-4">
              <h3 className="text-sm font-extrabold">Quy trình và lịch tương đối</h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <label className="col-span-3 grid gap-2 text-xs font-bold">
                  Mẫu quy trình
                  <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setTemplate(event.target.value)} value={template}>
                    <option disabled value="">Chọn mẫu quy trình</option>
                    {templates.map((item) => (
                      <option key={item.code} value={item.code}>{item.code} · {item.name}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Ngày trồng
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setPlantedDate(event.target.value)} type="date" value={plantedDate} />
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Bắt đầu thu hoạch
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setHarvestStart(event.target.value)} type="date" value={harvestStart} />
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Kết thúc thu hoạch
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setHarvestEnd(event.target.value)} type="date" value={harvestEnd} />
                </label>
              </div>

              {template ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-[#e1e4e8]">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-[#f3f4f6] text-[#687084]">
                      <tr>
                        <th className="px-3 py-2 font-bold">Giai đoạn</th>
                        <th className="px-3 py-2 font-bold">Mốc ngày</th>
                        <th className="px-3 py-2 font-bold">Công việc sinh ra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stagePreview.map((stage) => (
                        <tr className="border-t border-[#e1e4e8]" key={stage.name}>
                          <td className="px-3 py-3 font-extrabold">{stage.name}</td>
                          <td className="px-3 py-3 text-[#687084]">{stage.range}</td>
                          <td className="px-3 py-3">
                            <p>{stage.tasks}</p>
                            <p className="mt-1 text-[10px] font-bold text-[#16a34a]">{stage.status}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-[#d5d9df] bg-[#f8fafc] p-6 text-center text-xs text-[#687084]">
                  Chọn mẫu quy trình để xem các giai đoạn và công việc sẽ được sinh ra.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#e1e8df] bg-white p-4 shadow-sm">
              <h3 className="text-sm font-extrabold">Sản lượng kế hoạch</h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <label className="grid gap-2 text-xs font-bold">
                  Diện tích (ha)
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setArea(event.target.value)} placeholder="0.0" type="number" value={area} />
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Số thửa áp dụng
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setParcels(event.target.value)} placeholder="0" type="number" value={parcels} />
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Sản lượng dự kiến (tấn)
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setExpectedYield(event.target.value)} placeholder="0" type="number" value={expectedYield} />
                </label>
                <label className="col-span-3 grid gap-2 text-xs font-bold">
                  Ghi chú
                  <textarea className="min-h-20 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 py-2 text-xs outline-none" maxLength={500} onChange={(event) => setNotes(event.target.value)} placeholder="Ghi chú tối đa 500 ký tự" value={notes} />
                </label>
              </div>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <section className="rounded-lg border border-[#e1e4e8] bg-[#f8fafc] p-4">
              <h3 className="text-sm font-extrabold">{editing ? 'Tóm tắt chỉnh sửa' : 'Tóm tắt tạo mới'}</h3>
              <div className="mt-3 grid gap-2 text-xs">
                <SummaryRow label="Mùa vụ" value={name || 'Chưa nhập'} />
                <SummaryRow label="Vùng" value={zone || 'Chưa chọn'} />
                <SummaryRow label="Mẫu quy trình" value={selectedTemplate?.code ?? 'Chưa chọn'} />
                <SummaryRow label="Ngày trồng" value={plantedDate ? formatDate(plantedDate) : 'Chưa chọn'} />
                <SummaryRow label="Thu hoạch" value={`${formatDate(harvestStart)} - ${formatDate(harvestEnd)}`} />
                <SummaryRow label="Phụ trách" value={owner || 'Chưa chọn'} />
              </div>
            </section>

            <section className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs">
              <h3 className="font-extrabold text-[#15803d]">Sau khi tạo</h3>
              <div className="mt-3 grid gap-2 text-[#166534]">
                <p>• Quy trình ở trạng thái nháp hoặc đang chạy trong không gian làm việc hiện tại.</p>
                <p>• Hệ thống sinh giai đoạn và công việc theo mốc ngày từ ngày trồng.</p>
                <p>• Công việc đến hạn sẽ phục vụ kiểm tra, ảnh, vật tư và truy xuất VietGAP.</p>
              </div>
            </section>

            <section className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] p-4 text-xs text-[#0369a1]">
              Nhật ký canh tác từ mùa vụ này sẽ là nguồn dữ liệu cho gói truy xuất khi thu hoạch được xác nhận.
            </section>
          </aside>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e1e4e8] px-5 py-4">
          <button className="h-9 rounded-md border border-[#d5d9df] px-4 text-xs font-bold" onClick={onClose} type="button">Hủy</button>
          <button className="h-9 rounded-md border border-[#d5d9df] px-4 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSubmit} onClick={submitSeason} type="button">Lưu nháp</button>
          <button className="h-9 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSubmit} onClick={submitSeason} type="button">{editing ? 'Lưu thay đổi' : 'Tạo & kích hoạt'}</button>
        </div>
      </div>
    </div>
  );
}

function HarvestEntryModal({ onClose, season }: { onClose: () => void; season: Season }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-[520px] overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e1e4e8] px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold">Khai báo sản lượng thu hoạch</h2>
            <p className="mt-1 text-xs text-[#687084]">{season.name} · {season.zone}</p>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f3f4f6]" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-3 px-5 py-4">
          <label className="grid gap-2 text-xs font-bold">
            Thửa đất
            <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none">
              <option>P-HCM-001 · Rau ăn lá</option>
              <option>P-LA-032 · Lúa ST25</option>
              <option>P-DN-014 · Sầu riêng</option>
            </select>
          </label>
          <label className="grid gap-2 text-xs font-bold">
            Sản phẩm
            <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" defaultValue={season.crop} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-xs font-bold">
              Sản lượng (kg)
              <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" min={1} max={100000} placeholder="Tối đa 100.000 kg" type="number" />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Hạng chất lượng
              <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-xs font-bold">
            Ngày thu hoạch
            <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" type="date" />
          </label>
          <button className="flex h-12 items-center justify-center gap-2 rounded-md border border-dashed border-[#d5d9df] bg-[#f8fafc] text-xs font-bold text-[#687084]" type="button">
            <Upload size={15} />
            Tải ảnh minh chứng
          </button>
          <div className="rounded-md border border-[#bae6fd] bg-[#f0f9ff] px-3 py-3 text-[11px] leading-5 text-[#0369a1]">
            Bản ghi thu hoạch có thể lưu nháp. Sự kiện xác nhận thu hoạch và gói truy xuất chỉ phát sinh khi bấm xác nhận.
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e1e4e8] px-5 py-4">
          <button className="h-9 rounded-md border border-[#d5d9df] px-4 text-xs font-bold" onClick={onClose} type="button">Hủy</button>
          <button className="h-9 rounded-md border border-[#d5d9df] px-4 text-xs font-bold" type="button">Lưu nháp</button>
          <button className="h-9 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" onClick={onClose} type="button">Xác nhận & gửi</button>
        </div>
      </div>
    </div>
  );
}

export function SeasonTemplatesPage() {
  const [templateList, setTemplateList] = useState<ProcessTemplate[]>(templates);
  const [cropFilter, setCropFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);

  const filteredTemplates = templateList.filter((template) => {
    const status = template.status ?? 'published';
    const matchedCrop = cropFilter === 'all' || template.crop === cropFilter;
    const matchedStatus = statusFilter === 'all' || status === statusFilter;
    return matchedCrop && matchedStatus;
  });

  function createTemplate(template: ProcessTemplate) {
    setTemplateList((current) => [template, ...current]);
    setCreateTemplateOpen(false);
  }

  function cloneTemplate(template: ProcessTemplate) {
    const cloned = {
      ...template,
      code: `${template.code}-COPY`,
      name: `${template.name} - bản sao`,
      status: 'draft' as const,
      version: (template.version ?? 1) + 1,
    };
    setTemplateList((current) => [cloned, ...current]);
  }

  function archiveTemplate(code: string) {
    setTemplateList((current) => current.map((template) => (template.code === code ? { ...template, status: 'archived' } : template)));
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="templates" />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold">Mẫu quy trình mùa vụ</h2>
              <p className="mt-1 text-xs text-[#687084]">Mỗi mẫu định nghĩa giai đoạn, cổng kiểm tra trước thu hoạch và dữ liệu bắt buộc cho truy xuất nguồn gốc.</p>
            </div>
            <div className="flex items-center gap-2">
              <FilterSelect label="" onChange={setCropFilter} value={cropFilter}>
                <option value="all">Tất cả cây trồng</option>
                <option>Lúa</option>
                <option>Rau</option>
                <option>Cây ăn trái</option>
              </FilterSelect>
              <FilterSelect label="" onChange={setStatusFilter} value={statusFilter}>
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="published">Đã phát hành</option>
                <option value="archived">Lưu trữ</option>
              </FilterSelect>
              <Link className="flex h-9 items-center rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" href="/process/templates/new/">Tạo mẫu</Link>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-[#e1e4e8]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f3f4f6] text-[#687084]">
                <tr>
                  <th className="px-3 py-3 font-bold">Mã mẫu</th>
                  <th className="px-3 py-3 font-bold">Tên quy trình</th>
                  <th className="px-3 py-3 font-bold">Cây trồng</th>
                  <th className="px-3 py-3 font-bold">Giai đoạn</th>
                  <th className="px-3 py-3 font-bold">Cổng thu hoạch</th>
                  <th className="px-3 py-3 font-bold">Trạng thái</th>
                  <th className="px-3 py-3 font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr className="border-t border-[#e1e4e8]" key={template.code}>
                    <td className="px-3 py-3 font-extrabold">
                      <Link className="text-[#111827] hover:text-[#16a34a]" href={`/process/templates/${template.code}/`}>{template.code}</Link>
                    </td>
                    <td className="px-3 py-3">
                      <Link className="hover:text-[#16a34a]" href={`/process/templates/${template.code}/`}>{template.name}</Link>
                      <p className="mt-1 text-[10px] text-[#687084]">v{template.version ?? 1}</p>
                    </td>
                    <td className="px-3 py-3">{template.crop}</td>
                    <td className="px-3 py-3">{template.stages}</td>
                    <td className="px-3 py-3">{template.harvestGate}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${templateStatusStyle(template.status ?? 'published')}`}>
                        {templateStatusLabel(template.status ?? 'published')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button className="h-7 rounded-md border border-[#d5d9df] px-2 text-[11px] font-bold" onClick={() => cloneTemplate(template)} type="button">Nhân bản</button>
                        <button className="h-7 rounded-md border border-[#fecaca] px-2 text-[11px] font-bold text-[#dc2626]" onClick={() => archiveTemplate(template.code)} type="button">Lưu trữ</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-[#687084]" colSpan={7}>Không có mẫu phù hợp bộ lọc.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold">Luồng sang Thu hoạch</h2>
          <div className="mt-4 grid gap-3">
            {harvestFlow.map(({ detail, icon: Icon, title }) => (
              <div className="flex gap-3 rounded-md border border-[#e1e4e8] p-3" key={title}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f0fdf4] text-[#16a34a]">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-extrabold">{title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#687084]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
          <Link className="mt-4 flex h-9 items-center justify-between rounded-md border border-[#d5d9df] px-3 text-xs font-bold hover:bg-[#f8fafc]" href="/harvest/">
            Mở module Thu hoạch
            <ChevronRight size={14} />
          </Link>
        </aside>
      </div>
      {createTemplateOpen ? <CreateTemplateModal onClose={() => setCreateTemplateOpen(false)} onCreate={createTemplate} /> : null}
    </section>
  );
}

function CreateTemplateModal({ embedded = false, onClose, onCreate }: { embedded?: boolean; onClose: () => void; onCreate: (template: ProcessTemplate) => void }) {
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [description, setDescription] = useState('');
  const [ownerType, setOwnerType] = useState('zone');
  const [stages, setStages] = useState<TemplateStageDraft[]>([]);

  const totalTasks = stages.reduce((sum, stage) => sum + stage.tasks.length, 0);
  const canSubmit = Boolean(name && crop && stages.length > 0 && stages.every((stage) => stage.name && stage.start && stage.end && stage.tasks.length > 0));

  function addStage() {
    setStages((current) => [
      ...current,
      {
        id: `stage-${Date.now()}`,
        key: '',
        name: '',
        start: '',
        end: '',
        tasks: [],
      },
    ]);
  }

  function updateStage(stageId: string, field: keyof Omit<TemplateStageDraft, 'id' | 'tasks'>, value: string) {
    setStages((current) => current.map((stage) => (stage.id === stageId ? { ...stage, [field]: value } : stage)));
  }

  function removeStage(stageId: string) {
    setStages((current) => current.filter((stage) => stage.id !== stageId));
  }

  function addTask(stageId: string) {
    setStages((current) =>
      current.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              tasks: [
                ...stage.tasks,
                {
                  id: `task-${Date.now()}`,
                  name: '',
                  taskType: 'inspect',
                  dayOffset: '',
                  inputName: '',
                  quantity: '',
                  unit: 'kg',
                  requiredPhoto: true,
                  allowSkip: false,
                },
              ],
            }
          : stage,
      ),
    );
  }

  function updateTask(stageId: string, taskId: string, field: keyof Omit<TemplateTaskDraft, 'id'>, value: string | boolean) {
    setStages((current) =>
      current.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              tasks: stage.tasks.map((task) => (task.id === taskId ? { ...task, [field]: value } : task)),
            }
          : stage,
      ),
    );
  }

  function removeTask(stageId: string, taskId: string) {
    setStages((current) =>
      current.map((stage) => (stage.id === stageId ? { ...stage, tasks: stage.tasks.filter((task) => task.id !== taskId) } : stage)),
    );
  }

  function applyAiSuggestion() {
    const suggestedCrop = crop || 'Rau ăn lá';
    setCrop(suggestedCrop);
    if (!name) setName(`Quy trình ${suggestedCrop} VietGAP`);
    if (!description) setDescription('Mẫu quy trình được gợi ý theo giai đoạn, công việc, ảnh bắt buộc và vật tư khuyến nghị.');
    setStages([
      {
        id: 'ai-stage-prepare',
        key: 'prepare_soil',
        name: 'Chuẩn bị đất',
        start: '0',
        end: '5',
        tasks: [
          { id: 'ai-task-soil', name: 'Làm đất và kiểm tra pH', taskType: 'inspect', dayOffset: '0', inputName: '', quantity: '', unit: 'kg', requiredPhoto: true, allowSkip: false },
          { id: 'ai-task-fertilize', name: 'Bón lót hữu cơ', taskType: 'fertilize', dayOffset: '2', inputName: 'Phân hữu cơ', quantity: '120', unit: 'kg', requiredPhoto: true, allowSkip: false },
        ],
      },
      {
        id: 'ai-stage-care',
        key: 'crop_care',
        name: 'Chăm sóc',
        start: '6',
        end: '30',
        tasks: [
          { id: 'ai-task-irrigate', name: 'Tưới định kỳ', taskType: 'irrigate', dayOffset: '1', inputName: '', quantity: '', unit: 'lít', requiredPhoto: false, allowSkip: true },
          { id: 'ai-task-spray', name: 'Kiểm tra và phun phòng sâu bệnh', taskType: 'spray', dayOffset: '8', inputName: 'Chế phẩm sinh học', quantity: '2', unit: 'lít', requiredPhoto: true, allowSkip: false },
        ],
      },
      {
        id: 'ai-stage-harvest',
        key: 'harvest',
        name: 'Thu hoạch',
        start: '31',
        end: '45',
        tasks: [
          { id: 'ai-task-gate', name: 'Kiểm tra cách ly và phân hạng', taskType: 'harvest', dayOffset: '0', inputName: '', quantity: '', unit: 'kg', requiredPhoto: true, allowSkip: false },
        ],
      },
    ]);
  }

  function submitTemplate() {
    if (!canSubmit) return;

    const harvestStage = stages.find((stage) => stage.name.toLowerCase().includes('thu hoạch')) ?? stages[stages.length - 1];
    const template: ProcessTemplate = {
      code: createTemplateCode(crop, name),
      name,
      crop,
      stages: stages.length,
      harvestGate: harvestStage.tasks.map((task) => task.name).filter(Boolean).join(' + ') || 'Chưa cấu hình',
      status: 'draft',
      version: 1,
    };

    onCreate(template);
  }

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4 py-6'}>
      <div className={embedded ? 'flex w-full flex-col overflow-hidden rounded-xl bg-white' : 'flex max-h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-xl bg-white shadow-xl'}>
        <div className="flex items-center justify-between border-b border-[#e1e4e8] px-5 py-4">
          <div>
          <h2 className="text-base font-extrabold">Tạo mẫu quy trình</h2>
            <p className="mt-1 text-xs text-[#687084]">Định nghĩa mẫu quy trình, giai đoạn và công việc theo lịch tương đối.</p>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f3f4f6]" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className={embedded ? 'grid min-h-0 grid-cols-[minmax(0,1fr)_300px] gap-4 p-5' : 'grid min-h-0 grid-cols-[minmax(0,1fr)_300px] gap-4 overflow-y-auto p-5'}>
          <section className="grid gap-4">
            <div className="rounded-xl border border-[#e1e8df] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold">Thông tin mẫu</h3>
                  <p className="mt-1 text-xs text-[#687084]">Mẫu sau khi phát hành sẽ cố định, bản sửa đổi sẽ tạo phiên bản mới.</p>
                </div>
                <button className="h-8 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 text-xs font-bold text-[#15803d]" onClick={applyAiSuggestion} type="button">
                  Gợi ý bằng AI
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="col-span-2 grid gap-2 text-xs font-bold">
                  Tên quy trình
                  <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Quy trình rau ăn lá VietGAP" value={name} />
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Cây trồng
                  <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setCrop(event.target.value)} value={crop}>
                    <option disabled value="">Chọn cây trồng</option>
                    <option>Lúa</option>
                    <option>Rau</option>
                    <option>Cây ăn trái</option>
                    <option>Sầu riêng</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Chủ sở hữu
                  <select className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setOwnerType(event.target.value)} value={ownerType}>
                    <option value="zone">HTX / không gian làm việc</option>
                    <option value="company">Công ty tạo gốc</option>
                  </select>
                </label>
                <label className="col-span-2 grid gap-2 text-xs font-bold">
                  Mô tả
                  <textarea className="min-h-20 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 py-2 text-xs outline-none" onChange={(event) => setDescription(event.target.value)} placeholder="Mục tiêu, phạm vi áp dụng, tiêu chuẩn VietGAP/GlobalGAP..." value={description} />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-[#e1e8df] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold">Giai đoạn và công việc</h3>
                  <p className="mt-1 text-xs text-[#687084]">Mốc ngày được tính từ ngày trồng khi gán quy trình cho mùa vụ.</p>
                </div>
                <button className="h-8 rounded-md bg-[#16a34a] px-3 text-xs font-bold text-white" onClick={addStage} type="button">
                  + Thêm giai đoạn
                </button>
              </div>

              {stages.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-[#d5d9df] bg-[#f8fafc] p-8 text-center text-xs text-[#687084]">
                  Chưa có giai đoạn. Bấm “Thêm giai đoạn” hoặc “Gợi ý bằng AI” để bắt đầu.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {stages.map((stage, stageIndex) => (
                    <article className="rounded-lg border border-[#e1e4e8] p-3" key={stage.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-extrabold">Giai đoạn {stageIndex + 1}</p>
                        <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#fecaca] text-[#dc2626]" onClick={() => removeStage(stage.id)} type="button">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-[1fr_120px_110px_110px] gap-3">
                        <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => updateStage(stage.id, 'name', event.target.value)} placeholder="Tên giai đoạn" value={stage.name} />
                        <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => updateStage(stage.id, 'key', event.target.value)} placeholder="Mã giai đoạn" value={stage.key} />
                        <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => updateStage(stage.id, 'start', event.target.value)} placeholder="Ngày bắt đầu" type="number" value={stage.start} />
                        <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => updateStage(stage.id, 'end', event.target.value)} placeholder="Ngày kết thúc" type="number" value={stage.end} />
                      </div>

                      <div className="mt-3 grid gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-[#687084]">Danh sách công việc</p>
                          <button className="h-7 rounded-md border border-[#d5d9df] px-2 text-[11px] font-bold" onClick={() => addTask(stage.id)} type="button">+ Thêm công việc</button>
                        </div>
                        {stage.tasks.length === 0 ? (
                          <div className="rounded-md border border-dashed border-[#d5d9df] px-3 py-4 text-center text-[11px] text-[#687084]">Chưa có công việc trong giai đoạn này.</div>
                        ) : (
                          stage.tasks.map((task) => (
                            <div className="grid grid-cols-[minmax(0,1fr)_105px_90px_110px_80px_86px_32px] gap-2 rounded-md border border-[#e1e4e8] p-2" key={task.id}>
                              <input className="h-8 rounded-md border border-[#d5d9df] bg-white px-2 text-[11px] outline-none" onChange={(event) => updateTask(stage.id, task.id, 'name', event.target.value)} placeholder="Tên công việc" value={task.name} />
                              <select className="h-8 rounded-md border border-[#d5d9df] bg-white px-2 text-[11px] outline-none" onChange={(event) => updateTask(stage.id, task.id, 'taskType', event.target.value)} value={task.taskType}>
                                <option value="fertilize">Bón phân</option>
                                <option value="irrigate">Tưới</option>
                                <option value="spray">Phun thuốc</option>
                                <option value="inspect">Kiểm tra</option>
                                <option value="harvest">Thu hoạch</option>
                                <option value="other">Khác</option>
                              </select>
                              <input className="h-8 rounded-md border border-[#d5d9df] bg-white px-2 text-[11px] outline-none" onChange={(event) => updateTask(stage.id, task.id, 'dayOffset', event.target.value)} placeholder="Mốc ngày" type="number" value={task.dayOffset} />
                              <input className="h-8 rounded-md border border-[#d5d9df] bg-white px-2 text-[11px] outline-none" onChange={(event) => updateTask(stage.id, task.id, 'inputName', event.target.value)} placeholder="Vật tư" value={task.inputName} />
                              <input className="h-8 rounded-md border border-[#d5d9df] bg-white px-2 text-[11px] outline-none" onChange={(event) => updateTask(stage.id, task.id, 'quantity', event.target.value)} placeholder="Lượng" value={task.quantity} />
                              <select className="h-8 rounded-md border border-[#d5d9df] bg-white px-2 text-[11px] outline-none" onChange={(event) => updateTask(stage.id, task.id, 'unit', event.target.value)} value={task.unit}>
                                <option>kg</option>
                                <option>lít</option>
                                <option>gói</option>
                              </select>
                              <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#fecaca] text-[#dc2626]" onClick={() => removeTask(stage.id, task.id)} type="button">
                                <X size={13} />
                              </button>
                              <label className="col-span-3 flex items-center gap-2 text-[11px]">
                                <input checked={task.requiredPhoto} className="accent-[#16a34a]" onChange={(event) => updateTask(stage.id, task.id, 'requiredPhoto', event.target.checked)} type="checkbox" />
                                Bắt buộc ảnh
                              </label>
                              <label className="col-span-4 flex items-center gap-2 text-[11px]">
                                <input checked={task.allowSkip} className="accent-[#16a34a]" onChange={(event) => updateTask(stage.id, task.id, 'allowSkip', event.target.checked)} type="checkbox" />
                                Cho phép bỏ qua nếu cán bộ xác nhận lý do
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <section className="rounded-lg border border-[#e1e4e8] bg-[#f8fafc] p-4">
              <h3 className="text-sm font-extrabold">Tóm tắt mẫu</h3>
              <div className="mt-3 grid gap-2 text-xs">
                <SummaryRow label="Tên" value={name || 'Chưa nhập'} />
                <SummaryRow label="Cây trồng" value={crop || 'Chưa chọn'} />
                <SummaryRow label="Chủ sở hữu" value={ownerType === 'company' ? 'Công ty' : 'HTX / không gian làm việc'} />
                <SummaryRow label="Giai đoạn" value={`${stages.length}`} />
                <SummaryRow label="Công việc" value={`${totalTasks}`} />
              </div>
            </section>
            <section className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs text-[#166534]">
              <h3 className="font-extrabold text-[#15803d]">Sau khi lưu nháp</h3>
              <p className="mt-2 leading-5">Mẫu ở trạng thái nháp. Khi phát hành, nội dung giai đoạn/công việc được xem là bản ghi cố định và khi gán cho mùa vụ sẽ sinh công việc theo mốc ngày.</p>
            </section>
            <section className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] p-4 text-xs text-[#0369a1]">
              Công việc có ảnh, vật tư và số lô sẽ là dữ liệu gốc cho nhật ký canh tác và gói truy xuất.
            </section>
          </aside>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e1e4e8] px-5 py-4">
          <button className="h-9 rounded-md border border-[#d5d9df] px-4 text-xs font-bold" onClick={onClose} type="button">Hủy</button>
          <button className="h-9 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSubmit} onClick={submitTemplate} type="button">Lưu mẫu nháp</button>
        </div>
      </div>
    </div>
  );
}

export function ProcessTemplateCreatePage() {
  const [createdTemplates, setCreatedTemplates] = useState<ProcessTemplate[]>([]);
  const [showBuilder, setShowBuilder] = useState(true);

  function createTemplate(template: ProcessTemplate) {
    setCreatedTemplates((current) => [template, ...current]);
    setShowBuilder(false);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="templates" />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-extrabold">Tạo mẫu quy trình mới</h2>
            <p className="mt-1 text-xs text-[#687084]">Màn PROC-W03: nhập thông tin mẫu, thêm giai đoạn/công việc với mốc ngày tương đối hoặc dùng gợi ý AI.</p>
          </div>
          <Link className="h-9 rounded-md border border-[#d5d9df] px-4 py-2 text-xs font-bold" href="/process/templates/">Quay lại danh sách</Link>
        </div>
        {showBuilder ? (
          <InlineTemplateBuilder onCancel={() => setShowBuilder(false)} onCreate={createTemplate} />
        ) : (
          <section className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#15803d]">Đã lưu mẫu nháp</h3>
            <p className="mt-2 text-xs text-[#166534]">Mẫu mới được tạo trong phiên giao diện hiện tại. Khi tích hợp API, thao tác này sẽ lưu mẫu quy trình ở trạng thái nháp.</p>
            <div className="mt-4 grid gap-2">
              {createdTemplates.map((template) => (
                <div className="rounded-md border border-[#bbf7d0] bg-white px-3 py-2 text-xs" key={template.code}>
                  <span className="font-extrabold">{template.code}</span> · {template.name} · {template.stages} giai đoạn
                </div>
              ))}
            </div>
            <button className="mt-4 h-9 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" onClick={() => setShowBuilder(true)} type="button">Tạo mẫu khác</button>
          </section>
        )}
      </div>
    </section>
  );
}

function InlineTemplateBuilder({ onCancel, onCreate }: { onCancel: () => void; onCreate: (template: ProcessTemplate) => void }) {
  return (
    <div className="relative rounded-xl border border-[#e1e8df] bg-white shadow-sm">
      <CreateTemplateModal embedded onClose={onCancel} onCreate={onCreate} />
    </div>
  );
}

export function ProcessTemplateDetailPage({ templateId }: { templateId: string }) {
  const baseTemplate = templates.find((template) => template.code === templateId) ?? templates[0];
  const [template, setTemplate] = useState<ProcessTemplate>({ ...baseTemplate, status: baseTemplate.status ?? 'published', version: baseTemplate.version ?? 1 });
  const [stages, setStages] = useState(templateStages[baseTemplate.code] ?? templateStages['TPL-VEG-02']);

  function renameStage(index: number, value: string) {
    setStages((current) => current.map((stage, stageIndex) => (stageIndex === index ? { ...stage, name: value } : stage)));
  }

  function publishTemplate() {
    setTemplate((current) => ({ ...current, status: 'published', version: current.version ?? 1 }));
  }

  function forkVersion() {
    setTemplate((current) => ({ ...current, status: 'draft', version: (current.version ?? 1) + 1, name: `${current.name} v${(current.version ?? 1) + 1}` }));
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="templates" />
      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#16a34a]">PROC-W02 · Chi tiết mẫu</p>
              <h2 className="mt-1 text-lg font-extrabold">{template.name}</h2>
              <p className="mt-1 text-xs text-[#687084]">{template.code} · {template.crop} · phiên bản {template.version}</p>
            </div>
            <div className="flex gap-2">
              <button className="h-9 rounded-md border border-[#d5d9df] px-3 text-xs font-bold" onClick={forkVersion} type="button">Tạo phiên bản mới</button>
              <button className="h-9 rounded-md bg-[#16a34a] px-3 text-xs font-bold text-white" onClick={publishTemplate} type="button">Phát hành</button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#e1e4e8]">
            <div className="grid grid-cols-[160px_120px_1fr] bg-[#f3f4f6] px-3 py-2 text-xs font-bold text-[#687084]">
              <span>Giai đoạn</span>
              <span>Mốc ngày</span>
              <span>Công việc / vật tư khuyến nghị</span>
            </div>
            {stages.map((stage, index) => (
              <div className="grid grid-cols-[160px_120px_1fr] border-t border-[#e1e4e8] px-3 py-3 text-xs" key={`${stage.name}-${index}`}>
                <input className="h-8 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-2 font-bold outline-none" onChange={(event) => renameStage(index, event.target.value)} value={stage.name} />
                <span className="pt-2 text-[#687084]">{stage.range}</span>
                <div>
                  <p>{stage.tasks}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#16a34a]">{stage.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-extrabold">Thông tin phiên bản</h3>
            <div className="mt-3 grid gap-2 text-xs">
              <SummaryRow label="Trạng thái" value={templateStatusLabel(template.status ?? 'published')} />
              <SummaryRow label="Chủ sở hữu" value="HTX / không gian làm việc" />
              <SummaryRow label="Nguồn" value={template.version && template.version > 1 ? 'Tạo từ bản trước' : 'Mẫu gốc'} />
              <SummaryRow label="Ngày phát hành" value={template.status === 'published' ? '27/04/2026' : 'Chưa phát hành'} />
            </div>
          </section>
          <section className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] p-4 text-xs text-[#0369a1]">
            Sau khi phát hành, giai đoạn/công việc trở thành bản ghi cố định. Muốn chỉnh sửa tiếp cần tạo phiên bản mới.
          </section>
        </aside>
      </div>
    </section>
  );
}

export function ProcessActivePage() {
  const [selectedProcessId, setSelectedProcessId] = useState(activeProcesses[0].id);
  const [status, setStatus] = useState('all');
  const [parcel, setParcel] = useState('all');
  const selectedProcess = activeProcesses.find((process) => process.id === selectedProcessId) ?? activeProcesses[0];
  const relatedTasks = processTasks.filter((task) => task.processId === selectedProcess.id);

  const filteredProcesses = activeProcesses.filter((process) => {
    const matchedStatus = status === 'all' || process.status === status;
    const matchedParcel = parcel === 'all' || process.parcel === parcel;
    return matchedStatus && matchedParcel;
  });

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="active" />
      <div className="grid grid-cols-[minmax(0,1fr)_390px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Quy trình đang chạy</h2>
              <p className="mt-1 text-xs text-[#687084]">Danh sách quy trình đang được gán cho thửa, có tiến độ và trạng thái vận hành.</p>
            </div>
            <div className="flex gap-2">
              <FilterSelect label="" onChange={setParcel} value={parcel}>
                <option value="all">Tất cả thửa</option>
                {activeProcesses.map((process) => <option key={process.parcel}>{process.parcel}</option>)}
              </FilterSelect>
              <FilterSelect label="" onChange={setStatus} value={status}>
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="active">Đang chạy</option>
                <option value="suspended">Tạm dừng</option>
                <option value="completed">Hoàn thành</option>
              </FilterSelect>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-[#e1e4e8]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f3f4f6] text-[#687084]">
                <tr>
                  <th className="px-3 py-3 font-bold">Quy trình</th>
                  <th className="px-3 py-3 font-bold">Thửa</th>
                  <th className="px-3 py-3 font-bold">Mẫu</th>
                  <th className="px-3 py-3 font-bold">Ngày trồng</th>
                  <th className="px-3 py-3 font-bold">Tiến độ</th>
                  <th className="px-3 py-3 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map((process) => (
                  <tr className={`cursor-pointer border-t border-[#e1e4e8] ${selectedProcess.id === process.id ? 'bg-[#f0fdf4]' : ''}`} key={process.id} onClick={() => setSelectedProcessId(process.id)}>
                    <td className="px-3 py-3">
                      <p className="font-extrabold">{process.name}</p>
                      <p className="mt-1 text-[11px] text-[#687084]">{process.id} · {process.crop}</p>
                    </td>
                    <td className="px-3 py-3">{process.parcel}</td>
                    <td className="px-3 py-3">{process.template} v{process.templateVersion}</td>
                    <td className="px-3 py-3">{formatDate(process.plantedDate)}</td>
                    <td className="px-3 py-3">
                      <div className="h-2 rounded-full bg-[#eef1f4]">
                        <div className="h-2 rounded-full bg-[#16a34a]" style={{ width: `${process.progress}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-[#687084]">{process.progress}%</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${cropProcessStatusStyle[process.status]}`}>{cropProcessStatusLabel[process.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ProcessDetailPanel process={selectedProcess} tasks={relatedTasks} />
      </div>
    </section>
  );
}

export function ProcessActiveDetailPage({ processId }: { processId: string }) {
  const process = activeProcesses.find((item) => item.id === processId) ?? activeProcesses[0];
  const relatedTasks = processTasks.filter((task) => task.processId === process.id);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="active" />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-[#16a34a]">PROC-W05 · Chi tiết quy trình</p>
            <h2 className="mt-1 text-lg font-extrabold">{process.name}</h2>
            <p className="mt-1 text-xs text-[#687084]">{process.id} · {process.parcel} · {process.template} v{process.templateVersion}</p>
          </div>
          <Link className="h-9 rounded-md border border-[#d5d9df] px-4 py-2 text-xs font-bold" href="/process/active/">Quay lại danh sách</Link>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_390px] gap-4">
          <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-extrabold">Tiến độ dạng Gantt</h3>
            <div className="mt-4 grid gap-4">
              {Array.from(new Set(relatedTasks.map((task) => task.stage))).map((stage) => {
                const stageTasks = relatedTasks.filter((task) => task.stage === stage);
                return (
                  <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3" key={stage}>
                    <div className="pt-2 text-xs font-extrabold">{stage}</div>
                    <div className="grid gap-2">
                      {stageTasks.map((task) => (
                        <Link className={`flex h-9 items-center justify-between rounded-md px-3 text-xs font-bold ${farmingTaskStatusStyle[task.status]}`} href={`/process/tasks/${task.id}/`} key={task.id}>
                          <span>{task.name}</span>
                          <span>{formatDate(task.dueDate)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <ProcessDetailPanel process={process} tasks={relatedTasks} />
        </div>
      </div>
    </section>
  );
}

function ProcessDetailPanel({ process, tasks: items }: { process: ActiveProcess; tasks: ProcessTaskItem[] }) {
  const stages = Array.from(new Set(items.map((task) => task.stage)));

  return (
    <aside className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#16a34a]">Chi tiết quy trình</p>
          <h2 className="mt-1 text-lg font-extrabold">{process.name}</h2>
          <p className="mt-1 text-xs text-[#687084]">{process.parcel} · {process.assignee}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${cropProcessStatusStyle[process.status]}`}>{cropProcessStatusLabel[process.status]}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatInline label="Mẫu" value={`${process.template} v${process.templateVersion}`} />
        <StatInline label="Ngày trồng" value={formatDate(process.plantedDate)} />
        <StatInline label="Vùng" value={process.zone} />
        <StatInline label="Tiến độ" value={`${process.progress}%`} />
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-extrabold">Tiến độ theo giai đoạn</h3>
        <div className="mt-3 grid gap-3">
          {stages.map((stage) => {
            const stageTasks = items.filter((task) => task.stage === stage);
            const completed = stageTasks.filter((task) => task.status === 'completed').length;
            const percent = stageTasks.length ? Math.round((completed / stageTasks.length) * 100) : 0;
            return (
              <div className="rounded-lg border border-[#e1e4e8] p-3" key={stage}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold">{stage}</p>
                  <span className="text-[11px] text-[#687084]">{percent}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#eef1f4]">
                  <div className="h-2 rounded-full bg-[#16a34a]" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-3 grid gap-2">
                  {stageTasks.map((task) => (
                    <div className="flex items-start justify-between gap-2 rounded-md bg-[#f8fafc] px-3 py-2 text-[11px]" key={task.id}>
                      <div>
                        <p className="font-bold">{task.name}</p>
                        <p className="mt-1 text-[#687084]">Hạn {formatDate(task.dueDate)} · {taskTypeLabel[task.type] ?? task.type}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 font-bold ${farmingTaskStatusStyle[task.status]}`}>{farmingTaskStatusLabel[task.status]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export function ProcessCalendarPage() {
  const [assignee, setAssignee] = useState('all');
  const [taskType, setTaskType] = useState('all');
  const [parcel, setParcel] = useState('all');
  const filteredTasks = processTasks.filter((task) => {
    const matchedAssignee = assignee === 'all' || task.assignee === assignee;
    const matchedType = taskType === 'all' || task.type === taskType;
    const matchedParcel = parcel === 'all' || task.parcel === parcel;
    return matchedAssignee && matchedType && matchedParcel;
  });

  const days = Array.from({ length: 30 }).map((_, index) => index + 1);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="calendar" />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Lịch công việc</h2>
              <p className="mt-1 text-xs text-[#687084]">Màu công việc theo trạng thái: sắp đến hạn, quá hạn, đang xử lý, hoàn thành.</p>
            </div>
            <div className="flex gap-2">
              <FilterSelect label="" onChange={setAssignee} value={assignee}>
                <option value="all">Tất cả người phụ trách</option>
                <option>Nguyễn Văn An</option>
                <option>Trần Thị Bình</option>
                <option>Lê Văn Công</option>
              </FilterSelect>
              <FilterSelect label="" onChange={setTaskType} value={taskType}>
                <option value="all">Tất cả loại công việc</option>
                <option value="fertilize">Bón phân</option>
                <option value="irrigate">Tưới</option>
                <option value="spray">Phun thuốc</option>
                <option value="inspect">Kiểm tra</option>
              </FilterSelect>
              <FilterSelect label="" onChange={setParcel} value={parcel}>
                <option value="all">Tất cả thửa</option>
                <option>P-LA-032</option>
                <option>P-HCM-001</option>
                <option>P-DN-014</option>
              </FilterSelect>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-lg border border-[#e1e4e8] text-xs">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
              <div className="bg-[#f3f4f6] px-3 py-2 font-bold text-[#687084]" key={day}>{day}</div>
            ))}
            {days.map((day) => {
              const dayTasks = filteredTasks.filter((task) => Number(task.dueDate.slice(-2)) === day);
              return (
                <div className="min-h-28 border-t border-[#e1e4e8] p-2" key={day}>
                  <p className="font-bold">{day}</p>
                  <div className="mt-2 grid gap-1">
                    {dayTasks.map((task) => (
                      <div className={`rounded px-2 py-1 text-[10px] font-bold ${farmingTaskStatusStyle[task.status]}`} key={task.id}>{task.name}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <TaskDetailPanel task={filteredTasks[0] ?? processTasks[0]} />
      </div>
    </section>
  );
}

function TaskDetailPanel({ task }: { task: ProcessTaskItem }) {
  const logs = farmingLogs.filter((log) => log.taskId === task.id);

  return (
    <aside className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold text-[#16a34a]">Chi tiết công việc</p>
      <h2 className="mt-1 text-lg font-extrabold">{task.name}</h2>
      <p className="mt-1 text-xs text-[#687084]">{task.parcel} · {task.assignee}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatInline label="Loại" value={taskTypeLabel[task.type] ?? task.type} />
        <StatInline label="Hạn xử lý" value={formatDate(task.dueDate)} />
        <StatInline label="Ảnh bắt buộc" value={task.requiredPhoto ? 'Có' : 'Không'} />
        <StatInline label="Cho bỏ qua" value={task.allowSkip ? 'Có' : 'Không'} />
      </div>
      <button className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#16a34a] text-xs font-bold text-white" type="button">
        <CheckCircle2 size={14} />
        Đánh dấu hoàn thành
      </button>
      <div className="mt-4 rounded-lg border border-[#e1e4e8] p-3">
        <p className="text-xs font-extrabold">Lịch sử kiểm tra</p>
        <div className="mt-3 grid gap-2">
          {logs.length ? logs.map((log) => (
            <div className="rounded-md bg-[#f8fafc] px-3 py-2 text-[11px]" key={log.id}>
              <p className="font-bold">{log.id} · {logStatusLabel[log.status]}</p>
              <p className="mt-1 text-[#687084]">{log.loggedAt} · {log.loggedBy}</p>
            </div>
          )) : <p className="text-xs text-[#687084]">Chưa có nhật ký cho công việc này.</p>}
        </div>
      </div>
    </aside>
  );
}

export function ProcessTaskDetailPage({ taskId }: { taskId: string }) {
  const task = processTasks.find((item) => item.id === taskId) ?? processTasks[0];
  const process = activeProcesses.find((item) => item.id === task.processId) ?? activeProcesses[0];

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="calendar" />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#16a34a]">PROC-W07 · Chi tiết công việc</p>
              <h2 className="mt-1 text-lg font-extrabold">{task.name}</h2>
              <p className="mt-1 text-xs text-[#687084]">{task.id} · {process.name}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${farmingTaskStatusStyle[task.status]}`}>{farmingTaskStatusLabel[task.status]}</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <StatInline label="Loại" value={taskTypeLabel[task.type] ?? task.type} />
            <StatInline label="Hạn" value={formatDate(task.dueDate)} />
            <StatInline label="Người phụ trách" value={task.assignee} />
            <StatInline label="Thửa" value={task.parcel} />
          </div>
          <div className="mt-4 rounded-lg border border-[#e1e4e8] p-4">
            <h3 className="text-sm font-extrabold">Thông tin kiểm tra</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <SummaryRow label="Ảnh bắt buộc" value={task.requiredPhoto ? 'Có' : 'Không'} />
              <SummaryRow label="Cho phép bỏ qua" value={task.allowSkip ? 'Có' : 'Không'} />
              <SummaryRow label="Giai đoạn" value={task.stage} />
              <SummaryRow label="Thửa liên kết" value={task.parcel} />
            </div>
          </div>
        </section>
        <TaskDetailPanel task={task} />
      </div>
    </section>
  );
}

export function ProcessLogsPage() {
  const [selectedLogId, setSelectedLogId] = useState(farmingLogs[0].id);
  const [keyword, setKeyword] = useState('');
  const [parcel, setParcel] = useState('all');
  const [taskType, setTaskType] = useState('all');
  const [date, setDate] = useState('');
  const filteredLogs = farmingLogs.filter((log) => {
    const linkedTask = processTasks.find((task) => task.id === log.taskId);
    const matchedKeyword = !keyword || [log.id, log.taskId, log.parcel, log.loggedBy].some((value) => value.toLowerCase().includes(keyword.toLowerCase()));
    const matchedParcel = parcel === 'all' || log.parcel === parcel;
    const matchedTaskType = taskType === 'all' || linkedTask?.type === taskType;
    const matchedDate = !date || log.loggedAt.startsWith(date);
    return matchedKeyword && matchedParcel && matchedTaskType && matchedDate;
  });
  const selectedLog = farmingLogs.find((log) => log.id === selectedLogId) ?? farmingLogs[0];

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="logs" />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Nhật ký canh tác</h2>
              <p className="mt-1 text-xs text-[#687084]">Nhật ký chỉ được bổ sung, dùng cho kiểm tra VietGAP và truy xuất nguồn gốc.</p>
            </div>
            <button className="flex h-9 items-center gap-2 rounded-md border border-[#d5d9df] px-3 text-xs font-bold" type="button"><Download size={14} />Xuất CSV</button>
          </div>
          <label className="relative mt-4 block">
            <Search className="absolute left-3 top-2.5 text-[#687084]" size={14} />
            <input className="h-9 w-full rounded-md border border-[#d5d9df] bg-[#f8fafc] pl-9 pr-3 text-xs outline-none" onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm nhật ký, công việc, thửa, người ghi" value={keyword} />
          </label>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <FilterSelect label="" onChange={setParcel} value={parcel}>
              <option value="all">Tất cả thửa</option>
              <option>P-LA-032</option>
              <option>P-HCM-001</option>
              <option>P-DN-014</option>
            </FilterSelect>
            <FilterSelect label="" onChange={setTaskType} value={taskType}>
              <option value="all">Tất cả loại công việc</option>
              <option value="fertilize">Bón phân</option>
              <option value="irrigate">Tưới</option>
              <option value="spray">Phun thuốc</option>
              <option value="inspect">Kiểm tra</option>
            </FilterSelect>
            <input className="h-9 rounded-md border border-[#d5d9df] bg-[#f8fafc] px-3 text-xs outline-none" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-[#e1e4e8]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f3f4f6] text-[#687084]">
                <tr>
                  <th className="px-3 py-3 font-bold">Nhật ký</th>
                  <th className="px-3 py-3 font-bold">Công việc</th>
                  <th className="px-3 py-3 font-bold">Thửa</th>
                  <th className="px-3 py-3 font-bold">Vật tư</th>
                  <th className="px-3 py-3 font-bold">Nguồn</th>
                  <th className="px-3 py-3 font-bold">Ảnh</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr className={`cursor-pointer border-t border-[#e1e4e8] ${selectedLog.id === log.id ? 'bg-[#f0fdf4]' : ''}`} key={log.id} onClick={() => setSelectedLogId(log.id)}>
                    <td className="px-3 py-3 font-extrabold">{log.id}</td>
                    <td className="px-3 py-3">{log.taskId}</td>
                    <td className="px-3 py-3">{log.parcel}</td>
                    <td className="px-3 py-3">{log.inputs}</td>
                    <td className="px-3 py-3">{logSourceLabel[log.source]}</td>
                    <td className="px-3 py-3">{log.photos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <FarmingLogDetail log={selectedLog} />
      </div>
    </section>
  );
}

function FarmingLogDetail({ log }: { log: FarmingLog }) {
  return (
    <aside className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold text-[#16a34a]">Chi tiết nhật ký</p>
      <h2 className="mt-1 text-lg font-extrabold">{log.id}</h2>
      <p className="mt-1 text-xs text-[#687084]">{log.taskId} · {log.parcel}</p>
      <div className="mt-4 grid gap-2 text-xs">
        <SummaryRow label="Người ghi" value={log.loggedBy} />
        <SummaryRow label="Thời gian" value={log.loggedAt} />
        <SummaryRow label="Trạng thái ghi nhận" value={logStatusLabel[log.status]} />
        <SummaryRow label="Nguồn" value={logSourceLabel[log.source]} />
        <SummaryRow label="Ảnh" value={`${log.photos} ảnh`} />
      </div>
      <div className="mt-4 rounded-lg border border-[#e1e4e8] p-3">
        <p className="text-xs font-extrabold">Vật tư đã dùng</p>
        <p className="mt-2 text-xs text-[#687084]">{log.inputs}</p>
      </div>
      <div className="mt-4 rounded-lg border border-[#e1e4e8] p-3">
        <p className="text-xs font-extrabold">GPS / ghi chú</p>
        <div className="mt-2 flex h-24 items-center justify-center rounded-md bg-[#cdefff] text-xs font-bold text-[#0369a1]"><MapPin size={16} /> GPS tại thửa {log.parcel}</div>
        <p className="mt-2 text-xs text-[#687084]">{log.notes}</p>
      </div>
      <div className="mt-4 rounded-lg border border-[#e1e4e8] p-3">
        <p className="text-xs font-extrabold">Ảnh hiện trường</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {Array.from({ length: log.photos }).map((_, index) => (
            <div className="flex h-16 items-center justify-center rounded-md bg-[#eef1f4] text-[10px] font-bold text-[#687084]" key={index}>Ảnh {index + 1}</div>
          ))}
        </div>
      </div>
      {log.anomaly ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-3 text-xs font-bold text-[#a16207]">
          <AlertTriangle size={15} />
          Cảnh báo bất thường: {log.anomaly} · chờ AI kiểm tra sâu bệnh.
        </div>
      ) : null}
    </aside>
  );
}

export function ProcessLogDetailPage({ logId }: { logId: string }) {
  const log = farmingLogs.find((item) => item.id === logId) ?? farmingLogs[0];

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="logs" />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold text-[#16a34a]">PROC-W09 · Chi tiết nhật ký</p>
          <h2 className="mt-1 text-lg font-extrabold">{log.id}</h2>
          <p className="mt-1 text-xs text-[#687084]">Nhật ký chỉ đọc, chỉ được bổ sung và không chỉnh sửa.</p>
          <div className="mt-4 rounded-lg border border-[#e1e4e8] p-4">
            <h3 className="text-sm font-extrabold">Dữ liệu vật tư đã dùng</h3>
            <pre className="mt-3 overflow-auto rounded-md bg-[#111827] p-3 text-[11px] text-white">{JSON.stringify({ vat_tu_da_dung: log.inputs, nguon: logSourceLabel[log.source], ghi_chu: log.notes }, null, 2)}</pre>
          </div>
        </section>
        <FarmingLogDetail log={log} />
      </div>
    </section>
  );
}

export function ProcessInputsPage() {
  const [items, setItems] = useState(inputCatalog);
  const [category, setCategory] = useState('all');
  const [inputOpen, setInputOpen] = useState(false);
  const [newInput, setNewInput] = useState({
    name: '',
    activeIngredient: '',
    category: 'fertilizer',
    unit: 'kg',
    scope: 'workspace' as InputCatalogItem['scope'],
    status: 'active' as InputStatus,
    vietgap: true,
    enabled: true,
  });
  const filteredItems = items.filter((item) => category === 'all' || item.category === category);
  const canCreateInput = Boolean(newInput.name.trim() && newInput.activeIngredient.trim() && newInput.unit.trim());

  function toggleEnabled(id: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  }

  function createInput() {
    if (!canCreateInput) return;

    setItems((current) => [
      {
        id: `INP-${Date.now().toString().slice(-4)}`,
        name: newInput.name.trim(),
        activeIngredient: newInput.activeIngredient.trim(),
        category: newInput.category,
        unit: newInput.unit.trim(),
        scope: newInput.scope,
        status: newInput.status,
        vietgap: newInput.vietgap,
        enabled: newInput.status === 'banned' ? false : newInput.enabled,
      },
      ...current,
    ]);
    setNewInput({
      name: '',
      activeIngredient: '',
      category: 'fertilizer',
      unit: 'kg',
      scope: 'workspace',
      status: 'active',
      vietgap: true,
      enabled: true,
    });
    setInputOpen(false);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <ProcessHeader active="inputs" />
      <div className="p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Danh mục vật tư</h2>
              <p className="mt-1 text-xs text-[#687084]">Danh mục vật tư cấp hệ thống do công ty quản lý; HTX có thể bật/tắt vật tư áp dụng cho từng vùng.</p>
            </div>
            <div className="flex gap-2">
              <FilterSelect label="" onChange={setCategory} value={category}>
                <option value="all">Tất cả loại</option>
                <option value="fertilizer">Phân bón</option>
                <option value="pesticide">Thuốc BVTV</option>
                <option value="fungicide">Thuốc nấm</option>
                <option value="herbicide">Thuốc cỏ</option>
                <option value="seed">Giống cây</option>
              </FilterSelect>
              <button className="h-9 rounded-md bg-[#16a34a] px-3 text-xs font-bold text-white" onClick={() => setInputOpen(true)} type="button">+ Thêm vật tư cho HTX</button>
            </div>
          </div>
          {inputOpen ? (
            <div className="mt-4 rounded-xl border border-[#e1e8df] bg-[#fbfdfb] p-4 shadow-sm">
              <div className="grid grid-cols-[1.2fr_1fr_170px_150px] gap-3">
                <label className="grid gap-2 text-[11px] font-bold text-[#334155]">
                  Tên vật tư
                  <input className="h-10 rounded-lg border border-[#d8e1d6] bg-white px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setNewInput((current) => ({ ...current, name: event.target.value }))} placeholder="Ví dụ: NPK 16-16-8" value={newInput.name} />
                </label>
                <label className="grid gap-2 text-[11px] font-bold text-[#334155]">
                  Hoạt chất / thành phần
                  <input className="h-10 rounded-lg border border-[#d8e1d6] bg-white px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setNewInput((current) => ({ ...current, activeIngredient: event.target.value }))} placeholder="Ví dụ: N-P-K" value={newInput.activeIngredient} />
                </label>
                <label className="grid gap-2 text-[11px] font-bold text-[#334155]">
                  Loại vật tư
                  <select className="h-10 rounded-lg border border-[#d8e1d6] bg-white px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setNewInput((current) => ({ ...current, category: event.target.value }))} value={newInput.category}>
                    <option value="fertilizer">Phân bón</option>
                    <option value="pesticide">Thuốc bảo vệ thực vật</option>
                    <option value="fungicide">Thuốc nấm</option>
                    <option value="herbicide">Thuốc cỏ</option>
                    <option value="seed">Giống cây</option>
                    <option value="other">Khác</option>
                  </select>
                </label>
                <label className="grid gap-2 text-[11px] font-bold text-[#334155]">
                  Đơn vị tính
                  <select className="h-10 rounded-lg border border-[#d8e1d6] bg-white px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setNewInput((current) => ({ ...current, unit: event.target.value }))} value={newInput.unit}>
                    <option value="kg">kg</option>
                    <option value="lít">lít</option>
                    <option value="gói">gói</option>
                    <option value="bao">bao</option>
                    <option value="chai">chai</option>
                    <option value="cây">cây</option>
                  </select>
                </label>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[#687084]">
                Đơn vị tính là đơn vị dùng để nhập lượng vật tư trong công việc và nhật ký canh tác, ví dụ: bón 35 kg NPK, phun 2 lít chế phẩm, dùng 1 gói hạt giống.
              </p>
              <div className="mt-3 grid grid-cols-[170px_170px_1fr_90px] items-end gap-3">
                <label className="grid gap-2 text-[11px] font-bold text-[#334155]">
                  VietGAP
                  <select className="h-10 rounded-lg border border-[#d8e1d6] bg-white px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setNewInput((current) => ({ ...current, vietgap: event.target.value === 'true' }))} value={String(newInput.vietgap)}>
                    <option value="true">Được phép</option>
                    <option value="false">Không</option>
                  </select>
                </label>
                <label className="grid gap-2 text-[11px] font-bold text-[#334155]">
                  Trạng thái
                  <select className="h-10 rounded-lg border border-[#d8e1d6] bg-white px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setNewInput((current) => ({ ...current, status: event.target.value as InputStatus, enabled: event.target.value === 'banned' ? false : current.enabled }))} value={newInput.status}>
                    <option value="active">Hoạt động</option>
                    <option value="banned">Bị cấm</option>
                  </select>
                </label>
                <label className="flex h-10 items-center gap-2 text-[11px] font-bold text-[#334155]">
                  <input checked={newInput.enabled} className="accent-[#16a34a]" disabled={newInput.status === 'banned'} onChange={(event) => setNewInput((current) => ({ ...current, enabled: event.target.checked }))} type="checkbox" />
                  Bật vật tư này cho HTX
                </label>
                <button className="h-10 rounded-lg bg-[#16a34a] px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!canCreateInput} onClick={createInput} type="button">Lưu</button>
              </div>
            </div>
          ) : null}
          <div className="mt-4 overflow-hidden rounded-lg border border-[#e1e4e8]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f3f4f6] text-[#687084]">
                <tr>
                  <th className="px-3 py-3 font-bold">Tên</th>
                  <th className="px-3 py-3 font-bold">Hoạt chất</th>
                  <th className="px-3 py-3 font-bold">Loại</th>
                  <th className="px-3 py-3 font-bold">Đơn vị</th>
                  <th className="px-3 py-3 font-bold">VietGAP</th>
                  <th className="px-3 py-3 font-bold">Trạng thái</th>
                  <th className="px-3 py-3 font-bold">Bật cho HTX</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr className="border-t border-[#e1e4e8]" key={item.id}>
                    <td className="px-3 py-3 font-extrabold">{item.name}</td>
                    <td className="px-3 py-3">{item.activeIngredient}</td>
                    <td className="px-3 py-3">{inputCategoryLabel[item.category] ?? item.category}</td>
                    <td className="px-3 py-3">{item.unit}</td>
                    <td className="px-3 py-3">{item.vietgap ? 'Được phép' : 'Không'}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${item.status === 'active' ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]' : 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]'}`}>{item.status === 'active' ? 'Hoạt động' : 'Bị cấm'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button className={`h-7 rounded-md px-3 text-[11px] font-bold ${item.enabled ? 'bg-[#16a34a] text-white' : 'bg-[#eef1f4] text-[#687084]'}`} disabled={item.status === 'banned'} onClick={() => toggleEnabled(item.id)} type="button">
                        {item.enabled ? 'Đang bật' : 'Tắt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function FilterSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-[11px] font-bold text-[#334155]">
      {label}
      <select className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs font-medium outline-none focus:border-[#16a34a]" onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
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

function formatDate(value: string) {
  if (!value) return '--/--/----';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function dateFromHarvestWindow(value: string, index: 0 | 1) {
  const parts = value.split('-').map((part) => part.trim());
  const target = parts[index];
  const endParts = parts[1]?.split('/') ?? [];
  if (!target) return '';

  const targetParts = target.split('/');
  const day = targetParts[0];
  const month = targetParts[1];
  const year = targetParts[2] ?? endParts[2];

  if (!day || !month || !year) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function templateFromCrop(crop: string) {
  if (crop.includes('Lúa')) return 'TPL-RICE-01';
  if (crop.includes('Sầu riêng')) return 'TPL-FRUIT-03';
  return 'TPL-VEG-02';
}

function templateStatusLabel(status: NonNullable<ProcessTemplate['status']>) {
  return status === 'draft' ? 'Nháp' : status === 'archived' ? 'Lưu trữ' : 'Đã phát hành';
}

function templateStatusStyle(status: NonNullable<ProcessTemplate['status']>) {
  if (status === 'draft') return 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]';
  if (status === 'archived') return 'border-[#d1d5db] bg-[#f9fafb] text-[#4b5563]';
  return 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]';
}

function createTemplateCode(crop: string, name: string) {
  const cropCode = crop
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase();
  const nameCode = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase();

  return `TPL-${cropCode || 'CROP'}-${nameCode || 'NEW'}-${Date.now().toString().slice(-4)}`;
}

function Metric({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: 'green' | 'blue' | 'amber' | 'gray';
  value: string;
}) {
  const colors = {
    green: 'bg-[#f0fdf4] text-[#16a34a]',
    blue: 'bg-[#eff6ff] text-[#2563eb]',
    amber: 'bg-[#fffbeb] text-[#d97706]',
    gray: 'bg-[#f8fafc] text-[#475569]',
  };

  return (
    <div className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${colors[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs text-[#687084]">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e1e8df] bg-[#fbfdfb] px-3 py-2">
      <p className="text-[10px] text-[#687084]">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
  );
}
