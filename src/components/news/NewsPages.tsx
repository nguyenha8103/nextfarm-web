'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Eye,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { getUserRole, type UserRole } from '@/components/layout/moduleNavigation';

type NewsArticle = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  views: number;
  tags: string[];
  authorRole: UserRole;
};

const storageKey = 'nextfarm:newsArticles:v2';

const initialArticles: NewsArticle[] = [
  {
    id: 'lua-ben-vung-theo-mua',
    title: 'Kỹ thuật canh tác lúa bền vững theo mùa',
    category: 'Kỹ thuật canh tác',
    excerpt:
      'Hướng dẫn chi tiết về kỹ thuật canh tác lúa bền vững, giúp nâng cao năng suất và bảo vệ môi trường...',
    content:
      'Canh tác lúa bền vững cần kết hợp chọn giống phù hợp, quản lý nước hợp lý, bón phân cân đối và theo dõi sâu bệnh theo từng giai đoạn sinh trưởng. Nông trại nên ghi nhận nhật ký canh tác đầy đủ để đánh giá hiệu quả sau mỗi mùa vụ.',
    date: '15/1/2024',
    views: 245,
    tags: ['Lúa', 'Kỹ thuật', 'Bền vững'],
    authorRole: 'admin',
  },
  {
    id: 'chinh-sach-ho-tro-nong-dan-2024',
    title: 'Chính sách hỗ trợ nông dân năm 2024',
    category: 'Chính sách',
    excerpt: 'Tổng hợp các chính sách hỗ trợ mới nhất dành cho nông dân trong năm 2024...',
    content:
      'Các chính sách hỗ trợ tập trung vào tín dụng nông nghiệp, chuyển đổi số, truy xuất nguồn gốc và khuyến khích áp dụng quy trình sản xuất an toàn. Quản lý nông trại cần theo dõi điều kiện áp dụng theo từng địa phương.',
    date: '10/1/2024',
    views: 189,
    tags: ['Chính sách', 'Hỗ trợ'],
    authorRole: 'owner',
  },
  {
    id: 'phong-tru-sau-benh-hai-lua',
    title: 'Phòng trừ sâu bệnh hại trên cây lúa',
    category: 'Bảo vệ thực vật',
    excerpt: 'Các biện pháp phòng trừ hiệu quả các loại sâu bệnh hại thường gặp trên cây lúa...',
    content:
      'Phòng trừ sâu bệnh cần ưu tiên theo dõi sớm, khoanh vùng rủi ro và áp dụng biện pháp sinh học trước khi dùng thuốc BVTV. Khi sử dụng thuốc, cần tuân thủ thời gian cách ly và ghi nhận vật tư vào nhật ký canh tác.',
    date: '5/1/2024',
    views: 312,
    tags: ['Sâu bệnh', 'Lúa', 'Phòng trừ'],
    authorRole: 'farm_manager',
  },
  {
    id: 'quan-ly-nuoc-cho-rau-mau',
    title: 'Quản lý nước tưới cho rau màu mùa khô',
    category: 'Kỹ thuật canh tác',
    excerpt: 'Gợi ý lịch tưới, theo dõi độ ẩm đất và giảm thất thoát nước trong mùa khô...',
    content:
      'Rau màu trong mùa khô cần lịch tưới ổn định, ưu tiên tưới nhỏ giọt hoặc phun mưa cục bộ. Dữ liệu cảm biến độ ẩm đất giúp kỹ sư nông nghiệp điều chỉnh lượng nước theo từng vùng canh tác.',
    date: '2/1/2024',
    views: 164,
    tags: ['Rau màu', 'Tưới tiêu', 'Mùa khô'],
    authorRole: 'admin',
  },
  {
    id: 'truy-xuat-nguon-goc-nong-san',
    title: 'Truy xuất nguồn gốc nông sản bằng mã QR',
    category: 'Chuyển đổi số',
    excerpt: 'Cách chuẩn hóa dữ liệu mùa vụ, thu hoạch và vật tư để tạo hồ sơ truy xuất...',
    content:
      'Truy xuất nguồn gốc hiệu quả cần dữ liệu bất biến từ mùa vụ, nhật ký canh tác, thu hoạch và chứng nhận. Mã QR giúp người mua kiểm tra thông tin thửa, nông dân, vật tư sử dụng và ngày thu hoạch.',
    date: '28/12/2023',
    views: 221,
    tags: ['Truy xuất', 'QR', 'Nông sản'],
    authorRole: 'owner',
  },
  {
    id: 'gia-vat-tu-nong-nghiep',
    title: 'Theo dõi biến động giá vật tư nông nghiệp',
    category: 'Thị trường',
    excerpt: 'Một số nhóm vật tư có biến động theo mùa, cần lập kế hoạch mua trước thời điểm cao điểm...',
    content:
      'Giá phân bón, thuốc bảo vệ thực vật và giống cây trồng thường biến động theo mùa vụ. Nông trại nên theo dõi lịch sử đơn hàng, tồn kho và kế hoạch mùa vụ để chủ động mua vật tư đúng thời điểm.',
    date: '22/12/2023',
    views: 176,
    tags: ['Thị trường', 'Vật tư', 'Kế hoạch'],
    authorRole: 'farm_manager',
  },
];

const categoryOptions = ['Kỹ thuật canh tác', 'Chính sách', 'Bảo vệ thực vật', 'Chuyển đổi số', 'Thị trường'];

function loadArticles() {
  if (typeof window === 'undefined') return initialArticles;

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as NewsArticle[];
    return saved.length ? saved : initialArticles;
  } catch {
    return initialArticles;
  }
}

function saveArticles(articles: NewsArticle[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(articles));
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

function createId(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `tin-tuc-${Date.now()}`
  );
}

export function NewsPage() {
  const [role, setRole] = useState<UserRole>('owner');
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<NewsArticle | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setRole(getUserRole());
    setArticles(loadArticles());
  }, []);

  const categories = useMemo(
    () => ['Tất cả', ...Array.from(new Set(articles.map((article) => article.category)))],
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchKeyword =
        !keyword ||
        article.title.toLowerCase().includes(keyword) ||
        article.excerpt.toLowerCase().includes(keyword) ||
        article.tags.some((tagItem) => tagItem.toLowerCase().includes(keyword));
      const matchCategory = category === 'Tất cả' || article.category === category;

      return matchKeyword && matchCategory;
    });
  }, [articles, category, search]);

  function persist(nextArticles: NewsArticle[]) {
    setArticles(nextArticles);
    saveArticles(nextArticles);
  }

  function upsertArticle(article: NewsArticle) {
    const exists = articles.some((item) => item.id === article.id);
    const nextArticles = exists
      ? articles.map((item) => (item.id === article.id ? article : item))
      : [article, ...articles];

    persist(nextArticles);
    setCreateOpen(false);
    setEditingArticle(null);
    setSelectedArticle(article);
  }

  function removeArticle(articleId: string) {
    persist(articles.filter((article) => article.id !== articleId));
    setDeleteArticle(null);

    if (selectedArticle?.id === articleId) setSelectedArticle(null);
  }

  function viewArticle(article: NewsArticle) {
    const nextArticle = { ...article, views: article.views + 1 };
    persist(articles.map((item) => (item.id === article.id ? nextArticle : item)));
    setSelectedArticle(nextArticle);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-slate-50 px-6 py-8 text-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tin tức</h1>
          <p className="mt-2 text-sm text-slate-600">Cập nhật tin tức và kiến thức nông nghiệp</p>
        </div>
        {canCreate(role) ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <Plus size={16} strokeWidth={1.5} />
            Thêm tin tức
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
              placeholder="Tìm kiếm tin tức..."
              value={search}
            />
          </label>
          <label className="relative w-[180px]">
            <select
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
              strokeWidth={1.5}
            />
          </label>
        </div>
      </div>

      {filteredArticles.length ? (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <article
              className="overflow-hidden rounded-xl border border-slate-200/60 bg-white transition-all duration-150 hover:border-slate-300"
              key={article.id}
            >
              <button className="block w-full text-left" onClick={() => viewArticle(article)} type="button">
                <div className="flex h-[154px] items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <Newspaper className="text-slate-400" size={44} strokeWidth={1.5} />
                </div>
                <div className="p-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {article.category}
                  </span>
                  <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-slate-900">{article.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{article.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} strokeWidth={1.5} />
                      {article.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} strokeWidth={1.5} />
                      {article.views} lượt xem
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                        key={tag}
                      >
                        <Tag size={11} strokeWidth={1.5} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
              {canEdit(role) || canDelete(role) ? (
                <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 px-4 py-3">
                  {canEdit(role) ? (
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setEditingArticle(article)}
                      type="button"
                    >
                      <Pencil size={13} strokeWidth={1.5} />
                      Sửa
                    </button>
                  ) : null}
                  {canDelete(role) ? (
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteArticle(article)}
                      type="button"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                      Xóa
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-slate-200/60 bg-white text-center">
          <Newspaper className="text-slate-400" size={52} strokeWidth={1.5} />
          <h2 className="mt-3 text-lg font-semibold">Chưa có tin tức</h2>
          <p className="mt-2 text-sm text-slate-500">Tin tức phù hợp bộ lọc sẽ hiển thị tại đây.</p>
        </div>
      )}

      {selectedArticle ? (
        <ArticleDetailModal
          article={selectedArticle}
          canDelete={canDelete(role)}
          canEdit={canEdit(role)}
          onClose={() => setSelectedArticle(null)}
          onDelete={() => setDeleteArticle(selectedArticle)}
          onEdit={() => setEditingArticle(selectedArticle)}
        />
      ) : null}

      {createOpen ? <ArticleFormModal authorRole={role} onClose={() => setCreateOpen(false)} onSave={upsertArticle} /> : null}

      {editingArticle ? (
        <ArticleFormModal article={editingArticle} authorRole={role} onClose={() => setEditingArticle(null)} onSave={upsertArticle} />
      ) : null}

      {deleteArticle ? (
        <DeleteArticleModal article={deleteArticle} onClose={() => setDeleteArticle(null)} onDelete={() => removeArticle(deleteArticle.id)} />
      ) : null}
    </section>
  );
}

function ArticleDetailModal({
  article,
  canDelete: allowDelete,
  canEdit: allowEdit,
  onClose,
  onDelete,
  onEdit,
}: {
  article: NewsArticle;
  canDelete: boolean;
  canEdit: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-6">
      <section className="max-h-[84vh] w-full max-w-[640px] overflow-auto rounded-2xl border border-slate-200/60 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {article.category}
          </span>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex h-[160px] items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
            <Newspaper className="text-slate-400" size={52} strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">{article.title}</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={15} strokeWidth={1.5} />
              {article.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={15} strokeWidth={1.5} />
              {article.views} lượt xem
            </span>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-700">{article.content}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600" key={tag}>
                <Tag size={11} strokeWidth={1.5} />
                {tag}
              </span>
            ))}
          </div>
        </div>
        {allowEdit || allowDelete ? (
          <div className="flex justify-end gap-2 border-t border-slate-200/60 px-6 py-4">
            {allowEdit ? (
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onEdit} type="button">
                <Pencil size={15} strokeWidth={1.5} />
                Sửa
              </button>
            ) : null}
            {allowDelete ? (
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50" onClick={onDelete} type="button">
                <Trash2 size={15} strokeWidth={1.5} />
                Xóa
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ArticleFormModal({
  article,
  authorRole,
  onClose,
  onSave,
}: {
  article?: NewsArticle;
  authorRole: UserRole;
  onClose: () => void;
  onSave: (article: NewsArticle) => void;
}) {
  const [title, setTitle] = useState(article?.title ?? '');
  const [category, setCategory] = useState(article?.category ?? 'Kỹ thuật canh tác');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [content, setContent] = useState(article?.content ?? '');
  const [tags, setTags] = useState(article?.tags.join(', ') ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-6">
      <section className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-slate-200/60 px-5">
          <h2 className="text-lg font-semibold">{article ? 'Sửa tin tức' : 'Thêm tin tức'}</h2>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <form
          className="grid gap-3 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const nextTitle = title.trim();
            if (!nextTitle) return;

            onSave({
              id: article?.id ?? createId(nextTitle),
              title: nextTitle,
              category,
              excerpt: excerpt.trim(),
              content: content.trim(),
              date: article?.date ?? new Intl.DateTimeFormat('vi-VN').format(new Date()),
              views: article?.views ?? 0,
              tags: tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
              authorRole,
            });
          }}
        >
          <Field label="Tiêu đề">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </Field>
          <Field label="Danh mục">
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {categoryOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Mô tả ngắn">
            <textarea
              className="min-h-16 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setExcerpt(event.target.value)}
              value={excerpt}
            />
          </Field>
          <Field label="Nội dung">
            <textarea
              className="min-h-20 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setContent(event.target.value)}
              value={content}
            />
          </Field>
          <Field label="Thẻ">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setTags(event.target.value)}
              placeholder="Lúa, Kỹ thuật, Bền vững"
              value={tags}
            />
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-4">
            <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">
              Hủy
            </button>
            <button className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700" type="submit">
              Lưu
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeleteArticleModal({ article, onClose, onDelete }: { article: NewsArticle; onClose: () => void; onDelete: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-6">
      <section className="w-full max-w-[380px] rounded-2xl border border-slate-200/60 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Xóa tin tức</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Bạn có chắc chắn muốn xóa tin tức này?</p>
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">{article.title}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">
            Hủy
          </button>
          <button className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700" onClick={onDelete} type="button">
            Xóa
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-xs font-medium uppercase tracking-wider text-slate-600">
      {label}
      {children}
    </label>
  );
}
