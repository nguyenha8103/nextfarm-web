'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  MapPin,
  PackageCheck,
  Plus,
  QrCode,
  Search,
  Truck,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';

type HarvestStatus = 'draft' | 'confirmed';
type PoStatus = 'draft' | 'confirmed' | 'scheduled' | 'collected' | 'completed' | 'cancelled';
type ApprovalAction = 'advance' | 'cancel';

type HarvestRecord = {
  id: string;
  parcelName: string;
  parcelCode: string;
  zone: string;
  crop: string;
  product: string;
  weight: number;
  area: number;
  grade: string;
  harvestDate: string;
  status: HarvestStatus;
  farmer: string;
  photos: number;
  traceId?: string;
};

type PurchaseOrder = {
  id: string;
  buyer: string;
  records: string[];
  quantity: number;
  unitPrice: number;
  deliveryDate: string;
  status: PoStatus;
  actualQuantity?: number;
  actualGrade?: string;
  cancelReason?: string;
  history: Array<{ status: PoStatus; at: string; user: string; note: string }>;
};

type TraceBundle = {
  id: string;
  harvestId: string;
  parcelName: string;
  parcelCode: string;
  farmer: string;
  crop: string;
  product: string;
  harvestDate: string;
  certification: string;
  weather: string;
  stages: Array<{ name: string; completedAt: string }>;
  inputs: Array<{ name: string; batch: string; quantity: string }>;
};

const harvestRecords: HarvestRecord[] = [
  {
    id: 'HR-2026-001',
    parcelName: 'Thửa lúa LA-032',
    parcelCode: 'P-LA-032',
    zone: 'Vùng lúa Long An',
    crop: 'Lúa ST25',
    product: 'Lúa tươi ST25',
    weight: 18600,
    area: 3.2,
    grade: 'A',
    harvestDate: '2026-04-25',
    status: 'confirmed',
    farmer: 'Lê Văn Công',
    photos: 3,
    traceId: 'TRC-HR-001',
  },
  {
    id: 'HR-2026-002',
    parcelName: 'Thửa rau HCM-001',
    parcelCode: 'P-HCM-001',
    zone: 'Vùng rau Củ Chi',
    crop: 'Rau ăn lá',
    product: 'Cải xanh',
    weight: 2450,
    area: 1.1,
    grade: 'B',
    harvestDate: '2026-04-26',
    status: 'draft',
    farmer: 'Nguyễn Văn An',
    photos: 1,
  },
  {
    id: 'HR-2026-003',
    parcelName: 'Vườn sầu riêng DN-014',
    parcelCode: 'P-DN-014',
    zone: 'Vùng cây ăn trái Đồng Nai',
    crop: 'Sầu riêng',
    product: 'Sầu riêng Ri6',
    weight: 5200,
    area: 2.6,
    grade: 'A',
    harvestDate: '2026-04-24',
    status: 'confirmed',
    farmer: 'Trần Thị Bình',
    photos: 4,
    traceId: 'TRC-HR-003',
  },
];

const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2026-0042',
    buyer: 'Công ty Nông sản Xanh',
    records: ['HR-2026-001', 'HR-2026-003'],
    quantity: 23800,
    unitPrice: 18500,
    deliveryDate: '2026-04-30',
    status: 'confirmed',
    history: [
      { status: 'draft', at: '25/04/2026 08:30', user: 'Nguyễn Văn An', note: 'Tạo đơn thu mua từ hai bản ghi đã xác nhận' },
      { status: 'confirmed', at: '26/04/2026 09:15', user: 'Công ty Nông sản Xanh', note: 'Xác nhận điều kiện thu mua' },
    ],
  },
  {
    id: 'PO-2026-0043',
    buyer: 'Siêu thị Miền Nam',
    records: ['HR-2026-002'],
    quantity: 2400,
    unitPrice: 12000,
    deliveryDate: '2026-05-02',
    status: 'draft',
    history: [{ status: 'draft', at: '26/04/2026 15:20', user: 'Trần Thị Bình', note: 'Tạo đơn nháp, chờ xác nhận sản lượng' }],
  },
  {
    id: 'PO-2026-0044',
    buyer: 'Bếp ăn Thành Phố',
    records: ['HR-2026-001'],
    quantity: 9000,
    unitPrice: 18100,
    deliveryDate: '2026-04-29',
    status: 'scheduled',
    history: [
      { status: 'draft', at: '25/04/2026 10:00', user: 'Nguyễn Văn An', note: 'Tạo đơn' },
      { status: 'confirmed', at: '25/04/2026 11:00', user: 'Bếp ăn Thành Phố', note: 'Xác nhận mua' },
      { status: 'scheduled', at: '26/04/2026 08:00', user: 'Nguyễn Văn An', note: 'Đã lên lịch thu gom' },
    ],
  },
];

const traceBundles: TraceBundle[] = [
  {
    id: 'TRC-HR-001',
    harvestId: 'HR-2026-001',
    parcelName: 'Thửa lúa LA-032',
    parcelCode: 'P-LA-032',
    farmer: 'Lê Văn Công',
    crop: 'Lúa ST25',
    product: 'Lúa tươi ST25',
    harvestDate: '25/04/2026',
    certification: 'VietGAP',
    weather: 'Nắng nhẹ, 31°C, độ ẩm 68%',
    stages: [
      { name: 'Làm đất', completedAt: '12/01/2026' },
      { name: 'Gieo sạ', completedAt: '20/01/2026' },
      { name: 'Đẻ nhánh', completedAt: '18/02/2026' },
      { name: 'Làm đòng', completedAt: '31/03/2026' },
      { name: 'Thu hoạch', completedAt: '25/04/2026' },
    ],
    inputs: [
      { name: 'Phân hữu cơ BIO-01', batch: 'B2404', quantity: '120 kg' },
      { name: 'NPK 16-16-8', batch: 'NPK2604', quantity: '35 kg' },
    ],
  },
  {
    id: 'TRC-HR-003',
    harvestId: 'HR-2026-003',
    parcelName: 'Vườn sầu riêng DN-014',
    parcelCode: 'P-DN-014',
    farmer: 'Trần Thị Bình',
    crop: 'Sầu riêng',
    product: 'Sầu riêng Ri6',
    harvestDate: '24/04/2026',
    certification: 'GlobalGAP',
    weather: 'Có mưa rào, 29°C, độ ẩm 74%',
    stages: [
      { name: 'Ra hoa', completedAt: '05/01/2026' },
      { name: 'Đậu trái', completedAt: '15/02/2026' },
      { name: 'Nuôi trái', completedAt: '29/03/2026' },
      { name: 'Phân hạng', completedAt: '22/04/2026' },
      { name: 'Thu hoạch', completedAt: '24/04/2026' },
    ],
    inputs: [
      { name: 'Phân Kali', batch: 'K2604', quantity: '48 kg' },
      { name: 'Chế phẩm sinh học', batch: 'BIO2604', quantity: '2 lít' },
    ],
  },
];

const parcelOptions = [
  { parcelCode: 'P-LA-032', parcelName: 'Thửa lúa LA-032', zone: 'Vùng lúa Long An', crop: 'Lúa ST25', farmer: 'Lê Văn Công' },
  { parcelCode: 'P-HCM-001', parcelName: 'Thửa rau HCM-001', zone: 'Vùng rau Củ Chi', crop: 'Rau ăn lá', farmer: 'Nguyễn Văn An' },
  { parcelCode: 'P-DN-014', parcelName: 'Vườn sầu riêng DN-014', zone: 'Vùng cây ăn trái Đồng Nai', crop: 'Sầu riêng', farmer: 'Trần Thị Bình' },
];

export const harvestRecordIds = harvestRecords.map((record) => record.id);
export const purchaseOrderIds = purchaseOrders.map((order) => order.id);
export const traceabilityIds = traceBundles.map((bundle) => bundle.id);

const harvestStatusLabel: Record<HarvestStatus, string> = {
  draft: 'Nháp',
  confirmed: 'Đã xác nhận',
};

const harvestStatusStyle: Record<HarvestStatus, string> = {
  draft: 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]',
  confirmed: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
};

const poLabel: Record<PoStatus, string> = {
  draft: 'Nháp',
  confirmed: 'Đã xác nhận',
  scheduled: 'Đã lên lịch',
  collected: 'Đã thu gom',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

const poStyle: Record<PoStatus, string> = {
  draft: 'border-[#d1d5db] bg-[#f9fafb] text-[#4b5563]',
  confirmed: 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]',
  scheduled: 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]',
  collected: 'border-[#bae6fd] bg-[#f0f9ff] text-[#0369a1]',
  completed: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
  cancelled: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
};

export function HarvestPage() {
  return <HarvestRecordsPage />;
}

function HarvestHeader({ active }: { active: 'records' | 'orders' | 'traceability' }) {
  const tabs = [
    { id: 'records', href: '/harvest/records/', label: 'Ghi nhận thu hoạch', icon: PackageCheck },
    { id: 'orders', href: '/harvest/purchase-orders/', label: 'Đơn thu mua', icon: Truck },
    { id: 'traceability', href: `/harvest/traceability/${traceabilityIds[0]}/`, label: 'Truy xuất nguồn gốc', icon: QrCode },
  ] as const;

  return (
    <div className="border-b border-[#e5eadf] bg-[#f7faf8] px-5 pb-5 pt-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#16a34a]">Thu hoạch</p>
      <h1 className="mt-1 text-[26px] font-extrabold leading-8 text-[#111827]">Quản lý thu hoạch</h1>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-[#5f6b7a]">
        Ghi nhận sản lượng, quản lý đơn thu mua và tạo dữ liệu truy xuất nguồn gốc từ các bản ghi thu hoạch đã xác nhận.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-[#e1e8df] bg-white p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;
          return (
            <Link
              aria-current={selected ? 'page' : undefined}
              className={`inline-flex h-9 min-w-[170px] items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${
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
  );
}

export function HarvestRecordsPage() {
  const [records, setRecords] = useState(harvestRecords);
  const [filters, setFilters] = useState({ keyword: '', zone: 'all', crop: 'all', status: 'all', from: '', to: '' });

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const keyword = filters.keyword.trim().toLowerCase();
      const matchedKeyword = !keyword || [record.id, record.parcelName, record.parcelCode, record.product, record.farmer].some((value) => value.toLowerCase().includes(keyword));
      const matchedZone = filters.zone === 'all' || record.zone === filters.zone;
      const matchedCrop = filters.crop === 'all' || record.crop === filters.crop;
      const matchedStatus = filters.status === 'all' || record.status === filters.status;
      const matchedFrom = !filters.from || record.harvestDate >= filters.from;
      const matchedTo = !filters.to || record.harvestDate <= filters.to;
      return matchedKeyword && matchedZone && matchedCrop && matchedStatus && matchedFrom && matchedTo;
    });
  }, [filters, records]);

  const totalKg = filteredRecords.reduce((sum, record) => sum + record.weight, 0);
  const totalArea = filteredRecords.reduce((sum, record) => sum + record.area, 0);
  const avgPerHa = totalArea ? Math.round(totalKg / totalArea) : 0;

  function confirmRecord(recordId: string) {
    setRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status: 'confirmed',
              traceId: record.traceId ?? `TRC-${record.id.replace('HR-2026-', 'HR-')}`,
            }
          : record,
      ),
    );
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <HarvestHeader active="records" />
      <div className="p-5">
        <div className="grid grid-cols-4 gap-3">
          <Metric icon={PackageCheck} label="Bản ghi đã lọc" value={`${filteredRecords.length}`} tone="green" />
          <Metric icon={ClipboardCheck} label="Tổng sản lượng" value={`${formatKg(totalKg)} kg`} tone="blue" />
          <Metric icon={CalendarDays} label="Bình quân / ha" value={`${formatKg(avgPerHa)} kg`} tone="amber" />
          <Metric icon={QrCode} label="Có gói truy xuất" value={`${filteredRecords.filter((record) => record.traceId).length}`} tone="gray" />
        </div>

        <section className="mt-4 rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Danh sách thu hoạch</h2>
              <p className="mt-1 text-xs text-[#687084]">Bản ghi đã xác nhận chỉ được bổ sung, không sửa hoặc xóa.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 items-center gap-2 rounded-lg border border-[#d8e1d6] px-3 text-xs font-bold" type="button">
                <Download size={14} />
                Xuất CSV
              </button>
              <Link className="flex h-9 items-center gap-2 rounded-lg bg-[#16a34a] px-3 text-xs font-bold text-white" href="/harvest/records/new/">
                <Plus size={14} />
                Khai báo thu hoạch
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_170px_150px_150px_150px_150px] gap-3">
            <label className="relative">
              <Search className="absolute left-3 top-2.5 text-[#687084]" size={14} />
              <input className="h-10 w-full rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] pl-9 pr-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, keyword: event.target.value })} placeholder="Tìm mã, thửa, sản phẩm, nông dân" value={filters.keyword} />
            </label>
            <FilterSelect label="" onChange={(zone) => setFilters({ ...filters, zone })} value={filters.zone}>
              <option value="all">Tất cả khu vực</option>
              {unique(harvestRecords.map((record) => record.zone)).map((zone) => <option key={zone}>{zone}</option>)}
            </FilterSelect>
            <FilterSelect label="" onChange={(crop) => setFilters({ ...filters, crop })} value={filters.crop}>
              <option value="all">Tất cả cây trồng</option>
              {unique(harvestRecords.map((record) => record.crop)).map((crop) => <option key={crop}>{crop}</option>)}
            </FilterSelect>
            <FilterSelect label="" onChange={(status) => setFilters({ ...filters, status })} value={filters.status}>
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="confirmed">Đã xác nhận</option>
            </FilterSelect>
            <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, from: event.target.value })} type="date" value={filters.from} />
            <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, to: event.target.value })} type="date" value={filters.to} />
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#e1e8df]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f3f4f6] text-[#687084]">
                <tr>
                  <th className="px-3 py-3 font-bold">Tên thửa</th>
                  <th className="px-3 py-3 font-bold">Cây trồng</th>
                  <th className="px-3 py-3 font-bold">Sản lượng</th>
                  <th className="px-3 py-3 font-bold">Phân loại</th>
                  <th className="px-3 py-3 font-bold">Ngày thu hoạch</th>
                  <th className="px-3 py-3 font-bold">Trạng thái</th>
                  <th className="px-3 py-3 font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr className="border-t border-[#e1e8df]" key={record.id}>
                    <td className="px-3 py-3">
                      <p className="font-extrabold">{record.parcelName}</p>
                      <p className="mt-1 text-[11px] text-[#687084]">{record.parcelCode} · {record.zone}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold">{record.crop}</p>
                      <p className="mt-1 text-[11px] text-[#687084]">{record.product}</p>
                    </td>
                    <td className="px-3 py-3 font-bold">{formatKg(record.weight)} kg</td>
                    <td className="px-3 py-3">{record.grade}</td>
                    <td className="px-3 py-3">{formatDate(record.harvestDate)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${harvestStatusStyle[record.status]}`}>{harvestStatusLabel[record.status]}</span>
                    </td>
                    <td className="px-3 py-3">
                      {record.status === 'draft' ? (
                        <button className="h-8 rounded-lg bg-[#16a34a] px-3 text-[11px] font-bold text-white" onClick={() => confirmRecord(record.id)} type="button">Xác nhận</button>
                      ) : record.traceId ? (
                        <Link className="inline-flex h-8 items-center rounded-lg border border-[#d8e1d6] px-3 text-[11px] font-bold" href={`/harvest/traceability/${record.traceId}/`}>Truy xuất</Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-[#687084]" colSpan={7}>Không có bản ghi phù hợp bộ lọc.</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot className="border-t border-[#e1e8df] bg-[#f8fafc]">
                <tr>
                  <td className="px-3 py-3 text-xs font-extrabold" colSpan={2}>Tổng {filteredRecords.length}/{records.length} bản ghi</td>
                  <td className="px-3 py-3 text-xs font-extrabold">{formatKg(totalKg)} kg</td>
                  <td className="px-3 py-3 text-xs text-[#687084]" colSpan={4}>Trung bình: {formatKg(avgPerHa)} kg/ha</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

export function HarvestRecordCreatePage() {
  const [parcel, setParcel] = useState('');
  const [product, setProduct] = useState('');
  const [weight, setWeight] = useState('');
  const [grade, setGrade] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [photos, setPhotos] = useState(0);
  const [savedStatus, setSavedStatus] = useState<HarvestStatus | null>(null);
  const [error, setError] = useState('');
  const selectedParcel = parcelOptions.find((item) => item.parcelCode === parcel);
  const parsedWeight = Number(weight);
  const canSubmit = Boolean(parcel && product && grade && harvestDate && parsedWeight > 0 && parsedWeight <= 100000);

  function submit(status: HarvestStatus) {
    if (!canSubmit) {
      setError('Vui lòng nhập đầy đủ thông tin. Sản lượng phải lớn hơn 0 và không vượt quá 100.000 kg.');
      return;
    }
    setError('');
    setSavedStatus(status);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <HarvestHeader active="records" />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold text-[#16a34a]">HARV-W02 · Form khai báo thu hoạch</p>
          <h2 className="mt-1 text-lg font-extrabold">Khai báo sản lượng thu hoạch</h2>
          <p className="mt-1 text-xs text-[#687084]">Lưu nháp chỉ tạo bản ghi nháp. Chỉ khi xác nhận, hệ thống mới phát sinh sự kiện thu hoạch và tạo gói truy xuất.</p>

          <div className="mt-5 grid gap-4">
            <FilterSelect label="Thửa đất được phân công" onChange={setParcel} value={parcel}>
              <option disabled value="">Chọn thửa đất</option>
              {parcelOptions.map((item) => <option key={item.parcelCode} value={item.parcelCode}>{item.parcelName} · {item.crop}</option>)}
            </FilterSelect>
            <label className="grid gap-2 text-xs font-bold">
              Tên sản phẩm
              <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setProduct(event.target.value)} placeholder="Ví dụ: Lúa tươi ST25" value={product} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="grid gap-2 text-xs font-bold">
                Sản lượng (kg)
                <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" max={100000} min={1} onChange={(event) => setWeight(event.target.value)} placeholder="Tối đa 100.000" type="number" value={weight} />
              </label>
              <FilterSelect label="Phân loại" onChange={setGrade} value={grade}>
                <option disabled value="">Chọn loại</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </FilterSelect>
              <label className="grid gap-2 text-xs font-bold">
                Ngày thu hoạch
                <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setHarvestDate(event.target.value)} type="date" value={harvestDate} />
              </label>
            </div>
            <button className="flex h-14 items-center justify-center gap-2 rounded-xl border border-dashed border-[#d8e1d6] bg-[#fbfdfb] text-xs font-bold text-[#687084]" onClick={() => setPhotos((current) => current + 1)} type="button">
              <Upload size={16} />
              Tải ảnh minh chứng tùy chọn ({photos} ảnh)
            </button>
            {error ? <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs font-bold text-[#dc2626]">{error}</div> : null}
            {savedStatus ? <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-xs font-bold text-[#15803d]">Đã {savedStatus === 'draft' ? 'lưu nháp' : 'xác nhận và gửi'} bản ghi trong giao diện mô phỏng.</div> : null}
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-[#e1e8df] pt-4">
            <Link className="h-9 rounded-lg border border-[#d8e1d6] px-4 py-2 text-xs font-bold" href="/harvest/records/">Hủy</Link>
            <button className="h-9 rounded-lg border border-[#d8e1d6] px-4 text-xs font-bold disabled:opacity-50" disabled={!canSubmit} onClick={() => submit('draft')} type="button">Lưu nháp</button>
            <button className="h-9 rounded-lg bg-[#16a34a] px-4 text-xs font-bold text-white disabled:opacity-50" disabled={!canSubmit} onClick={() => submit('confirmed')} type="button">Xác nhận & gửi</button>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-extrabold">Tóm tắt khai báo</h3>
            <div className="mt-3 grid gap-2 text-xs">
              <SummaryRow label="Thửa" value={selectedParcel?.parcelName ?? 'Chưa chọn'} />
              <SummaryRow label="Cây trồng" value={selectedParcel?.crop ?? 'Chưa chọn'} />
              <SummaryRow label="Nông dân" value={selectedParcel?.farmer ?? 'Chưa chọn'} />
              <SummaryRow label="Sản phẩm" value={product || 'Chưa nhập'} />
              <SummaryRow label="Sản lượng" value={weight ? `${formatKg(parsedWeight)} kg` : 'Chưa nhập'} />
            </div>
          </section>
          <section className="rounded-xl border border-[#bae6fd] bg-[#f0f9ff] p-4 text-xs leading-5 text-[#0369a1]">
            Quy tắc: bản ghi nháp chưa tạo gói truy xuất. Sự kiện thu hoạch chỉ phát sinh khi bấm xác nhận.
          </section>
        </aside>
      </div>
    </section>
  );
}

export function PurchaseOrdersPage() {
  const [orders, setOrders] = useState(purchaseOrders);
  const [filters, setFilters] = useState({ status: 'all', from: '', to: '' });
  const [createOpen, setCreateOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchedStatus = filters.status === 'all' || order.status === filters.status;
    const matchedFrom = !filters.from || order.deliveryDate >= filters.from;
    const matchedTo = !filters.to || order.deliveryDate <= filters.to;
    return matchedStatus && matchedFrom && matchedTo;
  });

  function createOrder(order: PurchaseOrder) {
    setOrders((current) => [order, ...current]);
    setCreateOpen(false);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <HarvestHeader active="orders" />
      <div className="p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Danh sách đơn thu mua</h2>
              <p className="mt-1 text-xs text-[#687084]">Đơn thu mua liên kết với bản ghi thu hoạch đã xác nhận để phục vụ truy xuất.</p>
            </div>
            <div className="flex gap-2">
              <FilterSelect label="" onChange={(status) => setFilters({ ...filters, status })} value={filters.status}>
                <option value="all">Tất cả trạng thái</option>
                {Object.entries(poLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </FilterSelect>
              <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, from: event.target.value })} type="date" value={filters.from} />
              <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setFilters({ ...filters, to: event.target.value })} type="date" value={filters.to} />
              <button className="flex h-10 items-center gap-2 rounded-lg bg-[#16a34a] px-3 text-xs font-bold text-white" onClick={() => setCreateOpen(true)} type="button"><Plus size={14} />Tạo đơn</button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#e1e8df]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f3f4f6] text-[#687084]">
                <tr>
                  <th className="px-3 py-3 font-bold">Mã đơn</th>
                  <th className="px-3 py-3 font-bold">Người mua</th>
                  <th className="px-3 py-3 font-bold">Tổng số lượng</th>
                  <th className="px-3 py-3 font-bold">Ngày giao</th>
                  <th className="px-3 py-3 font-bold">Trạng thái</th>
                  <th className="px-3 py-3 font-bold">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr className="border-t border-[#e1e8df]" key={order.id}>
                    <td className="px-3 py-3 font-extrabold">{order.id}</td>
                    <td className="px-3 py-3">{order.buyer}</td>
                    <td className="px-3 py-3 font-bold">{formatKg(order.quantity)} kg</td>
                    <td className="px-3 py-3">{formatDate(order.deliveryDate)}</td>
                    <td className="px-3 py-3"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${poStyle[order.status]}`}>{poLabel[order.status]}</span></td>
                    <td className="px-3 py-3"><Link className="inline-flex h-8 items-center rounded-lg border border-[#d8e1d6] px-3 text-[11px] font-bold" href={`/harvest/purchase-orders/${order.id}/`}>Mở</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {createOpen ? <PurchaseOrderModal onClose={() => setCreateOpen(false)} onCreate={createOrder} /> : null}
    </section>
  );
}

export function PurchaseOrderDetailPage({ orderId }: { orderId: string }) {
  const baseOrder = purchaseOrders.find((order) => order.id === orderId) ?? purchaseOrders[0];
  const [order, setOrder] = useState(baseOrder);
  const [approvalOpen, setApprovalOpen] = useState<ApprovalAction | null>(null);
  const linkedRecords = harvestRecords.filter((record) => order.records.includes(record.id));

  function updateOrder(nextOrder: PurchaseOrder) {
    setOrder(nextOrder);
    setApprovalOpen(null);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <HarvestHeader active="orders" />
      <div className="grid grid-cols-[minmax(0,1fr)_370px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#16a34a]">HARV-W04 · Chi tiết đơn thu mua</p>
              <h2 className="mt-1 text-xl font-extrabold">{order.id}</h2>
              <p className="mt-1 text-xs text-[#687084]">Người mua: {order.buyer}</p>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${poStyle[order.status]}`}>{poLabel[order.status]}</span>
          </div>

          <PoTimeline status={order.status} />

          <div className="mt-4 grid grid-cols-4 gap-3">
            <StatInline label="Số lượng đặt" value={`${formatKg(order.quantity)} kg`} />
            <StatInline label="Đơn giá" value={`${formatKg(order.unitPrice)} đ/kg`} />
            <StatInline label="Ngày giao" value={formatDate(order.deliveryDate)} />
            <StatInline label="Bản ghi liên kết" value={`${linkedRecords.length} bản ghi`} />
          </div>

          <div className="mt-4 rounded-xl border border-[#e1e8df] p-4">
            <h3 className="text-sm font-extrabold">Bản ghi thu hoạch liên kết</h3>
            <div className="mt-3 grid gap-2">
              {linkedRecords.map((record) => (
                <div className="grid grid-cols-[1fr_120px_80px] rounded-lg bg-[#f8fafc] px-3 py-2 text-xs" key={record.id}>
                  <div>
                    <p className="font-extrabold">{record.id} · {record.parcelName}</p>
                    <p className="mt-1 text-[#687084]">{record.product}</p>
                  </div>
                  <span className="font-bold">{formatKg(record.weight)} kg</span>
                  <span>Loại {record.grade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {order.status !== 'completed' && order.status !== 'cancelled' ? (
              <button className="h-9 rounded-lg bg-[#16a34a] px-4 text-xs font-bold text-white" onClick={() => setApprovalOpen('advance')} type="button">
                {nextPoStatus(order.status) === 'scheduled' ? 'Lên lịch thu gom' : nextPoStatus(order.status) === 'collected' ? 'Xác nhận thu gom' : nextPoStatus(order.status) === 'completed' ? 'Hoàn tất đơn' : 'Xác nhận đơn'}
              </button>
            ) : null}
            {order.status !== 'collected' && order.status !== 'completed' && order.status !== 'cancelled' ? (
              <button className="h-9 rounded-lg border border-[#fecaca] px-4 text-xs font-bold text-[#dc2626]" onClick={() => setApprovalOpen('cancel')} type="button">Hủy đơn</button>
            ) : null}
            <Link className="h-9 rounded-lg border border-[#d8e1d6] px-4 py-2 text-xs font-bold" href="/harvest/purchase-orders/">Quay lại danh sách</Link>
          </div>
        </section>

        <aside className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-extrabold">Lịch sử trạng thái</h3>
          <div className="mt-3 grid gap-2">
            {order.history.map((item) => (
              <div className="rounded-lg border border-[#e1e8df] p-3 text-xs" key={`${item.status}-${item.at}`}>
                <p className="font-extrabold">{poLabel[item.status]}</p>
                <p className="mt-1 text-[#687084]">{item.at} · {item.user}</p>
                <p className="mt-1 text-[#475569]">{item.note}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
      {approvalOpen ? <PoApprovalModal action={approvalOpen} onClose={() => setApprovalOpen(null)} onSubmit={updateOrder} order={order} /> : null}
    </section>
  );
}

export function TraceabilityDetailPage({ traceId }: { traceId: string }) {
  const trace = traceBundles.find((bundle) => bundle.id === traceId) ?? traceBundles[0];

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <HarvestHeader active="traceability" />
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4 p-5">
        <section className="rounded-xl border border-[#e1e8df] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#16a34a]">HARV-W06 · Truy xuất nguồn gốc</p>
              <h2 className="mt-1 text-xl font-extrabold">{trace.id}</h2>
              <p className="mt-1 text-xs text-[#687084]">Dữ liệu truy xuất là bản ghi cố định, không chỉnh sửa sau khi tạo.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 items-center gap-2 rounded-lg border border-[#d8e1d6] px-3 text-xs font-bold" type="button"><Download size={14} />Tải PDF</button>
              <Link className="flex h-9 items-center gap-2 rounded-lg bg-[#16a34a] px-3 text-xs font-bold text-white" href={`/harvest/traceability/${trace.id}/qr/`}><QrCode size={14} />Mã QR</Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <section className="rounded-xl border border-[#e1e8df] p-4">
              <h3 className="text-sm font-extrabold">Thông tin lô hàng</h3>
              <div className="mt-3 grid gap-2 text-xs">
                <SummaryRow label="Bản ghi thu hoạch" value={trace.harvestId} />
                <SummaryRow label="Thửa đất" value={`${trace.parcelName} (${trace.parcelCode})`} />
                <SummaryRow label="Nông dân" value={trace.farmer} />
                <SummaryRow label="Cây trồng" value={trace.crop} />
                <SummaryRow label="Sản phẩm" value={trace.product} />
                <SummaryRow label="Ngày thu hoạch" value={trace.harvestDate} />
                <SummaryRow label="Chứng nhận" value={trace.certification} />
              </div>
            </section>
            <section className="rounded-xl border border-[#e1e8df] p-4">
              <h3 className="text-sm font-extrabold">Vị trí thửa & thời tiết</h3>
              <div className="mt-3 flex min-h-36 items-center justify-center rounded-xl bg-[#cdefff]">
                <div className="rounded-lg border border-[#d5d9df] bg-white px-4 py-3 text-center text-xs shadow-sm">
                  <MapPin className="mx-auto text-[#16a34a]" size={20} />
                  <p className="mt-1 font-bold">{trace.parcelCode}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#687084]">{trace.weather}</p>
            </section>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <section className="rounded-xl border border-[#e1e8df] p-4">
              <h3 className="text-sm font-extrabold">Giai đoạn quy trình đã hoàn thành</h3>
              <div className="mt-3 grid gap-2">
                {trace.stages.map((stage) => (
                  <div className="flex items-center justify-between rounded-lg bg-[#f8fafc] px-3 py-2 text-xs" key={stage.name}>
                    <span className="flex items-center gap-2 font-bold"><CheckCircle2 className="text-[#16a34a]" size={14} />{stage.name}</span>
                    <span className="text-[#687084]">{stage.completedAt}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-[#e1e8df] p-4">
              <h3 className="text-sm font-extrabold">Vật tư sử dụng</h3>
              <div className="mt-3 grid gap-2">
                {trace.inputs.map((input) => (
                  <div className="rounded-lg bg-[#f8fafc] px-3 py-2 text-xs" key={`${input.name}-${input.batch}`}>
                    <p className="font-bold">{input.name}</p>
                    <p className="mt-1 text-[#687084]">Số lô {input.batch} · {input.quantity}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <section className="rounded-xl border border-[#e1e8df] bg-white p-5 text-center shadow-sm">
            <span className="inline-flex rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 text-xs font-bold text-[#15803d]">{trace.certification}</span>
            <p className="mt-3 text-sm font-extrabold">Tra cứu công khai</p>
            <p className="mt-1 text-xs leading-5 text-[#687084]">Màn này có thể mở từ mã QR để kiểm tra nguồn gốc lô hàng.</p>
          </section>
        </aside>
      </div>
    </section>
  );
}

export function TraceabilityQrPage({ traceId }: { traceId: string }) {
  const trace = traceBundles.find((bundle) => bundle.id === traceId) ?? traceBundles[0];

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f7faf8]">
      <HarvestHeader active="traceability" />
      <div className="p-5">
        <section className="mx-auto max-w-[520px] rounded-xl border border-[#e1e8df] bg-white p-6 text-center shadow-sm">
          <p className="text-[11px] font-bold text-[#16a34a]">HARV-W07 · Mã QR truy xuất</p>
          <h2 className="mt-1 text-xl font-extrabold">Nhãn truy xuất nguồn gốc</h2>
          <p className="mt-1 text-xs text-[#687084]">Bố cục in nhãn A6/A7.</p>
          <div className="mx-auto mt-5 grid h-48 w-48 grid-cols-6 gap-1 rounded-lg bg-white p-3 shadow-inner ring-1 ring-[#e1e8df]">
            {Array.from({ length: 36 }).map((_, index) => (
              <span className={`${index % 2 === 0 || index % 7 === 0 || index === 11 || index === 31 ? 'bg-[#111827]' : 'bg-[#e5e7eb]'}`} key={index} />
            ))}
          </div>
          <p className="mt-5 text-lg font-extrabold">{trace.id}</p>
          <p className="mt-1 text-sm font-bold">{trace.parcelName}</p>
          <p className="mt-1 text-xs text-[#687084]">{trace.crop} · Thu hoạch {trace.harvestDate}</p>
          <span className="mt-4 inline-flex rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 text-xs font-bold text-[#15803d]">{trace.certification}</span>
          <div className="mt-5 flex justify-center gap-2">
            <button className="h-9 rounded-lg bg-[#16a34a] px-4 text-xs font-bold text-white" type="button">In nhãn</button>
            <Link className="h-9 rounded-lg border border-[#d8e1d6] px-4 py-2 text-xs font-bold" href={`/harvest/traceability/${trace.id}/`}>Xem truy xuất</Link>
          </div>
        </section>
      </div>
    </section>
  );
}

function PurchaseOrderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (order: PurchaseOrder) => void }) {
  const confirmedRecords = harvestRecords.filter((record) => record.status === 'confirmed');
  const [buyer, setBuyer] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const selectedWeight = confirmedRecords.filter((record) => selectedRecords.includes(record.id)).reduce((sum, record) => sum + record.weight, 0);
  const canSubmit = Boolean(buyer && selectedRecords.length > 0 && Number(unitPrice) > 0 && Number(quantity) > 0 && deliveryDate);

  function toggleRecord(id: string) {
    setSelectedRecords((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function submit() {
    if (!canSubmit) return;
    onCreate({
      id: `PO-2026-${Date.now().toString().slice(-4)}`,
      buyer,
      records: selectedRecords,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      deliveryDate,
      status: 'draft',
      history: [{ status: 'draft', at: '28/04/2026 14:00', user: 'Người dùng hiện tại', note: 'Tạo đơn thu mua nháp' }],
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-[720px] overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e1e8df] px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold">Tạo đơn thu mua</h2>
            <p className="mt-1 text-xs text-[#687084]">Chọn một hoặc nhiều bản ghi thu hoạch đã xác nhận.</p>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f3f4f6]" onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="grid gap-4 px-5 py-4">
          <label className="grid gap-2 text-xs font-bold">
            Người mua
            <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setBuyer(event.target.value)} placeholder="Tên doanh nghiệp thu mua" value={buyer} />
          </label>
          <section className="rounded-xl border border-[#e1e8df] p-3">
            <p className="text-xs font-extrabold">Bản ghi thu hoạch liên kết</p>
            <div className="mt-3 grid gap-2">
              {confirmedRecords.map((record) => (
                <label className="flex items-center justify-between rounded-lg border border-[#e1e8df] px-3 py-2 text-xs" key={record.id}>
                  <span><input checked={selectedRecords.includes(record.id)} className="mr-2 accent-[#16a34a]" onChange={() => toggleRecord(record.id)} type="checkbox" />{record.id} · {record.product}</span>
                  <span className="font-bold">{formatKg(record.weight)} kg</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#687084]">Tổng đã chọn: {formatKg(selectedWeight)} kg</p>
          </section>
          <div className="grid grid-cols-3 gap-3">
            <label className="grid gap-2 text-xs font-bold">
              Đơn giá
              <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setUnitPrice(event.target.value)} type="number" value={unitPrice} />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Số lượng đặt (kg)
              <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setQuantity(event.target.value)} type="number" value={quantity} />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Ngày giao
              <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setDeliveryDate(event.target.value)} type="date" value={deliveryDate} />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e1e8df] px-5 py-4">
          <button className="h-9 rounded-lg border border-[#d8e1d6] px-4 text-xs font-bold" onClick={onClose} type="button">Hủy</button>
          <button className="h-9 rounded-lg bg-[#16a34a] px-4 text-xs font-bold text-white disabled:opacity-50" disabled={!canSubmit} onClick={submit} type="button">Tạo đơn</button>
        </div>
      </div>
    </div>
  );
}

function PoApprovalModal({ action, onClose, onSubmit, order }: { action: ApprovalAction; onClose: () => void; onSubmit: (order: PurchaseOrder) => void; order: PurchaseOrder }) {
  const nextStatus = action === 'cancel' ? 'cancelled' : nextPoStatus(order.status);
  const [note, setNote] = useState('');
  const [actualQty, setActualQty] = useState(String(order.quantity));
  const [actualGrade, setActualGrade] = useState('A');
  const delta = Math.abs(Number(actualQty) - order.quantity) / order.quantity;
  const needsReview = nextStatus === 'collected' && delta > 0.2;
  const canSubmit = action === 'cancel' ? Boolean(note.trim()) : true;

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      ...order,
      status: nextStatus,
      actualQuantity: nextStatus === 'collected' ? Number(actualQty) : order.actualQuantity,
      actualGrade: nextStatus === 'collected' ? actualGrade : order.actualGrade,
      cancelReason: action === 'cancel' ? note : order.cancelReason,
      history: [
        ...order.history,
        {
          status: nextStatus,
          at: '28/04/2026 15:20',
          user: 'Người dùng hiện tại',
          note: action === 'cancel' ? `Hủy đơn: ${note}` : note || `Chuyển sang trạng thái ${poLabel[nextStatus]}`,
        },
      ],
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e1e8df] px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold">{action === 'cancel' ? 'Hủy đơn thu mua' : 'Duyệt chuyển trạng thái'}</h2>
            <p className="mt-1 text-xs text-[#687084]">{poLabel[order.status]} → {poLabel[nextStatus]}</p>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f3f4f6]" onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="grid gap-3 px-5 py-4">
          {nextStatus === 'collected' ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs font-bold">
                Số lượng thực tế (kg)
                <input className="h-10 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setActualQty(event.target.value)} type="number" value={actualQty} />
              </label>
              <FilterSelect label="Phân loại thực nhận" onChange={setActualGrade} value={actualGrade}>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </FilterSelect>
              <div className={`col-span-2 rounded-lg border px-3 py-2 text-xs font-bold ${needsReview ? 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]' : 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]'}`}>
                Chênh lệch so với đặt hàng: {Math.round(delta * 100)}% {needsReview ? '· cần rà soát vì vượt 20%' : ''}
              </div>
            </div>
          ) : null}
          <label className="grid gap-2 text-xs font-bold">
            {action === 'cancel' ? 'Lý do hủy' : 'Ghi chú'}
            <textarea className="min-h-24 rounded-lg border border-[#d8e1d6] bg-[#fbfdfb] px-3 py-2 text-xs outline-none focus:border-[#16a34a]" onChange={(event) => setNote(event.target.value)} placeholder={action === 'cancel' ? 'Bắt buộc nhập lý do hủy' : 'Ghi chú chuyển trạng thái'} value={note} />
          </label>
          {action === 'cancel' ? <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#dc2626]">Không thể hủy đơn sau khi đã thu gom.</div> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e1e8df] px-5 py-4">
          <button className="h-9 rounded-lg border border-[#d8e1d6] px-4 text-xs font-bold" onClick={onClose} type="button">Hủy</button>
          <button className="h-9 rounded-lg bg-[#16a34a] px-4 text-xs font-bold text-white disabled:opacity-50" disabled={!canSubmit} onClick={submit} type="button">Xác nhận</button>
        </div>
      </div>
    </div>
  );
}

function PoTimeline({ status }: { status: PoStatus }) {
  const states: PoStatus[] = ['draft', 'confirmed', 'scheduled', 'collected', 'completed'];
  const currentIndex = states.indexOf(status);

  return (
    <div className="mt-4 rounded-xl border border-[#e1e8df] p-4">
      <h3 className="text-sm font-extrabold">Luồng trạng thái</h3>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {states.map((item, index) => (
          <div className={`rounded-full px-3 py-2 text-center text-[10px] font-bold ${index <= currentIndex ? 'bg-[#16a34a] text-white' : 'bg-[#eef1f4] text-[#687084]'}`} key={item}>{poLabel[item]}</div>
        ))}
      </div>
      {status === 'cancelled' ? <p className="mt-3 text-xs font-bold text-[#dc2626]">Đơn thu mua đã hủy.</p> : null}
    </div>
  );
}

function nextPoStatus(status: PoStatus): PoStatus {
  if (status === 'draft') return 'confirmed';
  if (status === 'confirmed') return 'scheduled';
  if (status === 'scheduled') return 'collected';
  if (status === 'collected') return 'completed';
  return status;
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
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs text-[#687084]">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
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

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e1e8df] bg-[#fbfdfb] px-3 py-2">
      <p className="text-[10px] text-[#687084]">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
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
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatKg(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
