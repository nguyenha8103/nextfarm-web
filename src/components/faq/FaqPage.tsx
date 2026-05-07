'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Eye,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { getUserRole, type UserRole } from '@/components/layout/moduleNavigation';

type FaqItem = {
  id: string;
  question: string;
  category: string;
  summary: string;
  answer: string;
  updatedAt: string;
  views: number;
  tags: string[];
  published: boolean;
};

const storageKey = 'nextfarm:faqItems:v1';

const initialFaqs: FaqItem[] = [
  {
    id: 'tao-mua-vu-moi',
    question: 'Làm thế nào để tạo mùa vụ mới?',
    category: 'Mùa vụ',
    summary: 'Chọn vùng canh tác, cây trồng, ngày trồng và template quy trình phù hợp.',
    answer:
      'Để tạo mùa vụ mới, vào module Mùa vụ, chọn Tạo mùa vụ, nhập thông tin vùng canh tác, cây trồng, người phụ trách và ngày trồng. Sau khi chọn template quy trình, hệ thống sẽ sinh các giai đoạn và công việc tương ứng.',
    updatedAt: '06/05/2026',
    views: 342,
    tags: ['Mùa vụ', 'Quy trình', 'Template'],
    published: true,
  },
  {
    id: 'cap-nhat-thiet-bi-offline',
    question: 'Khi thiết bị IoT offline thì cần kiểm tra gì?',
    category: 'IoT',
    summary: 'Kiểm tra heartbeat, gateway, nguồn điện, topic MQTT và thời điểm dữ liệu gần nhất.',
    answer:
      'Thiết bị được xem là offline khi không có dữ liệu mới quá 5 phút. Cần kiểm tra nguồn điện, kết nối gateway, MQTT topic, serial thiết bị và thời điểm dữ liệu cuối cùng trong màn chi tiết thiết bị.',
    updatedAt: '05/05/2026',
    views: 218,
    tags: ['IoT', 'Gateway', 'Offline'],
    published: true,
  },
  {
    id: 'phan-quyen-nguoi-dung',
    question: 'Ai có quyền thêm, sửa, xóa người dùng trong IAM?',
    category: 'Quản trị',
    summary: 'Quyền thao tác phụ thuộc vào role trong workspace và nhóm quyền được gán.',
    answer:
      'Trong IAM, owner và admin có thể quản lý người dùng, nhóm quyền và chi nhánh. Farm manager chỉ được xem hoặc thao tác các chức năng được cấp quyền. Field worker thường chỉ có quyền xem các phần liên quan đến công việc được phân công.',
    updatedAt: '04/05/2026',
    views: 191,
    tags: ['IAM', 'Phân quyền', 'Workspace'],
    published: true,
  },
  {
    id: 'tao-ma-qr-truy-xuat',
    question: 'Cần dữ liệu nào để tạo mã QR truy xuất nguồn gốc?',
    category: 'Thu hoạch',
    summary: 'Cần dữ liệu thửa đất, mùa vụ, nhật ký canh tác, thu hoạch, vật tư và chứng nhận.',
    answer:
      'Mã QR truy xuất được tạo từ TraceBundle. Dữ liệu cần có gồm vị trí thửa, thông tin nông dân, giai đoạn quy trình đã hoàn thành, vật tư sử dụng, chứng nhận và bản ghi thu hoạch đã xác nhận.',
    updatedAt: '03/05/2026',
    views: 287,
    tags: ['QR', 'TraceBundle', 'Thu hoạch'],
    published: true,
  },
  {
    id: 'xem-bao-cao-tai-xuong',
    question: 'Xem chi tiết báo cáo và tải xuống ở đâu?',
    category: 'Báo cáo',
    summary: 'Vào module Báo cáo, chọn loại báo cáo rồi bấm Xem báo cáo để mở chi tiết.',
    answer:
      'Trong module Báo cáo, chọn loại báo cáo cần xem. Khi bấm Xem báo cáo, hệ thống hiển thị chi tiết báo cáo và nút Tải xuống trong màn chi tiết thay vì tách thành tab riêng.',
    updatedAt: '02/05/2026',
    views: 156,
    tags: ['Báo cáo', 'Tải xuống'],
    published: true,
  },
];

const categoryOptions = ['Mùa vụ', 'IoT', 'Quản trị', 'Thu hoạch', 'Báo cáo', 'Marketplace'];

function loadFaqs() {
  if (typeof window === 'undefined') return initialFaqs;

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as FaqItem[];
    return saved.length ? saved : initialFaqs;
  } catch {
    return initialFaqs;
  }
}

function saveFaqs(faqs: FaqItem[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(faqs));
}

function canCreate(role: UserRole) {
  return role === 'owner' || role === 'admin' || role === 'farm_manager';
}

function canEdit(role: UserRole) {
  return role === 'owner' || role === 'admin' || role === 'farm_manager';
}

function canDelete(role: UserRole) {
  return role === 'owner' || role === 'admin';
}

function createId(question: string) {
  return (
    question
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `faq-${Date.now()}`
  );
}

export function FaqPage() {
  const [role, setRole] = useState<UserRole>('owner');
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deleteFaq, setDeleteFaq] = useState<FaqItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setRole(getUserRole());
    setFaqs(loadFaqs());
  }, []);

  const categories = useMemo(() => ['Tất cả', ...Array.from(new Set(faqs.map((faq) => faq.category)))], [faqs]);

  const filteredFaqs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchKeyword =
        !keyword ||
        faq.question.toLowerCase().includes(keyword) ||
        faq.summary.toLowerCase().includes(keyword) ||
        faq.tags.some((tagItem) => tagItem.toLowerCase().includes(keyword));
      const matchCategory = category === 'Tất cả' || faq.category === category;

      return matchKeyword && matchCategory;
    });
  }, [category, faqs, search]);

  function persist(nextFaqs: FaqItem[]) {
    setFaqs(nextFaqs);
    saveFaqs(nextFaqs);
  }

  function upsertFaq(faq: FaqItem) {
    const exists = faqs.some((item) => item.id === faq.id);
    const nextFaqs = exists ? faqs.map((item) => (item.id === faq.id ? faq : item)) : [faq, ...faqs];

    persist(nextFaqs);
    setCreateOpen(false);
    setEditingFaq(null);
    setSelectedFaq(faq);
  }

  function removeFaq(faqId: string) {
    persist(faqs.filter((faq) => faq.id !== faqId));
    setDeleteFaq(null);

    if (selectedFaq?.id === faqId) setSelectedFaq(null);
  }

  function viewFaq(faq: FaqItem) {
    const nextFaq = { ...faq, views: faq.views + 1 };
    persist(faqs.map((item) => (item.id === faq.id ? nextFaq : item)));
    setSelectedFaq(nextFaq);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-slate-50 px-6 py-8 text-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">FAQ</h1>
          <p className="mt-2 text-sm text-slate-600">Câu hỏi thường gặp và hướng dẫn sử dụng hệ thống Nextfarm</p>
        </div>
        {canCreate(role) ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <Plus size={16} strokeWidth={1.5} />
            Thêm câu hỏi
          </button>
        ) : null}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200/60 bg-white p-3">
        <div className="flex gap-3">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              value={search}
            />
          </label>
          <label className="relative w-[200px]">
            <select
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} strokeWidth={1.5} />
          </label>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200/60 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Danh sách câu hỏi</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{filteredFaqs.length} câu hỏi</span>
          </div>
          <div className="mt-4 grid gap-3">
            {filteredFaqs.length ? (
              filteredFaqs.map((faq) => (
                <article className="rounded-xl border border-slate-200/60 p-4 transition-all duration-150 hover:border-slate-300" key={faq.id}>
                  <div className="flex items-start justify-between gap-4">
                    <button className="min-w-0 flex-1 text-left" onClick={() => viewFaq(faq)} type="button">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{faq.category}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${faq.published ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
                          {faq.published ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold leading-6 text-slate-900">{faq.question}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{faq.summary}</p>
                    </button>
                    <div className="flex shrink-0 gap-2">
                      {canEdit(role) ? (
                        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setEditingFaq(faq)} type="button">
                          <Pencil size={15} strokeWidth={1.5} />
                        </button>
                      ) : null}
                      {canDelete(role) ? (
                        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" onClick={() => setDeleteFaq(faq)} type="button">
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={13} strokeWidth={1.5} />{faq.updatedAt}</span>
                      <span className="inline-flex items-center gap-1"><Eye size={13} strokeWidth={1.5} />{faq.views} lượt xem</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {faq.tags.slice(0, 3).map((tag) => (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600" key={tag}>
                          <Tag size={11} strokeWidth={1.5} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-slate-200/60 bg-slate-50 text-center">
                <CircleHelp className="text-slate-400" size={52} strokeWidth={1.5} />
                <h3 className="mt-3 text-lg font-semibold">Chưa có câu hỏi</h3>
                <p className="mt-2 text-sm text-slate-500">Câu hỏi phù hợp bộ lọc sẽ hiển thị tại đây.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="grid h-fit gap-4">
          <section className="rounded-xl border border-slate-200/60 bg-white p-5">
            <h2 className="text-lg font-semibold">Danh mục phổ biến</h2>
            <div className="mt-4 grid gap-2">
              {categories.filter((item) => item !== 'Tất cả').map((item) => (
                <button className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100" key={item} onClick={() => setCategory(item)} type="button">
                  <span className="text-slate-700">{item}</span>
                  <span className="font-medium text-slate-900">{faqs.filter((faq) => faq.category === item).length}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-slate-200/60 bg-white p-5">
            <h2 className="text-lg font-semibold">Câu hỏi xem nhiều</h2>
            <div className="mt-4 grid gap-3">
              {[...faqs].sort((a, b) => b.views - a.views).slice(0, 3).map((faq) => (
                <button className="rounded-lg border border-slate-200/60 p-3 text-left hover:bg-slate-50" key={faq.id} onClick={() => viewFaq(faq)} type="button">
                  <p className="line-clamp-2 text-sm font-medium text-slate-900">{faq.question}</p>
                  <p className="mt-1 text-xs text-slate-500">{faq.views} lượt xem</p>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {selectedFaq ? (
        <FaqDetailModal
          canDelete={canDelete(role)}
          canEdit={canEdit(role)}
          faq={selectedFaq}
          onClose={() => setSelectedFaq(null)}
          onDelete={() => setDeleteFaq(selectedFaq)}
          onEdit={() => setEditingFaq(selectedFaq)}
        />
      ) : null}
      {createOpen ? <FaqFormModal onClose={() => setCreateOpen(false)} onSave={upsertFaq} /> : null}
      {editingFaq ? <FaqFormModal faq={editingFaq} onClose={() => setEditingFaq(null)} onSave={upsertFaq} /> : null}
      {deleteFaq ? <DeleteFaqModal faq={deleteFaq} onClose={() => setDeleteFaq(null)} onDelete={() => removeFaq(deleteFaq.id)} /> : null}
    </section>
  );
}

function FaqDetailModal({
  canDelete: allowDelete,
  canEdit: allowEdit,
  faq,
  onClose,
  onDelete,
  onEdit,
}: {
  canDelete: boolean;
  canEdit: boolean;
  faq: FaqItem;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-6">
      <section className="max-h-[84vh] w-full max-w-[640px] overflow-auto rounded-2xl border border-slate-200/60 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{faq.category}</span>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight">{faq.question}</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1"><CalendarDays size={15} strokeWidth={1.5} />{faq.updatedAt}</span>
            <span className="inline-flex items-center gap-1"><Eye size={15} strokeWidth={1.5} />{faq.views} lượt xem</span>
          </div>
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{faq.answer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {faq.tags.map((tag) => (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600" key={tag}>
                <Tag size={11} strokeWidth={1.5} />
                {tag}
              </span>
            ))}
          </div>
        </div>
        {allowEdit || allowDelete ? (
          <div className="flex justify-end gap-2 border-t border-slate-200/60 px-6 py-4">
            {allowEdit ? <ActionButton icon={<Pencil size={15} strokeWidth={1.5} />} label="Sửa" onClick={onEdit} /> : null}
            {allowDelete ? <ActionButton danger icon={<Trash2 size={15} strokeWidth={1.5} />} label="Xóa" onClick={onDelete} /> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function FaqFormModal({ faq, onClose, onSave }: { faq?: FaqItem; onClose: () => void; onSave: (faq: FaqItem) => void }) {
  const [question, setQuestion] = useState(faq?.question ?? '');
  const [category, setCategory] = useState(faq?.category ?? 'Mùa vụ');
  const [summary, setSummary] = useState(faq?.summary ?? '');
  const [answer, setAnswer] = useState(faq?.answer ?? '');
  const [tags, setTags] = useState(faq?.tags.join(', ') ?? '');
  const [published, setPublished] = useState(faq?.published ?? true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-6">
      <section className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-slate-200/60 px-5">
          <h2 className="text-lg font-semibold">{faq ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <form
          className="grid gap-3 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const nextQuestion = question.trim();
            if (!nextQuestion) return;

            onSave({
              id: faq?.id ?? createId(nextQuestion),
              question: nextQuestion,
              category,
              summary: summary.trim(),
              answer: answer.trim(),
              updatedAt: new Intl.DateTimeFormat('vi-VN').format(new Date()),
              views: faq?.views ?? 0,
              tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
              published,
            });
          }}
        >
          <Field label="Câu hỏi"><input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" onChange={(event) => setQuestion(event.target.value)} value={question} /></Field>
          <Field label="Danh mục"><select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" onChange={(event) => setCategory(event.target.value)} value={category}>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Mô tả ngắn"><textarea className="min-h-16 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" onChange={(event) => setSummary(event.target.value)} value={summary} /></Field>
          <Field label="Câu trả lời"><textarea className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" onChange={(event) => setAnswer(event.target.value)} value={answer} /></Field>
          <Field label="Thẻ"><input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" onChange={(event) => setTags(event.target.value)} placeholder="Mùa vụ, IoT, Hướng dẫn" value={tags} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input checked={published} className="h-4 w-4 accent-emerald-600" onChange={(event) => setPublished(event.target.checked)} type="checkbox" />
            Xuất bản câu hỏi này
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-4">
            <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">Hủy</button>
            <button className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700" type="submit">Lưu</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return <label className="grid gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">{label}{children}</label>;
}

function ActionButton({ danger, icon, label, onClick }: { danger?: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium ${danger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`} onClick={onClick} type="button">
      {icon}
      {label}
    </button>
  );
}

function DeleteFaqModal({ faq, onClose, onDelete }: { faq: FaqItem; onClose: () => void; onDelete: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-6">
      <section className="w-full max-w-[380px] rounded-2xl border border-slate-200/60 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Xóa câu hỏi</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Bạn có chắc chắn muốn xóa câu hỏi này?</p>
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">{faq.question}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">Hủy</button>
          <button className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700" onClick={onDelete} type="button">Xóa</button>
        </div>
      </section>
    </div>
  );
}
