'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react';
import { getUserRole, type UserRole } from '@/components/layout/moduleNavigation';

type ForumPost = {
  id: string;
  author: string;
  avatar: string;
  location: string;
  timeAgo: string;
  category: string;
  content: string;
  imageUrl?: string;
  reactions: number;
  comments: number;
  shares: number;
  tags: string[];
  commentItems: ForumComment[];
};

type ForumComment = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
};

const storageKey = 'nextfarm:forumPosts:v2';

const defaultImage =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80';

const initialPosts: ForumPost[] = [
  {
    id: 'thu-hoach-lua-he-thu',
    author: 'Nguyễn Văn A',
    avatar: 'N',
    location: 'An Giang',
    timeAgo: '2 giờ trước',
    category: 'Chia sẻ kinh nghiệm',
    content:
      'Vừa thu hoạch xong vụ lúa Hè Thu! Năng suất năm nay khá tốt, đạt 6.2 tấn/ha. Cảm ơn các bác trong diễn đàn đã tư vấn về kỹ thuật bón phân và chăm sóc. Năm sau mình sẽ tiếp tục áp dụng!',
    imageUrl: defaultImage,
    reactions: 45,
    comments: 12,
    shares: 3,
    tags: ['Lúa', 'Thu hoạch', 'Kinh nghiệm'],
    commentItems: [
      {
        id: 'comment-1',
        author: 'Trần Thị Bình',
        avatar: 'T',
        content: 'Chúc mừng anh, năng suất rất tốt. Anh chia sẻ thêm lịch bón phân được không?',
        timeAgo: '1 giờ trước',
      },
    ],
  },
  {
    id: 'hoi-dap-vang-la',
    author: 'Trần Thị Bình',
    avatar: 'T',
    location: 'Đồng Nai',
    timeAgo: '5 giờ trước',
    category: 'Hỏi đáp',
    content:
      'Rau ăn lá sau mưa lớn bị vàng nhẹ ở mép lá. Mình nên kiểm tra pH đất trước hay bổ sung dinh dưỡng trước? Nhờ mọi người góp ý cách xử lý an toàn.',
    reactions: 18,
    comments: 7,
    shares: 1,
    tags: ['Rau ăn lá', 'Vàng lá', 'Sau mưa'],
    commentItems: [],
  },
  {
    id: 'cong-nghe-tuoi-nho-giot',
    author: 'Lê Văn Công',
    avatar: 'L',
    location: 'Long An',
    timeAgo: 'Hôm qua',
    category: 'Công nghệ mới',
    content:
      'Mình mới thử hệ thống tưới nhỏ giọt kết hợp cảm biến độ ẩm đất. Lượng nước giảm rõ nhưng cây vẫn phát triển ổn định. Anh em nào dùng rồi cho mình xin thêm kinh nghiệm tối ưu lịch tưới.',
    reactions: 32,
    comments: 9,
    shares: 4,
    tags: ['IoT', 'Tưới tiêu', 'Cảm biến'],
    commentItems: [],
  },
];

const categories = ['Tất cả', 'Kỹ thuật canh tác', 'Công nghệ mới', 'Thị trường', 'Hỏi đáp', 'Chia sẻ kinh nghiệm'];
const currentForumUser = {
  author: 'Admin Nextfarm',
  avatar: 'A',
  location: 'HTX Nông nghiệp Bình Điền',
};

function loadPosts() {
  if (typeof window === 'undefined') return initialPosts;

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as ForumPost[];
    return saved.length ? saved.map(normalizePost) : initialPosts;
  } catch {
    return initialPosts;
  }
}

function normalizePost(post: ForumPost) {
  return {
    ...post,
    commentItems: post.commentItems ?? [],
    comments: Math.max(post.comments ?? 0, post.commentItems?.length ?? 0),
  };
}

function savePosts(posts: ForumPost[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(posts));
}

function canCreate(role: UserRole) {
  return role === 'owner' || role === 'admin' || role === 'farm_manager';
}

function isOwnPost(post: ForumPost) {
  return post.author === currentForumUser.author;
}

function createId(content: string) {
  return (
    content
      .trim()
      .slice(0, 48)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `bai-viet-${Date.now()}`
  );
}

export function ForumPage() {
  const [role, setRole] = useState<UserRole>('owner');
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [category, setCategory] = useState('Tất cả');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [deletePost, setDeletePost] = useState<ForumPost | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState('Chia sẻ kinh nghiệm');

  useEffect(() => {
    setRole(getUserRole());
    setPosts(loadPosts());
  }, []);

  const filteredPosts = useMemo(() => {
    if (category === 'Tất cả') return posts;
    return posts.filter((post) => post.category === category);
  }, [category, posts]);

  function persist(nextPosts: ForumPost[]) {
    setPosts(nextPosts);
    savePosts(nextPosts);
  }

  function upsertPost(post: ForumPost) {
    const exists = posts.some((item) => item.id === post.id);
    if (exists && !isOwnPost(post)) return;

    const nextPosts = exists ? posts.map((item) => (item.id === post.id ? post : item)) : [post, ...posts];

    persist(nextPosts);
    setCreateOpen(false);
    setEditingPost(null);
    setSelectedPost(post);
  }

  function removePost(postId: string) {
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost || !isOwnPost(targetPost)) return;

    persist(posts.filter((post) => post.id !== postId));
    setDeletePost(null);
    if (selectedPost?.id === postId) setSelectedPost(null);
  }

  function reactPost(postId: string) {
    const nextPosts = posts.map((post) => (post.id === postId ? { ...post, reactions: post.reactions + 1 } : post));
    persist(nextPosts);
    const updatedSelected = nextPosts.find((post) => post.id === selectedPost?.id);
    if (updatedSelected) setSelectedPost(updatedSelected);
  }

  function sharePost(postId: string) {
    const nextPosts = posts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post));
    persist(nextPosts);
    const updatedSelected = nextPosts.find((post) => post.id === selectedPost?.id);
    if (updatedSelected) setSelectedPost(updatedSelected);
  }

  function addComment(postId: string, content: string) {
    const commentContent = content.trim();
    if (!commentContent) return;

    const nextPosts = posts.map((post) => {
      if (post.id !== postId) return post;

      const nextComment: ForumComment = {
        id: `comment-${Date.now()}`,
        author: 'Bạn',
        avatar: 'B',
        content: commentContent,
        timeAgo: 'Vừa xong',
      };

      return {
        ...post,
        comments: post.comments + 1,
        commentItems: [...post.commentItems, nextComment],
      };
    });

    persist(nextPosts);
    const updatedSelected = nextPosts.find((post) => post.id === selectedPost?.id);
    if (updatedSelected) setSelectedPost(updatedSelected);
  }

  function openCreate(nextCategory = 'Chia sẻ kinh nghiệm') {
    setCreateCategory(nextCategory);
    setCreateOpen(true);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-[716px]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Diễn đàn nông nghiệp</h1>
          <p className="mt-2 text-sm text-slate-600">Kết nối, chia sẻ và học hỏi cùng cộng đồng nông dân</p>
        </div>

        {canCreate(role) ? (
          <section className="mt-6 rounded-xl border border-slate-200/60 bg-white p-3">
            <div className="flex items-center gap-3">
              <Avatar label="B" className="bg-emerald-500 text-white" />
              <button
                className="h-10 flex-1 rounded-full bg-slate-50 px-4 text-left text-sm text-slate-500 transition hover:bg-slate-100"
                onClick={() => openCreate('Chia sẻ kinh nghiệm')}
                type="button"
              >
                Bạn muốn chia sẻ điều gì với cộng đồng?
              </button>
            </div>
            <div className="mt-3 flex gap-5 pl-[52px] text-sm font-medium text-slate-700">
              <button className="inline-flex items-center gap-2 hover:text-emerald-700" onClick={() => openCreate('Chia sẻ kinh nghiệm')} type="button">
                <ImageIcon size={16} strokeWidth={1.5} />
                Ảnh/Video
              </button>
              <button className="inline-flex items-center gap-2 hover:text-emerald-700" onClick={() => openCreate('Hỏi đáp')} type="button">
                <MessageCircle size={16} strokeWidth={1.5} />
                Câu hỏi
              </button>
            </div>
          </section>
        ) : null}

        <nav className="mt-5 flex flex-wrap gap-2 rounded-xl border border-slate-200/60 bg-white p-2">
          {categories.map((item) => (
            <button
              className={`h-9 rounded-lg px-4 text-sm font-medium transition ${
                category === item ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-5 grid gap-4">
          {filteredPosts.length ? (
            filteredPosts.map((post) => (
              <PostCard
                canDelete={isOwnPost(post)}
                canEdit={isOwnPost(post)}
                key={post.id}
                onDelete={() => isOwnPost(post) && setDeletePost(post)}
                onEdit={() => isOwnPost(post) && setEditingPost(post)}
                onComment={(comment) => addComment(post.id, comment)}
                onReact={() => reactPost(post.id)}
                onShare={() => sharePost(post.id)}
                onView={() => setSelectedPost(post)}
                post={post}
              />
            ))
          ) : (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-slate-200/60 bg-white text-center">
              <MessageCircle className="text-slate-400" size={48} strokeWidth={1.5} />
              <h2 className="mt-3 text-lg font-semibold">Chưa có bài viết</h2>
              <p className="mt-2 text-sm text-slate-500">Bài viết phù hợp danh mục sẽ hiển thị tại đây.</p>
            </div>
          )}
        </div>
      </div>

      {selectedPost ? (
        <PostDetailModal
          canDelete={isOwnPost(selectedPost)}
          canEdit={isOwnPost(selectedPost)}
          onClose={() => setSelectedPost(null)}
          onDelete={() => isOwnPost(selectedPost) && setDeletePost(selectedPost)}
          onEdit={() => isOwnPost(selectedPost) && setEditingPost(selectedPost)}
          onComment={(comment) => addComment(selectedPost.id, comment)}
          onReact={() => reactPost(selectedPost.id)}
          onShare={() => sharePost(selectedPost.id)}
          post={selectedPost}
        />
      ) : null}
      {createOpen ? <PostFormModal initialCategory={createCategory} onClose={() => setCreateOpen(false)} onSave={upsertPost} /> : null}
      {editingPost ? <PostFormModal onClose={() => setEditingPost(null)} onSave={upsertPost} post={editingPost} /> : null}
      {deletePost ? <DeletePostModal onClose={() => setDeletePost(null)} onDelete={() => removePost(deletePost.id)} post={deletePost} /> : null}
    </section>
  );
}

function PostCard({
  canDelete: allowDelete,
  canEdit: allowEdit,
  onComment,
  onDelete,
  onEdit,
  onReact,
  onShare,
  onView,
  post,
}: {
  canDelete: boolean;
  canEdit: boolean;
  onComment: (comment: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onReact: () => void;
  onShare: () => void;
  onView: () => void;
  post: ForumPost;
}) {
  const [comment, setComment] = useState('');

  function submitComment() {
    const nextComment = comment.trim();
    if (!nextComment) return;
    onComment(nextComment);
    setComment('');
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <button className="flex min-w-0 flex-1 items-start gap-3 text-left" onClick={onView} type="button">
          <Avatar label={post.avatar} className="bg-emerald-500 text-white" />
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">{post.author}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{post.timeAgo}</span>
              <span>•</span>
              <span>{post.location}</span>
              <span>•</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">{post.category}</span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          {(allowEdit || allowDelete) ? (
            <>
              {allowEdit ? (
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onEdit} type="button">
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
              ) : null}
              {allowDelete ? (
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50" onClick={onDelete} type="button">
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              ) : null}
            </>
          ) : null}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onView} type="button">
            <MoreHorizontal size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <button className="block w-full text-left" onClick={onView} type="button">
        <p className="px-4 pb-3 text-[15px] leading-6 text-slate-900">{post.content}</p>
        {post.imageUrl ? (
          <img alt="Bài viết diễn đàn nông nghiệp" className="h-[310px] w-full object-cover" src={post.imageUrl} />
        ) : null}
      </button>

      <div className="flex items-center justify-between border-b border-slate-200/60 px-4 py-2 text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
            <ThumbsUp size={11} strokeWidth={1.8} />
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
            <span className="text-[10px]">♥</span>
          </span>
          <span className="ml-1">{post.reactions}</span>
        </div>
        <div className="flex gap-4">
          <span>{post.comments} bình luận</span>
          <span>{post.shares} chia sẻ</span>
        </div>
      </div>

      <div className="grid grid-cols-4 border-b border-slate-200/60 text-sm font-medium text-slate-600">
        <FeedAction icon={<ThumbsUp size={16} strokeWidth={1.5} />} label="Thích" onClick={onReact} />
        <FeedAction icon={<MessageCircle size={16} strokeWidth={1.5} />} label="Bình luận" onClick={onView} />
        <FeedAction icon={<Share2 size={16} strokeWidth={1.5} />} label="Chia sẻ" onClick={onShare} />
        <FeedAction icon={<Bookmark size={16} strokeWidth={1.5} />} label="Lưu" onClick={onView} />
      </div>

      {post.commentItems.length ? (
        <div className="grid gap-3 border-b border-slate-200/60 px-4 py-3">
          {post.commentItems.slice(-2).map((item) => (
            <div className="flex items-start gap-2" key={item.id}>
              <Avatar label={item.avatar} className="h-7 w-7 bg-emerald-500 text-xs text-white" />
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.author}</p>
                  <span className="text-xs text-slate-400">{item.timeAgo}</span>
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-700">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-3 p-3">
        <Avatar label="B" className="h-7 w-7 bg-emerald-500 text-xs text-white" />
        <input
          className="h-9 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          onChange={(event) => setComment(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitComment();
          }}
          placeholder="Viết bình luận..."
          value={comment}
        />
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-50" onClick={submitComment} type="button">
          <Send size={18} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
}

function PostDetailModal({
  canDelete: allowDelete,
  canEdit: allowEdit,
  onComment,
  onClose,
  onDelete,
  onEdit,
  onReact,
  onShare,
  post,
}: {
  canDelete: boolean;
  canEdit: boolean;
  onComment: (comment: string) => void;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReact: () => void;
  onShare: () => void;
  post: ForumPost;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/10 p-6">
      <section className="max-h-[86vh] w-full max-w-[640px] overflow-auto rounded-2xl border border-slate-200/60 bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-slate-200/60 px-5">
          <h2 className="text-lg font-semibold">Chi tiết bài viết</h2>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5">
          <PostCard
            canDelete={false}
            canEdit={false}
            onComment={onComment}
            onDelete={onDelete}
            onEdit={onEdit}
            onReact={onReact}
            onShare={onShare}
            onView={() => undefined}
            post={post}
          />
          <div className="mt-4 grid gap-3">
            <h3 className="text-lg font-semibold">Tất cả bình luận</h3>
            {post.commentItems.length ? (
              post.commentItems.map((item) => (
                <div className="flex items-start gap-2 rounded-xl border border-slate-200/60 p-4" key={item.id}>
                  <Avatar label={item.avatar} className="h-8 w-8 bg-emerald-500 text-xs text-white" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.author}</p>
                      <span className="text-xs text-slate-400">{item.timeAgo}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-200/60 p-4 text-sm text-slate-500">Chưa có bình luận.</div>
            )}
          </div>
        </div>
        {allowEdit || allowDelete ? (
          <div className="flex justify-end gap-2 border-t border-slate-200/60 px-5 py-4">
            {allowEdit ? <ActionButton icon={<Pencil size={15} strokeWidth={1.5} />} label="Sửa" onClick={onEdit} /> : null}
            {allowDelete ? <ActionButton danger icon={<Trash2 size={15} strokeWidth={1.5} />} label="Xóa" onClick={onDelete} /> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function PostFormModal({
  initialCategory = 'Chia sẻ kinh nghiệm',
  onClose,
  onSave,
  post,
}: {
  initialCategory?: string;
  onClose: () => void;
  onSave: (post: ForumPost) => void;
  post?: ForumPost;
}) {
  const [content, setContent] = useState(post?.content ?? '');
  const [category, setCategory] = useState(post?.category ?? initialCategory);
  const [location, setLocation] = useState(post?.location ?? 'An Giang');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? '');
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '');

  function handleImageFile(file?: File) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/10 p-6">
      <section className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-slate-200/60 px-5">
          <h2 className="text-lg font-semibold">{post ? 'Sửa bài viết' : 'Tạo bài viết'}</h2>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <form
          className="grid gap-3 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const nextContent = content.trim();
            if (!nextContent) return;

            onSave({
              id: post?.id ?? createId(nextContent),
              author: post?.author ?? currentForumUser.author,
              avatar: post?.avatar ?? currentForumUser.avatar,
              location: location.trim() || currentForumUser.location,
              timeAgo: post?.timeAgo ?? 'Vừa xong',
              category,
              content: nextContent,
              imageUrl: imageUrl.trim() || undefined,
              reactions: post?.reactions ?? 0,
              comments: post?.comments ?? 0,
              shares: post?.shares ?? 0,
              tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
              commentItems: post?.commentItems ?? [],
            });
          }}
        >
          <Field label="Nội dung">
            <textarea
              className="min-h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Bạn muốn chia sẻ điều gì với cộng đồng?"
              value={content}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Danh mục">
              <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" onChange={(event) => setCategory(event.target.value)} value={category}>
                {categories.filter((item) => item !== 'Tất cả').map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Khu vực">
              <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" onChange={(event) => setLocation(event.target.value)} value={location} />
            </Field>
          </div>
          <Field label="Ảnh">
            <div className="grid gap-3 rounded-xl border border-dashed border-slate-200 p-3">
              {imageUrl ? <img alt="Ảnh bài viết đã chọn" className="h-36 w-full rounded-lg object-cover" src={imageUrl} /> : null}
              <div className="flex items-center gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <ImageIcon size={16} strokeWidth={1.5} />
                  Chọn ảnh từ thiết bị
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageFile(event.target.files?.[0])}
                    type="file"
                  />
                </label>
                {imageUrl ? (
                  <button className="h-10 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50" onClick={() => setImageUrl('')} type="button">
                    Xóa ảnh
                  </button>
                ) : null}
              </div>
            </div>
          </Field>
          <Field label="Thẻ">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              onChange={(event) => setTags(event.target.value)}
              placeholder="Lúa, Thu hoạch, Kinh nghiệm"
              value={tags}
            />
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-4">
            <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">Hủy</button>
            <button className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700" type="submit">Đăng bài</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeletePostModal({ onClose, onDelete, post }: { onClose: () => void; onDelete: () => void; post: ForumPost }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/10 p-6">
      <section className="w-full max-w-[380px] rounded-2xl border border-slate-200/60 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Xóa bài viết</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Bạn có chắc chắn muốn xóa bài viết này?</p>
        <p className="mt-2 line-clamp-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">{post.content}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">Hủy</button>
          <button className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700" onClick={onDelete} type="button">Xóa</button>
        </div>
      </section>
    </div>
  );
}

function Avatar({ className = '', label }: { className?: string; label: string }) {
  return <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${className}`}>{label}</span>;
}

function FeedAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className="flex h-10 items-center justify-center gap-2 hover:bg-slate-50" onClick={onClick} type="button">
      {icon}
      {label}
    </button>
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
