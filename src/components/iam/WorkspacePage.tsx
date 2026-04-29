'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Crown, Plus, UsersRound, UserRoundCog } from 'lucide-react';

const workspaces = [
  {
    id: 'binh-dien',
    initial: 'H',
    name: 'HTX Nông nghiệp Bình Điền',
    role: 'Chủ sở hữu',
    members: 15,
    tone: 'text-[#f97316]',
  },
  {
    id: 'nong-san-xanh',
    initial: 'C',
    name: 'Công ty Nông sản Xanh',
    role: 'Quản trị viên',
    members: 8,
    tone: 'text-[#16a34a]',
  },
];

export function WorkspacePage() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  function openWorkspace(workspace: (typeof workspaces)[number]) {
    window.localStorage.setItem('nextfarm:selectedWorkspace', JSON.stringify(workspace));
    router.push('/iam/');
  }

  return (
    <main className="relative min-h-[555px] bg-gradient-to-br from-[#f4fbf6] via-white to-[#edf7fb] px-6 py-[74px]">
      <section className="mx-auto w-full max-w-[505px]">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16a34a] text-xl font-extrabold text-white">
            N
          </div>
          <h1 className="mt-3 text-center text-xl font-extrabold text-black">Chọn tổ chức</h1>
          <p className="mt-1 text-center text-xs text-[#687084]">Chọn tổ chức bạn muốn làm việc</p>
        </div>

        <div className="mt-[24px] grid gap-3">
          {workspaces.map((workspace) => (
            <button
              className="flex h-[86px] items-center gap-3 rounded-lg border border-[#e0e1e5] bg-white px-[18px] text-left shadow-sm transition hover:border-[#16a34a] hover:shadow-md"
              key={workspace.id}
              onClick={() => openWorkspace(workspace)}
              type="button"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#16a34a] text-lg font-extrabold text-white">
                {workspace.initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-extrabold text-black">{workspace.name}</span>
                <span className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[#687084]">
                  <span className="inline-flex items-center gap-1">
                    {workspace.id === 'binh-dien' ? <Crown className={workspace.tone} size={12} /> : <UserRoundCog className={workspace.tone} size={12} />}
                    {workspace.role}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UsersRound size={12} />
                    {workspace.members} thành viên
                  </span>
                </span>
              </span>
              <ChevronRight className="text-[#747b8b]" size={22} />
            </button>
          ))}

          <button
            className="flex h-[86px] items-center gap-3 rounded-lg border border-dashed border-[#d8dce3] bg-white/80 px-[18px] text-left shadow-sm transition hover:border-[#16a34a]"
            onClick={() => setShowCreateForm((current) => !current)}
            type="button"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#ededf2] text-[#8b91a1]">
              <Plus size={21} />
            </span>
            <span>
              <span className="block text-[14px] font-extrabold text-black">Tạo tổ chức mới</span>
              <span className="mt-1 block text-[12px] text-[#687084]">Bắt đầu với một workspace mới</span>
            </span>
          </button>

          {showCreateForm ? (
            <form
              className="grid gap-3 rounded-lg border border-[#e0e1e5] bg-white p-4 shadow-sm"
              onSubmit={(event) => {
                event.preventDefault();
                if (workspaceName.trim()) {
                  window.localStorage.setItem(
                    'nextfarm:selectedWorkspace',
                    JSON.stringify({
                      id: 'new-workspace',
                      initial: workspaceName.trim()[0]?.toUpperCase() || 'N',
                      name: workspaceName.trim(),
                      role: 'Chủ sở hữu',
                      members: 1,
                      tone: 'text-[#16a34a]',
                    }),
                  );
                  router.push('/iam/');
                }
              }}
            >
              <label className="grid gap-2 text-xs font-bold text-black">
                Tên workspace
                <input
                  className="h-10 rounded-md border border-[#d0d4dc] px-3 text-sm outline-none focus:border-[#16a34a]"
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="VD: HTX Nông nghiệp mới"
                  value={workspaceName}
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  className="h-9 rounded-md border border-[#d9dce3] px-4 text-xs font-bold text-[#4b5563]"
                  onClick={() => setShowCreateForm(false)}
                  type="button"
                >
                  Hủy
                </button>
                <button className="h-9 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" type="submit">
                  Tạo workspace
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </section>

      <button
        aria-label="Trợ giúp"
        className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#e2e2e2] bg-white text-lg text-[#4b5563] shadow-sm"
        type="button"
      >
        ?
      </button>
    </main>
  );
}
