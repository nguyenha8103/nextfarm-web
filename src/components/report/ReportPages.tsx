'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart,
  RefreshCw,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export type ReportTypeId = 'zone-summary' | 'compliance' | 'yield' | 'ndvi-trend';

type ReportType = {
  id: ReportTypeId;
  name: string;
  description: string;
  category: 'Vận hành' | 'Tuân thủ' | 'Sản lượng' | 'Sinh trưởng';
  schedule: string;
  lastGenerated: string;
  icon: LucideIcon;
  permission: string;
};

type ExportStatus = 'queued' | 'processing' | 'ready' | 'failed';

const reportTypes: ReportType[] = [
  {
    id: 'zone-summary',
    name: 'Tổng hợp vùng nguyên liệu',
    description: 'Tổng diện tích, số thửa, quy trình đang chạy và phân bố cây trồng theo vùng.',
    category: 'Vận hành',
    schedule: 'Hàng tuần - Thứ 2, 07:00',
    lastGenerated: '2 ngày trước',
    icon: PieChart,
    permission: 'report.zone_summary.view',
  },
  {
    id: 'compliance',
    name: 'Tỷ lệ tuân thủ',
    description: 'Tỷ lệ hoàn thành công việc đúng hạn theo vùng, mùa vụ và tiêu chuẩn VietGAP/GlobalGAP.',
    category: 'Tuân thủ',
    schedule: 'Hàng tháng - ngày 1, 08:00',
    lastGenerated: '15 ngày trước',
    icon: CheckCircle2,
    permission: 'report.compliance.view',
  },
  {
    id: 'yield',
    name: 'Sản lượng thực tế và dự báo',
    description: 'So sánh sản lượng dự báo từ AI với sản lượng thu hoạch thực tế theo vùng.',
    category: 'Sản lượng',
    schedule: 'Tạo thủ công theo mùa vụ',
    lastGenerated: 'Chưa có',
    icon: BarChart3,
    permission: 'report.yield.view',
  },
  {
    id: 'ndvi-trend',
    name: 'Xu hướng NDVI',
    description: 'Theo dõi chỉ số sinh trưởng theo thời gian và cảnh báo vùng có xu hướng suy giảm.',
    category: 'Sinh trưởng',
    schedule: 'Hàng tuần - Thứ 2, 06:00',
    lastGenerated: '5 ngày trước',
    icon: TrendingUp,
    permission: 'report.ndvi.view',
  },
];

const zoneRows = [
  { zone: 'Vùng lúa Long An', area: '84.6 ha', parcels: 31, active: 28, crop: 'Lúa ST25', rate: '90%' },
  { zone: 'Vùng rau Củ Chi', area: '38.4 ha', parcels: 18, active: 15, crop: 'Rau ăn lá', rate: '83%' },
  { zone: 'Vùng cây ăn trái Đồng Nai', area: '52.8 ha', parcels: 24, active: 18, crop: 'Sầu riêng', rate: '75%' },
];

const complianceRows = [
  { zone: 'Vùng lúa Long An', total: 28, compliant: 26, rate: 93, status: 'Tốt' },
  { zone: 'Vùng rau Củ Chi', total: 15, compliant: 12, rate: 80, status: 'Cần theo dõi' },
  { zone: 'Vùng cây ăn trái Đồng Nai', total: 18, compliant: 11, rate: 61, status: 'Rủi ro' },
];

const yieldRows = [
  { zone: 'Vùng lúa Long An', crop: 'Lúa ST25', forecast: 51200, actual: 49850, delta: '-2.6%', season: 'Đông Xuân 2026' },
  { zone: 'Vùng rau Củ Chi', crop: 'Rau ăn lá', forecast: 18400, actual: 19120, delta: '+3.9%', season: 'Hè Thu 2026' },
  { zone: 'Vùng cây ăn trái Đồng Nai', crop: 'Sầu riêng', forecast: 72400, actual: 68150, delta: '-5.9%', season: '2026' },
];

const ndviRows = [
  { zone: 'Vùng lúa Long An', current: '0.78', trend: '+0.04', alert: 'Ổn định' },
  { zone: 'Vùng rau Củ Chi', current: '0.66', trend: '-0.08', alert: 'Giảm nhanh' },
  { zone: 'Vùng cây ăn trái Đồng Nai', current: '0.71', trend: '-0.03', alert: 'Cần kiểm tra' },
];

const exportJobs = [
  { id: 'JOB-RPT-001', report: 'Tổng hợp vùng nguyên liệu', format: 'PDF', status: 'ready' as ExportStatus, progress: 100, createdAt: '04/05/2026 09:20' },
  { id: 'JOB-RPT-002', report: 'Tỷ lệ tuân thủ', format: 'Excel', status: 'processing' as ExportStatus, progress: 64, createdAt: '04/05/2026 09:28' },
  { id: 'JOB-RPT-003', report: 'Xu hướng NDVI', format: 'PDF', status: 'queued' as ExportStatus, progress: 18, createdAt: '04/05/2026 09:32' },
];

const schedules = [
  { id: 'SCH-001', report: 'Tổng hợp vùng nguyên liệu', frequency: 'Hàng tuần - Thứ 2', params: 'Tất cả vùng · Tất cả cây trồng', lastRun: '29/04/2026 07:00', nextRun: '06/05/2026 07:00', status: 'Đang bật' },
  { id: 'SCH-002', report: 'Tỷ lệ tuân thủ', frequency: 'Hàng tháng - ngày 1', params: 'VietGAP · Vụ hiện tại', lastRun: '01/05/2026 08:00', nextRun: '01/06/2026 08:00', status: 'Đang bật' },
  { id: 'SCH-003', report: 'Xu hướng NDVI', frequency: 'Hàng tuần - Thứ 2', params: 'Vùng rau Củ Chi', lastRun: '29/04/2026 06:00', nextRun: '06/05/2026 06:00', status: 'Tạm dừng' },
];

function ReportShell({ active, children }: { active: 'catalog' | 'generator' | 'schedules'; children: React.ReactNode }) {
  const tabs = [
    { id: 'catalog', label: 'Danh mục báo cáo', href: '/reports/', icon: FileText },
    { id: 'generator', label: 'Tạo báo cáo', href: '/reports/zone-summary/', icon: RefreshCw },
    { id: 'schedules', label: 'Lịch tự động', href: '/reports/schedules/', icon: CalendarClock },
  ] as const;

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fbf7] p-5 text-[#0f172a]">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#16a34a]">Báo cáo</p>
        <h1 className="mt-2 text-2xl font-extrabold leading-8">Trung tâm báo cáo nông nghiệp</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#526178]">
          Tổng hợp dữ liệu từ GIS, Quy trình, Thu hoạch và AI để tạo báo cáo vận hành, tuân thủ, sản lượng và xu hướng NDVI.
        </p>
      </div>

      <nav className="mt-5 flex flex-wrap gap-2 rounded-xl border border-[#dce7dc] bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;
          return (
            <Link
              className={`flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
                selected ? 'border border-[#16a34a] bg-[#ecfdf3] text-[#15803d]' : 'text-[#0f172a] hover:bg-[#f5f7f5]'
              }`}
              href={tab.href}
              key={tab.id}
            >
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

export function ReportCatalogPage() {
  const [category, setCategory] = useState('Tất cả');
  const filteredReports = category === 'Tất cả' ? reportTypes : reportTypes.filter((item) => item.category === category);

  return (
    <ReportShell active="catalog">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce7dc] bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-bold text-[#16a34a]">RPT-W01 · Danh mục loại báo cáo</p>
          <h2 className="mt-1 text-lg font-extrabold">Chọn loại báo cáo cần xem hoặc tạo mới</h2>
        </div>
        <select className="h-10 rounded-lg border border-[#d4ded4] px-3 text-sm font-bold" onChange={(event) => setCategory(event.target.value)} value={category}>
          {['Tất cả', 'Vận hành', 'Tuân thủ', 'Sản lượng', 'Sinh trưởng'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 max-xl:grid-cols-1">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <article className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm" key={report.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16a34a]">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#16a34a]">{report.category}</p>
                    <h3 className="mt-1 text-lg font-extrabold">{report.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#64748b]">{report.description}</p>
                  </div>
                </div>
                <span className="rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-xs font-bold text-[#2563eb]">{report.schedule}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <InfoBox label="Lần tạo gần nhất" value={report.lastGenerated} />
                <InfoBox label="Quyền truy cập" value={permissionLabel(report.permission)} />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Link className="rounded-lg border border-[#d4ded4] px-4 py-2 text-sm font-bold" href={`/reports/${report.id}/`}>Xem báo cáo</Link>
                <Link className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-bold text-white" href={`/reports/${report.id}/`}>Tạo ngay</Link>
              </div>
            </article>
          );
        })}
      </div>
    </ReportShell>
  );
}

export function ReportGeneratorPage({ type }: { type: string }) {
  const report = reportTypes.find((item) => item.id === type) ?? reportTypes[0];
  const [loading, setLoading] = useState(false);
  const exportJob = getExportJobByReport(report.id);

  function refreshReport() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  }

  return (
    <ReportShell active="generator">
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#16a34a]">RPT-W02 · Trình tạo báo cáo</p>
            <h2 className="mt-1 text-xl font-extrabold">{report.name}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748b]">{report.description}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex h-10 items-center gap-2 rounded-lg border border-[#d4ded4] px-4 text-sm font-bold" onClick={refreshReport} type="button">
              <RefreshCw size={16} />
              Làm mới
            </button>
            <Link className="flex h-10 items-center gap-2 rounded-lg bg-[#16a34a] px-4 text-sm font-bold text-white" href={`/reports/exports/${exportJob.pdf}/`}>
              <Download size={16} />
              Tải PDF
            </Link>
            <Link className="flex h-10 items-center gap-2 rounded-lg border border-[#16a34a] px-4 text-sm font-bold text-[#15803d]" href={`/reports/exports/${exportJob.excel}/`}>
              <FileSpreadsheet size={16} />
              Tải Excel
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-3 max-xl:grid-cols-2">
          <SelectField label="Vùng" options={['Tất cả vùng', 'Vùng lúa Long An', 'Vùng rau Củ Chi', 'Vùng cây ăn trái Đồng Nai']} />
          <SelectField label="Từ ngày" options={['01/01/2026', '01/04/2026', '01/05/2026']} />
          <SelectField label="Đến ngày" options={['04/05/2026', '30/06/2026', '31/12/2026']} />
          <SelectField label="Cây trồng" options={['Tất cả cây trồng', 'Lúa ST25', 'Rau ăn lá', 'Sầu riêng']} />
          <SelectField label="Mùa vụ" options={['Vụ hiện tại', 'Đông Xuân 2026', 'Hè Thu 2026']} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 font-bold text-[#15803d]">Dữ liệu đệm: 15 phút trước</span>
          <span className="rounded-full border border-[#bae6fd] bg-[#f0f9ff] px-3 py-1 font-bold text-[#0369a1]">Nguồn qua API dịch vụ, không truy vấn CSDL trực tiếp</span>
          <span className="rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3 py-1 font-bold text-[#c2410c]">Báo cáo nặng sẽ chạy nền bằng Hangfire</span>
        </div>
      </section>

      {loading ? <ReportLoading /> : <ReportBody type={report.id} />}
    </ReportShell>
  );
}

function ReportBody({ type }: { type: ReportTypeId }) {
  if (type === 'compliance') return <ComplianceReport />;
  if (type === 'yield') return <YieldReport />;
  if (type === 'ndvi-trend') return <NdviReport />;
  return <ZoneSummaryReport />;
}

function ZoneSummaryReport() {
  return (
    <>
      <div className="mt-5 grid grid-cols-4 gap-4 max-xl:grid-cols-2">
        <MetricCard label="Tổng diện tích canh tác" value="175.8 ha" />
        <MetricCard label="Thửa có quy trình" value="61/73" />
        <MetricCard label="Quy trình đang chạy" value="61" />
        <MetricCard label="Tỷ lệ sử dụng vùng" value="84%" />
      </div>
      <div className="mt-5 grid grid-cols-[420px_minmax(0,1fr)] gap-5 max-xl:grid-cols-1">
        <PiePanel />
        <DataTable columns={['Vùng', 'Diện tích', 'Số thửa', 'Đang chạy', 'Cây chính', 'Tỷ lệ']} rows={zoneRows.map((item) => [item.zone, item.area, item.parcels, item.active, item.crop, item.rate])} />
      </div>
    </>
  );
}

function ComplianceReport() {
  return (
    <>
      <div className="mt-5 grid grid-cols-4 gap-4 max-xl:grid-cols-2">
        <MetricCard label="Quy trình kiểm tra" value="61" />
        <MetricCard label="Đạt tuân thủ" value="49" />
        <MetricCard label="Tỷ lệ trung bình" value="80.3%" />
        <MetricCard label="Vùng rủi ro" value="1" />
      </div>
      <DataTable
        columns={['Vùng', 'Tổng quy trình', 'Đạt tuân thủ', 'Tỷ lệ', 'Trạng thái']}
        rows={complianceRows.map((item) => [item.zone, item.total, item.compliant, <ComplianceBadge value={item.rate} key={item.zone} />, item.status])}
      />
    </>
  );
}

function YieldReport() {
  const maxValue = Math.max(...yieldRows.map((item) => Math.max(item.forecast, item.actual)));
  return (
    <>
      <div className="mt-5 rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <h3 className="text-base font-extrabold">So sánh sản lượng dự báo và thực tế</h3>
        <div className="mt-5 grid gap-4">
          {yieldRows.map((item) => (
            <div className="grid grid-cols-[190px_1fr_110px] items-center gap-4" key={item.zone}>
              <div>
                <p className="text-sm font-bold">{item.zone}</p>
                <p className="text-xs text-[#64748b]">{item.crop}</p>
              </div>
              <div className="grid gap-2">
                <BarLine label="Dự báo" value={item.forecast} max={maxValue} color="#93c5fd" />
                <BarLine label="Thực tế" value={item.actual} max={maxValue} color="#16a34a" />
              </div>
              <p className={`text-sm font-extrabold ${item.delta.startsWith('+') ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>{item.delta}</p>
            </div>
          ))}
        </div>
      </div>
      <DataTable columns={['Vùng', 'Cây trồng', 'Dự báo', 'Thực tế', 'Chênh lệch', 'Mùa vụ']} rows={yieldRows.map((item) => [item.zone, item.crop, formatKg(item.forecast), formatKg(item.actual), item.delta, item.season])} />
    </>
  );
}

function NdviReport() {
  return (
    <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] gap-5 max-xl:grid-cols-1">
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <h3 className="text-base font-extrabold">Xu hướng NDVI 90 ngày</h3>
        <div className="mt-5 h-[280px] rounded-xl bg-[#eef8ef] p-5">
          <div className="relative h-full">
            {[0, 1, 2, 3].map((index) => (
              <div className="absolute left-0 right-0 border-t border-dashed border-[#cbd5e1]" key={index} style={{ top: `${index * 25}%` }} />
            ))}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 220" preserveAspectRatio="none">
              <polyline points="0,120 70,105 140,95 210,80 280,72 350,66 430,62 520,58" fill="none" stroke="#16a34a" strokeWidth="4" />
              <polyline points="0,95 70,100 140,112 210,124 280,136 350,150 430,166 520,180" fill="none" stroke="#f97316" strokeWidth="4" />
              <polyline points="0,110 70,108 140,103 210,107 280,112 350,118 430,122 520,128" fill="none" stroke="#2563eb" strokeWidth="4" />
            </svg>
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <h3 className="text-base font-extrabold">Vùng cần chú ý</h3>
        <div className="mt-4 grid gap-3">
          {ndviRows.map((item) => (
            <div className="rounded-lg border border-[#e3ebe3] p-3" key={item.zone}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold">{item.zone}</p>
                <span className={item.trend.startsWith('-') ? 'text-sm font-bold text-[#dc2626]' : 'text-sm font-bold text-[#15803d]'}>{item.trend}</span>
              </div>
              <p className="mt-1 text-xs text-[#64748b]">NDVI hiện tại: {item.current} · {item.alert}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ReportExportPage({ jobId }: { jobId: string }) {
  const job = exportJobs.find((item) => item.id === jobId) ?? exportJobs[0];
  return (
    <ReportShell active="generator">
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5 max-xl:grid-cols-1">
        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-[#16a34a]">RPT-W03 · Tải xuống và xem trước</p>
          <h2 className="mt-1 text-xl font-extrabold">{job.report}</h2>
          <p className="mt-2 text-sm text-[#64748b]">Mã tác vụ: {job.id} · Định dạng: {job.format} · Tạo lúc {job.createdAt}</p>

          <div className="mt-6 rounded-xl border border-[#e3ebe3] bg-[#f8fafc] p-5">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={job.status} />
              <span className="text-sm font-bold">{job.progress}%</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-[#e2e8f0]">
              <div className="h-3 rounded-full bg-[#16a34a]" style={{ width: `${job.progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-[#64748b]">Trang này tự làm mới mỗi 5 giây khi tác vụ đang xử lý. Báo cáo sẵn sàng sẽ có thông báo trong hệ thống.</p>
          </div>

          <div className="mt-5 min-h-[360px] rounded-xl border border-[#dce7dc] bg-white p-5">
            <h3 className="text-base font-extrabold">Xem trước báo cáo</h3>
            <div className="mt-4 rounded-lg bg-[#f1f5f9] p-4 text-sm leading-6 text-[#475569]">
              <p className="font-bold text-[#0f172a]">Nextfarm · HTX Nông nghiệp Bình Điền</p>
              <p>Báo cáo: {job.report}</p>
              <p>Khoảng thời gian: 01/01/2026 - 04/05/2026</p>
              <p>Bộ lọc: Tất cả vùng, tất cả cây trồng, vụ hiện tại</p>
              <div className="mt-4 h-32 rounded-lg bg-white" />
              <p className="mt-4">Nội dung xem trước mô phỏng file {job.format}. File thật sẽ được lưu trên kho tệp và giữ trong 7 ngày.</p>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold">Lịch sử xuất gần đây</h3>
          <div className="mt-4 grid gap-3">
            {exportJobs.map((item) => (
              <Link className="rounded-lg border border-[#e3ebe3] p-3 hover:bg-[#f8fbf7]" href={`/reports/exports/${item.id}/`} key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold">{item.report}</p>
                  <span className="text-xs text-[#64748b]">{item.format}</span>
                </div>
                <p className="mt-1 text-xs text-[#64748b]">{item.id} · {item.createdAt}</p>
              </Link>
            ))}
          </div>
          <button className="mt-5 h-10 w-full rounded-lg bg-[#16a34a] text-sm font-bold text-white" disabled={job.status !== 'ready'} type="button">
            Tải tệp báo cáo
          </button>
        </aside>
      </div>
    </ReportShell>
  );
}

export function ReportSchedulesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <ReportShell active="schedules">
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#16a34a]">RPT-W04 · Lịch tạo báo cáo tự động</p>
            <h2 className="mt-1 text-xl font-extrabold">Quản lý lịch báo cáo định kỳ</h2>
            <p className="mt-2 text-sm text-[#64748b]">Báo cáo định kỳ chạy bằng Hangfire, gửi liên kết tải qua thông báo trong hệ thống. Email sẽ bổ sung ở giai đoạn 2.</p>
          </div>
          <button className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-bold text-white" onClick={() => setShowForm((current) => !current)} type="button">
            + Tạo lịch mới
          </button>
        </div>

        {showForm ? (
          <div className="mt-5 grid grid-cols-4 gap-3 rounded-xl border border-[#e3ebe3] bg-[#f8fafc] p-4 max-xl:grid-cols-2">
            <SelectField label="Loại báo cáo" options={reportTypes.map((item) => item.name)} />
            <SelectField label="Vùng" options={['Tất cả vùng', 'Vùng lúa Long An', 'Vùng rau Củ Chi']} />
            <SelectField label="Tần suất" options={['Hàng tuần', 'Hàng tháng']} />
            <SelectField label="Định dạng" options={['PDF và Excel', 'PDF', 'Excel']} />
            <SelectField label="Ngày trong tuần" options={['Thứ 2', 'Thứ 3', 'Thứ 6']} />
            <SelectField label="Cây trồng" options={['Tất cả cây trồng', 'Lúa ST25', 'Rau ăn lá']} />
            <SelectField label="Kênh nhận" options={['Thông báo trong hệ thống', 'Email - giai đoạn 2']} />
            <button className="mt-6 h-10 rounded-lg bg-[#16a34a] text-sm font-bold text-white" type="button">Lưu lịch</button>
          </div>
        ) : null}
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-[#dce7dc] bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_150px_1.2fr_150px_150px_110px_170px] bg-[#f1f5f9] px-4 py-3 text-xs font-bold text-[#475569]">
          <span>Loại báo cáo</span><span>Tần suất</span><span>Tham số</span><span>Lần chạy gần nhất</span><span>Lần chạy tiếp theo</span><span>Trạng thái</span><span>Thao tác</span>
        </div>
        {schedules.map((item) => (
          <div className="grid grid-cols-[1fr_150px_1.2fr_150px_150px_110px_170px] items-center border-t border-[#e3ebe3] px-4 py-3 text-sm" key={item.id}>
            <span className="font-bold">{item.report}<span className="block text-xs font-normal text-[#64748b]">{item.id}</span></span>
            <span>{item.frequency}</span>
            <span>{item.params}</span>
            <span>{item.lastRun}</span>
            <span>{item.nextRun}</span>
            <span className={item.status === 'Đang bật' ? 'font-bold text-[#15803d]' : 'font-bold text-[#64748b]'}>{item.status}</span>
            <span className="flex gap-2">
              <button className="rounded-md border border-[#d4ded4] px-2 py-1 text-xs font-bold" type="button">Sửa</button>
              <button className="rounded-md border border-[#d4ded4] px-2 py-1 text-xs font-bold" type="button">{item.status === 'Đang bật' ? 'Tạm dừng' : 'Bật lại'}</button>
              <button className="rounded-md border border-[#fecaca] px-2 py-1 text-xs font-bold text-[#dc2626]" type="button">Xóa</button>
            </span>
          </div>
        ))}
      </section>
    </ReportShell>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f8fafc] p-3">
      <p className="text-xs text-[#64748b]">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="text-xs font-bold">
      {label}
      <select className="mt-2 h-10 w-full rounded-lg border border-[#d4ded4] px-3 text-sm outline-none focus:border-[#16a34a]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#64748b]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </article>
  );
}

function PiePanel() {
  return (
    <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
      <h3 className="text-base font-extrabold">Phân bố cây trồng</h3>
      <div className="mt-5 flex items-center gap-6">
        <div className="h-40 w-40 rounded-full" style={{ background: 'conic-gradient(#16a34a 0 45%, #2563eb 45% 75%, #f59e0b 75% 100%)' }} />
        <div className="grid gap-3 text-sm">
          <Legend color="#16a34a" label="Lúa" value="45%" />
          <Legend color="#2563eb" label="Rau" value="30%" />
          <Legend color="#f59e0b" label="Cây ăn trái" value="25%" />
        </div>
      </div>
    </section>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-[#dce7dc] bg-white shadow-sm">
      <div className="grid bg-[#f1f5f9] px-4 py-3 text-xs font-bold text-[#475569]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((column) => <span key={column}>{column}</span>)}
      </div>
      {rows.map((row, rowIndex) => (
        <div className="grid border-t border-[#e3ebe3] px-4 py-3 text-sm" key={rowIndex} style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {row.map((cell, cellIndex) => <span className={cellIndex === 0 ? 'font-bold' : ''} key={cellIndex}>{cell}</span>)}
        </div>
      ))}
    </section>
  );
}

function ComplianceBadge({ value }: { value: number }) {
  const style = value > 90 ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]' : value >= 70 ? 'border-[#fde68a] bg-[#fffbeb] text-[#b45309]' : 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]';
  return <span className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-bold ${style}`}>{value}%</span>;
}

function BarLine({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="grid grid-cols-[60px_1fr_90px] items-center gap-2 text-xs">
      <span className="font-bold text-[#64748b]">{label}</span>
      <div className="h-3 rounded-full bg-[#eef2f7]">
        <div className="h-3 rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="font-bold">{formatKg(value)}</span>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-bold">{label}</span>
      <span className="text-[#64748b]">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ExportStatus }) {
  const config = {
    queued: ['Đang chờ', 'border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]'],
    processing: ['Đang xử lý', 'border-[#fde68a] bg-[#fffbeb] text-[#b45309]'],
    ready: ['Sẵn sàng tải', 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]'],
    failed: ['Thất bại', 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]'],
  } satisfies Record<ExportStatus, [string, string]>;
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${config[status][1]}`}>{config[status][0]}</span>;
}

function ReportLoading() {
  return (
    <div className="mt-5 rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded bg-[#eef2f7]" />
      <div className="mt-5 grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => <div className="h-24 animate-pulse rounded-xl bg-[#eef2f7]" key={item} />)}
      </div>
      <div className="mt-5 h-80 animate-pulse rounded-xl bg-[#eef2f7]" />
    </div>
  );
}

function permissionLabel(permission: string) {
  if (permission.includes('compliance') || permission.includes('yield')) return 'Quản trị viên, Quản lý doanh nghiệp';
  return 'Quản lý nông trại, Quản trị viên';
}

function getExportJobByReport(reportId: ReportTypeId) {
  const jobMap: Record<ReportTypeId, { pdf: string; excel: string }> = {
    'zone-summary': { pdf: 'JOB-RPT-001', excel: 'JOB-RPT-002' },
    compliance: { pdf: 'JOB-RPT-004', excel: 'JOB-RPT-002' },
    yield: { pdf: 'JOB-RPT-005', excel: 'JOB-RPT-006' },
    'ndvi-trend': { pdf: 'JOB-RPT-003', excel: 'JOB-RPT-007' },
  };

  return jobMap[reportId];
}

function formatKg(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} kg`;
}
