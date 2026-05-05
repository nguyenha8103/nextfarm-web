'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Camera,
  FileText,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  type LucideIcon,
} from 'lucide-react';

type AiPageKey = 'assistant' | 'pest' | 'plan' | 'forecast' | 'usage';
type ConfidenceTone = 'good' | 'warn' | 'danger';

const tabs: Array<{ key: AiPageKey; href: string; label: string; icon: LucideIcon }> = [
  { key: 'assistant', href: '/ai/assistant/', label: 'Trợ lý AI', icon: MessageSquareText },
  { key: 'pest', href: '/ai/pest-detection/', label: 'Nhận diện sâu bệnh', icon: Camera },
  { key: 'plan', href: '/ai/process-plan/', label: 'Tạo quy trình', icon: Sparkles },
  { key: 'forecast', href: '/ai/yield-forecast/', label: 'Dự báo sản lượng', icon: BarChart3 },
  { key: 'usage', href: '/ai/usage/', label: 'Theo dõi sử dụng', icon: ShieldCheck },
];

const conversations = [
  {
    role: 'ai',
    text: 'Xin chào. Tôi có thể hỗ trợ phân tích mùa vụ, rủi ro sâu bệnh, kế hoạch canh tác và dữ liệu trong không gian làm việc hiện tại.',
    citations: [],
  },
  {
    role: 'user',
    text: 'Lúa ở thửa P-LA-032 bị vàng lá nhẹ, nên kiểm tra gì trước?',
    citations: [],
  },
  {
    role: 'ai',
    text: 'Dựa trên nhật ký gần đây và độ ẩm đất 43%, nên kiểm tra thiếu đạm, pH đất và dấu hiệu đạo ôn lá. Ưu tiên đo lại pH, kiểm tra màu lá theo hàng và đối chiếu lịch bón phân trước khi xử lý.',
    citations: ['VietGAP - quản lý dinh dưỡng lúa trang 42', 'Nhật ký bón phân vụ Đông Xuân 2026'],
  },
];

const contextItems = [
  { label: 'Không gian làm việc', value: 'HTX Nông nghiệp Bình Điền' },
  { label: 'Thửa đang chọn', value: 'P-LA-032 - Vùng lúa Long An' },
  { label: 'Mùa vụ', value: 'Vụ Đông Xuân 2026' },
  { label: 'Giai đoạn', value: 'Chăm sóc - bón phân lần 2' },
  { label: 'Thời tiết', value: '29°C, độ ẩm 74%, mưa nhẹ' },
];

const detections = [
  { id: 'AR-026', parcel: 'P-HCM-001', crop: 'Rau ăn lá', issue: 'Sâu tơ', confidence: 0.86, date: '04/05/2026 09:20', status: 'Đã tạo AnomalyReport' },
  { id: 'AR-024', parcel: 'P-LA-032', crop: 'Lúa ST25', issue: 'Vàng lá do thiếu đạm', confidence: 0.72, date: '02/05/2026 15:10', status: 'Đang theo dõi' },
  { id: 'AR-019', parcel: 'P-DN-018', crop: 'Sầu riêng', issue: 'Nấm Phytophthora', confidence: 0.58, date: '29/04/2026 08:45', status: 'Cần xác nhận chuyên gia' },
];

const planStages = [
  { name: 'Chuẩn bị đất', offset: 'Ngày 0 - 5', tasks: ['Làm đất, lên luống', 'Kiểm tra pH', 'Bón lót phân hữu cơ'], input: 'Phân hữu cơ vi sinh' },
  { name: 'Gieo trồng', offset: 'Ngày 6 - 10', tasks: ['Gieo hạt', 'Tưới giữ ẩm', 'Ghi nhận ảnh hiện trường'], input: 'Hạt giống rau ăn lá' },
  { name: 'Chăm sóc', offset: 'Ngày 11 - 32', tasks: ['Tưới theo độ ẩm đất', 'Kiểm tra sâu bệnh', 'Bón thúc NPK'], input: 'NPK 16-16-8' },
  { name: 'Thu hoạch', offset: 'Ngày 33 - 45', tasks: ['Kiểm tra cách ly', 'Phân hạng', 'Khai báo sản lượng'], input: 'Bảng kiểm VietGAP' },
];

const forecasts = [
  { parcel: 'P-LA-032', crop: 'Lúa ST25', area: 84.6, forecast: 51200, low: 48600, high: 53800, last: 49200, delta: '+4.1%' },
  { parcel: 'P-HCM-001', crop: 'Rau ăn lá', area: 38.4, forecast: 18400, low: 16900, high: 19700, last: 17600, delta: '+4.5%' },
  { parcel: 'P-DN-018', crop: 'Sầu riêng', area: 52.8, forecast: 72400, low: 68100, high: 76800, last: 75100, delta: '-3.6%' },
];

const usageRows = [
  { user: 'Nguyễn Văn An', role: 'Quản lý nông trại', requests: 18, tokens: '42.600', limited: 'Còn 2 lượt/giờ' },
  { user: 'Trần Thị Bình', role: 'Kỹ sư nông nghiệp', requests: 11, tokens: '26.140', limited: 'Còn 9 lượt/giờ' },
  { user: 'Lê Văn Công', role: 'Nhân sự hiện trường', requests: 6, tokens: '8.920', limited: 'Còn 14 lượt/giờ' },
];

function AiShell({ active, children }: { active: AiPageKey; children: React.ReactNode }) {
  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fbf7] p-5 text-[#0f172a]">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#16a34a]">AI</p>
        <h1 className="mt-2 text-2xl font-extrabold leading-8">Trung tâm AI nông nghiệp</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#526178]">
          Trợ lý canh tác, nhận diện sâu bệnh, tạo quy trình có kiểm duyệt, dự báo sản lượng và theo dõi chi phí AI theo không gian làm việc.
        </p>
      </div>

      <nav className="mt-5 flex flex-wrap gap-2 rounded-xl border border-[#dce7dc] bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.key;
          return (
            <Link
              className={`flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
                selected ? 'border border-[#16a34a] bg-[#ecfdf3] text-[#15803d]' : 'text-[#0f172a] hover:bg-[#f5f7f5]'
              }`}
              href={tab.href}
              key={tab.key}
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

export function AiAssistantPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(conversations);

  function submitMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { role: 'user', text: trimmed, citations: [] },
      {
        role: 'ai',
        text: 'Tôi sẽ phân tích trong phạm vi không gian làm việc hiện tại. Gợi ý này là bản tham khảo, cần đối chiếu thực địa trước khi áp dụng.',
        citations: ['Ngữ cảnh thửa và nhật ký canh tác trong không gian làm việc'],
      },
    ]);
    setInput('');
  }

  return (
    <AiShell active="assistant">
      <div className="grid grid-cols-[minmax(0,1fr)_330px] gap-5 max-xl:grid-cols-1">
        <section className="flex min-h-[620px] flex-col rounded-xl border border-[#dce7dc] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e3ebe3] px-5 py-4">
            <div>
              <p className="text-xs font-bold text-[#16a34a]">AI-W01 · Trợ lý hội thoại</p>
              <h2 className="mt-1 text-lg font-extrabold">Trợ lý canh tác theo dữ liệu nông trại</h2>
            </div>
            <span className="rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 text-xs font-bold text-[#15803d]">20 yêu cầu/người/giờ</span>
          </div>

          <div className="flex-1 space-y-4 overflow-auto p-5">
            {messages.map((message, index) => (
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={`${message.role}-${index}`}>
                <article className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-[#16a34a] text-white' : 'border border-[#e3ebe3] bg-[#f8fbf7]'}`}>
                  <p>{message.text}</p>
                  {message.citations.length ? (
                    <div className="mt-3 grid gap-1 border-t border-[#dce7dc] pt-2 text-xs text-[#2563eb]">
                      {message.citations.map((citation, itemIndex) => (
                        <span key={citation}>[{itemIndex + 1}] {citation}</span>
                      ))}
                    </div>
                  ) : null}
                </article>
              </div>
            ))}
          </div>

          <div className="border-t border-[#e3ebe3] p-4">
            <div className="flex gap-3">
              <input
                className="h-11 min-w-0 flex-1 rounded-lg border border-[#d4ded4] px-4 text-sm outline-none transition focus:border-[#16a34a] focus:ring-2 focus:ring-[#dcfce7]"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitMessage();
                }}
                placeholder="Nhập câu hỏi về mùa vụ, sâu bệnh, vật tư hoặc quy trình..."
                value={input}
              />
              <button className="flex h-11 items-center gap-2 rounded-lg bg-[#16a34a] px-5 text-sm font-bold text-white" onClick={submitMessage} type="button">
                <Send size={16} />
                Gửi
              </button>
            </div>
            <p className="mt-2 text-xs text-[#64748b]">Phản hồi dùng truy xuất tri thức qua pgvector, có trích dẫn khi tìm thấy nguồn phù hợp. Thời gian chờ mô hình ngôn ngữ: 30 giây.</p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-[#dce7dc] bg-white p-4 shadow-sm">
            <h3 className="text-sm font-extrabold">Ngữ cảnh không gian làm việc</h3>
            <div className="mt-3 grid gap-3">
              {contextItems.map((item) => (
                <div className="rounded-lg bg-[#f8fafc] p-3" key={item.label}>
                  <p className="text-xs text-[#64748b]">{item.label}</p>
                  <p className="mt-1 text-sm font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-[#bae6fd] bg-[#f0f9ff] p-4 text-sm leading-6 text-[#075985]">
            <p className="font-extrabold">Cách ly dữ liệu</p>
            <p className="mt-1">AI chỉ truy xuất thửa, mùa vụ và nhật ký thuộc không gian làm việc hiện tại theo BR-AI-02.</p>
          </section>
        </aside>
      </div>
    </AiShell>
  );
}

export function AiPestDetectionPage() {
  const [selected, setSelected] = useState(detections[0]);
  const [fileName, setFileName] = useState('');
  const confidenceTone: ConfidenceTone = selected.confidence > 0.8 ? 'good' : selected.confidence >= 0.6 ? 'warn' : 'danger';

  return (
    <AiShell active="pest">
      <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-5 max-xl:grid-cols-1">
        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-[#16a34a]">AI-W02 · Tải ảnh sâu bệnh</p>
          <h2 className="mt-1 text-lg font-extrabold">Nhận diện sâu bệnh từ ảnh</h2>
          <p className="mt-2 text-sm text-[#64748b]">Hỗ trợ ảnh JPEG/PNG, tối đa 5MB. Kết quả tạo báo cáo bất thường và gửi sự kiện cảnh báo khi có rủi ro cao.</p>

          <label className="mt-5 block cursor-pointer rounded-xl border border-dashed border-[#9ed6a8] bg-[#f6fff8] p-6 text-center transition hover:border-[#16a34a] hover:bg-[#f0fdf4]">
            <input
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                setSelected(detections[0]);
              }}
              type="file"
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a]">
              <Upload size={26} />
            </div>
            <p className="mt-3 text-sm font-extrabold">Kéo thả ảnh cây trồng vào đây</p>
            <p className="mt-1 text-xs text-[#64748b]">Hoặc chọn ảnh từ máy/camera để mô phỏng phân tích bằng mô hình thị giác.</p>
            <span className="mt-4 inline-flex rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-bold text-white">Chọn ảnh</span>
            {fileName ? (
              <span className="mx-auto mt-3 block max-w-[320px] truncate rounded-lg border border-[#bbf7d0] bg-white px-3 py-2 text-xs font-bold text-[#15803d]">
                Đã chọn: {fileName}
              </span>
            ) : null}
          </label>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-xs font-bold">
              Thửa đất
              <select className="mt-2 h-10 w-full rounded-lg border border-[#d4ded4] px-3 text-sm">
                <option>P-HCM-001 - Rau Củ Chi</option>
                <option>P-LA-032 - Lúa Long An</option>
                <option>P-DN-018 - Sầu riêng Đồng Nai</option>
              </select>
            </label>
            <label className="text-xs font-bold">
              Cây trồng
              <select className="mt-2 h-10 w-full rounded-lg border border-[#d4ded4] px-3 text-sm">
                <option>Rau ăn lá</option>
                <option>Lúa ST25</option>
                <option>Sầu riêng</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#16a34a]">Kết quả nhận diện</p>
              <h2 className="mt-1 text-xl font-extrabold">{selected.issue}</h2>
              <p className="mt-1 text-sm text-[#64748b]">{selected.parcel} · {selected.crop} · {selected.date}</p>
            </div>
            <ConfidenceBadge value={selected.confidence} tone={confidenceTone} />
          </div>

          {confidenceTone === 'danger' ? (
            <div className="mt-4 flex gap-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
              <AlertTriangle className="shrink-0" size={18} />
              Cần xác nhận từ chuyên gia trước khi xử lý vì độ tin cậy thấp hơn 60%.
            </div>
          ) : null}

          <div className="mt-5 grid gap-3">
            {['Khoanh vùng khu vực bị ảnh hưởng và chụp thêm ảnh đối chứng.', 'Kiểm tra mật độ sâu bệnh theo 5 điểm trong thửa.', 'Ưu tiên biện pháp sinh học, chỉ dùng thuốc BVTV khi vượt ngưỡng khuyến cáo.'].map((step, index) => (
              <div className="flex gap-3 rounded-lg bg-[#f8fafc] p-3 text-sm" key={step}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-xs font-extrabold text-white">{index + 1}</span>
                {step}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-[#e3ebe3]">
            <div className="grid grid-cols-[1fr_1fr_1fr] bg-[#f1f5f9] px-3 py-2 text-xs font-bold text-[#475569]">
              <span>Lịch sử</span>
              <span>Độ tin cậy</span>
              <span>Trạng thái</span>
            </div>
            {detections.map((item) => (
              <button className="grid w-full grid-cols-[1fr_1fr_1fr] border-t border-[#e3ebe3] px-3 py-3 text-left text-sm hover:bg-[#f8fbf7]" key={item.id} onClick={() => setSelected(item)} type="button">
                <span className="font-bold">{item.issue}<span className="block text-xs font-normal text-[#64748b]">{item.parcel}</span></span>
                <span>{Math.round(item.confidence * 100)}%</span>
                <span className="text-xs text-[#2563eb]">{item.status}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AiShell>
  );
}

export function AiProcessPlanPage() {
  const [generated, setGenerated] = useState(false);

  return (
    <AiShell active="plan">
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#16a34a]">AI-W03 · Duyệt kế hoạch quy trình</p>
            <h2 className="mt-1 text-lg font-extrabold">Tạo quy trình canh tác từ AI</h2>
            <p className="mt-2 text-sm text-[#64748b]">AI chỉ tạo bản nháp. Người quản lý phải duyệt hoặc chỉnh sửa trước khi gửi sang dịch vụ quy trình.</p>
          </div>
          <span className="rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3 py-1 text-xs font-bold text-[#c2410c]">Không tự động áp dụng</span>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1fr_180px_170px] gap-3 max-xl:grid-cols-2">
          <SelectField label="Thửa đất" options={['P-HCM-001 - Rau Củ Chi', 'P-LA-032 - Lúa Long An', 'P-DN-018 - Sầu riêng Đồng Nai']} />
          <SelectField label="Cây trồng" options={['Rau ăn lá', 'Lúa ST25', 'Sầu riêng']} />
          <label className="text-xs font-bold">
            Ngày trồng
            <input className="mt-2 h-10 w-full rounded-lg border border-[#d4ded4] px-3 text-sm" type="date" />
          </label>
          <button className="mt-6 h-10 rounded-lg bg-[#16a34a] text-sm font-bold text-white" onClick={() => setGenerated(true)} type="button">
            Tạo quy trình
          </button>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] gap-5 max-xl:grid-cols-1">
        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold">Bản nháp AI đề xuất</h3>
          {!generated ? (
            <EmptyState title="Chưa tạo quy trình" description="Chọn thửa, cây trồng và ngày trồng rồi bấm Tạo quy trình để AI sinh giai đoạn và công việc tương ứng." />
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#e3ebe3]">
              <div className="grid grid-cols-[180px_140px_1fr_190px] bg-[#f1f5f9] px-4 py-3 text-xs font-bold text-[#475569]">
                <span>Giai đoạn</span>
                <span>Mốc ngày</span>
                <span>Công việc sinh ra</span>
                <span>Vật tư khuyến nghị</span>
              </div>
              {planStages.map((stage) => (
                <div className="grid grid-cols-[180px_140px_1fr_190px] border-t border-[#e3ebe3] px-4 py-4 text-sm" key={stage.name}>
                  <input className="h-9 rounded-lg border border-[#d4ded4] px-3 font-bold" defaultValue={stage.name} />
                  <span className="pt-2 text-[#64748b]">{stage.offset}</span>
                  <ul className="grid gap-1">
                    {stage.tasks.map((task) => <li key={task}>• {task}</li>)}
                  </ul>
                  <span className="font-bold text-[#15803d]">{stage.input}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
            <h3 className="text-base font-extrabold">Giải thích của AI</h3>
            <p className="mt-3 text-sm leading-6 text-[#475569]">
              Quy trình được đề xuất dựa trên loại cây, lịch sử vụ tương tự, thời tiết gần đây, nhật ký canh tác và yêu cầu VietGAP trong kho tri thức truy xuất.
            </p>
          </section>
          <section className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-5">
            <h3 className="text-base font-extrabold text-[#15803d]">Kiểm duyệt bắt buộc</h3>
            <p className="mt-2 text-sm leading-6 text-[#166534]">Bấm duyệt chỉ tạo quy trình canh tác ở trạng thái nháp để người quản lý tiếp tục kiểm tra.</p>
            <div className="mt-4 flex gap-2">
              <button className="h-10 flex-1 rounded-lg border border-[#d4ded4] text-sm font-bold" type="button">Từ chối</button>
              <button className="h-10 flex-1 rounded-lg bg-[#16a34a] text-sm font-bold text-white" type="button">Duyệt & tạo nháp</button>
            </div>
          </section>
        </aside>
      </div>
    </AiShell>
  );
}

export function AiYieldForecastPage() {
  const maxForecast = Math.max(...forecasts.map((item) => item.forecast));

  return (
    <AiShell active="forecast">
      <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#16a34a]">AI-W04 · Dự báo sản lượng</p>
            <h2 className="mt-1 text-lg font-extrabold">Dự báo sản lượng theo thửa</h2>
            <p className="mt-2 text-sm text-[#64748b]">Dựa trên cây trồng, diện tích, lịch sử sản lượng, thời tiết và NDVI. Cập nhật hàng tuần bởi tác vụ nền.</p>
          </div>
          <span className="rounded-full border border-[#bae6fd] bg-[#f0f9ff] px-3 py-1 text-xs font-bold text-[#0369a1]">Cập nhật: 04/05/2026 06:00</span>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3 max-xl:grid-cols-2">
          <SelectField label="Khu vực" options={['Tất cả khu vực', 'Long An', 'Củ Chi', 'Đồng Nai']} />
          <SelectField label="Cây trồng" options={['Tất cả cây trồng', 'Lúa', 'Rau', 'Sầu riêng']} />
          <SelectField label="Mùa vụ" options={['Vụ hiện tại', 'Vụ Đông Xuân 2026', 'Vụ Hè Thu 2026']} />
          <SelectField label="Nguồn dữ liệu" options={['Công thức giai đoạn 1', 'Mô hình học máy giai đoạn 3']} />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] gap-5 max-xl:grid-cols-1">
        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold">Biểu đồ sản lượng dự kiến</h3>
          <div className="mt-5 grid gap-5">
            {forecasts.map((item) => (
              <div className="grid grid-cols-[150px_1fr_90px] items-center gap-4" key={item.parcel}>
                <div>
                  <p className="text-sm font-bold">{item.parcel}</p>
                  <p className="text-xs text-[#64748b]">{item.crop}</p>
                </div>
                <div className="relative h-11 rounded-lg bg-[#eef2f7]">
                  <div className="h-11 rounded-lg bg-[#16a34a]" style={{ width: `${(item.forecast / maxForecast) * 100}%` }} />
                  <div className="absolute inset-y-0 flex items-center pl-3 text-xs font-bold text-white">{formatKg(item.forecast)}</div>
                </div>
                <p className={`text-sm font-extrabold ${item.delta.startsWith('+') ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>{item.delta}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold">Ghi chú mô hình</h3>
          <div className="mt-4 grid gap-3">
            <InfoRow label="Giai đoạn" value="Giai đoạn 1" />
            <InfoRow label="Cách tính" value="Công thức theo lịch sử + NDVI" />
            <InfoRow label="Độ tin cậy" value="Khoảng dự báo theo từng thửa" />
            <InfoRow label="Giai đoạn 3" value="Huấn luyện mô hình học máy từ dữ liệu lịch sử" />
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <h3 className="text-base font-extrabold">Bảng dự báo</h3>
        <div className="mt-4 overflow-hidden rounded-xl border border-[#e3ebe3]">
          <div className="grid grid-cols-[1fr_1fr_100px_140px_180px_140px] bg-[#f1f5f9] px-4 py-3 text-xs font-bold text-[#475569]">
            <span>Thửa</span><span>Cây trồng</span><span>Diện tích</span><span>Dự báo</span><span>Khoảng tin cậy</span><span>So với vụ trước</span>
          </div>
          {forecasts.map((item) => (
            <div className="grid grid-cols-[1fr_1fr_100px_140px_180px_140px] border-t border-[#e3ebe3] px-4 py-3 text-sm" key={item.parcel}>
              <span className="font-bold">{item.parcel}</span><span>{item.crop}</span><span>{item.area} ha</span><span className="font-bold">{formatKg(item.forecast)}</span><span>{formatKg(item.low)} - {formatKg(item.high)}</span><span>{item.delta}</span>
            </div>
          ))}
        </div>
      </section>
    </AiShell>
  );
}

export function AiUsagePage() {
  return (
    <AiShell active="usage">
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2">
        <MetricCard label="Yêu cầu hôm nay" value="126" tone="green" />
        <MetricCard label="Đơn vị xử lý đã dùng" value="318.4K" tone="blue" />
        <MetricCard label="Phản hồi trung bình" value="4.2s" tone="amber" />
        <MetricCard label="Tỷ lệ lỗi" value="1.8%" tone="red" />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_420px] gap-5 max-xl:grid-cols-1">
        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-[#16a34a]">AI-W05 · Theo dõi sử dụng</p>
          <h2 className="mt-1 text-lg font-extrabold">Lưu lượng theo ca sử dụng</h2>
          <div className="mt-5 grid gap-4">
            {[
              ['Trợ lý hội thoại', 48, '#16a34a'],
              ['Nhận diện sâu bệnh', 22, '#f59e0b'],
              ['Tạo quy trình', 18, '#2563eb'],
              ['Dự báo sản lượng', 12, '#8b5cf6'],
            ].map(([label, value, color]) => (
              <div className="grid grid-cols-[170px_1fr_50px] items-center gap-3" key={label}>
                <span className="text-sm font-bold">{label}</span>
                <div className="h-3 rounded-full bg-[#eef2f7]">
                  <div className="h-3 rounded-full" style={{ width: `${value}%`, backgroundColor: String(color) }} />
                </div>
                <span className="text-sm font-bold">{value}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold">Chi phí ước tính</h2>
          <p className="mt-2 text-3xl font-extrabold text-[#16a34a]">1,84 đô la Mỹ</p>
          <p className="mt-1 text-sm text-[#64748b]">Tính theo đơn vị xử lý sử dụng bởi các mô hình AI trong không gian làm việc hiện tại.</p>
          <div className="mt-5 grid gap-3">
            <InfoRow label="Mô hình ngôn ngữ" value="184.000 đơn vị xử lý" />
            <InfoRow label="Mô hình thị giác" value="68 lượt ảnh" />
            <InfoRow label="Mẫu lời nhắc" value="Có quản lý phiên bản trong CSDL" />
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
        <h3 className="text-base font-extrabold">Top người dùng và giới hạn</h3>
        <div className="mt-4 overflow-hidden rounded-xl border border-[#e3ebe3]">
          <div className="grid grid-cols-[1fr_1fr_120px_140px_160px] bg-[#f1f5f9] px-4 py-3 text-xs font-bold text-[#475569]">
            <span>Người dùng</span><span>Vai trò</span><span>Yêu cầu</span><span>Đơn vị xử lý</span><span>Giới hạn lượt</span>
          </div>
          {usageRows.map((item) => (
            <div className="grid grid-cols-[1fr_1fr_120px_140px_160px] border-t border-[#e3ebe3] px-4 py-3 text-sm" key={item.user}>
              <span className="font-bold">{item.user}</span><span>{item.role}</span><span>{item.requests}</span><span>{item.tokens}</span><span className="text-[#15803d]">{item.limited}</span>
            </div>
          ))}
        </div>
      </section>
    </AiShell>
  );
}

function ConfidenceBadge({ value, tone }: { value: number; tone: ConfidenceTone }) {
  const className = {
    good: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
    warn: 'border-[#fde68a] bg-[#fffbeb] text-[#b45309]',
    danger: 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]',
  }[tone];

  return <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${className}`}>{Math.round(value * 100)}% tin cậy</span>;
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-8 text-center">
      <FileText className="mx-auto text-[#94a3b8]" size={32} />
      <p className="mt-3 text-sm font-extrabold">{title}</p>
      <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-[#64748b]">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'blue' | 'amber' | 'red' }) {
  const colors = {
    green: 'bg-[#dcfce7] text-[#16a34a]',
    blue: 'bg-[#dbeafe] text-[#2563eb]',
    amber: 'bg-[#fef3c7] text-[#b45309]',
    red: 'bg-[#fee2e2] text-[#dc2626]',
  };

  return (
    <article className="rounded-xl border border-[#dce7dc] bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}>
        <Bot size={20} />
      </div>
      <p className="mt-4 text-sm text-[#64748b]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e3ebe3] pb-3 last:border-b-0">
      <span className="text-sm text-[#64748b]">{label}</span>
      <span className="text-right text-sm font-extrabold">{value}</span>
    </div>
  );
}

function formatKg(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} kg`;
}
