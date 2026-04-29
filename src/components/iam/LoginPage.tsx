'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout } from 'lucide-react';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('example@nextfarm.vn');
  const [password, setPassword] = useState('nextfarm');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  function continueWithEmail() {
    setError('');

    if (!emailPattern.test(email)) {
      setError('Email không đúng định dạng.');
      return;
    }

    if (!password.trim()) {
      setError('Mật khẩu không được để trống.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      if (email.toLowerCase() === 'wrong@nextfarm.vn') {
        setLoading(false);
        setError('Email hoặc mật khẩu không chính xác.');
        return;
      }

      router.push('/select-workspace/');
    }, 650);
  }

  function continueWithGoogle() {
    setSsoLoading(true);
    window.setTimeout(() => router.push('/select-workspace/'), 650);
  }

  return (
    <main className="grid min-h-[563px] grid-cols-[556px_1fr] bg-white max-lg:grid-cols-1">
      <section className="relative flex min-h-[563px] flex-col overflow-hidden bg-[#16a34a] px-9 py-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.14),transparent_38%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#16a34a]">
            <Sprout size={18} strokeWidth={2.4} />
          </div>
          <p className="text-xl font-bold">Nextfarm</p>
        </div>
        <div className="relative z-10 mt-[52px] max-w-[520px]">
          <h1 className="text-[28px] font-bold leading-[1.18] tracking-normal">
            Tại Nextfarm, chúng tôi mang đến hệ thống quản lý nông trại thông minh
          </h1>
          <p className="mt-6 text-[15px] font-medium leading-6">
            Giúp bạn dễ dàng theo dõi, quản lý quy trình canh tác, giám sát thiết bị IoT và tối ưu hóa năng suất đồng ruộng với công nghệ AI tiên tiến. Từ gieo trồng đến thu hoạch, mọi thứ đều trong tầm tay.
          </p>
        </div>
        <p className="relative z-10 mt-auto text-xs font-medium">Nextfarm Team © 2026</p>
      </section>

      <section className="relative flex min-h-[563px] items-start justify-center bg-white px-8 pt-9">
        <div className="w-full max-w-[336px]">
          <h2 className="text-[25px] font-extrabold leading-8 text-black">Đăng nhập</h2>
          <p className="mt-2 text-xs leading-5 text-[#5f667a]">
            Đăng nhập vào tài khoản để quản lý tất cả các hoạt động nông nghiệp của bạn một cách hiệu quả và thông minh hơn.
          </p>

          <div className="mt-5 grid gap-[10px]">
            <button
              className="flex h-[35px] items-center justify-center gap-3 rounded-md border border-[#d9d9de] bg-white text-xs font-semibold text-black transition hover:border-[#16a34a] disabled:opacity-70"
              disabled={ssoLoading}
              onClick={continueWithGoogle}
              type="button"
            >
              <span className="text-[19px] font-bold leading-none">G</span>
              {ssoLoading ? 'Đang chuyển SSO...' : 'Đăng nhập với Google'}
            </button>
            <button
              className="flex h-[35px] items-center justify-center gap-3 rounded-md border border-[#d9d9de] bg-white text-xs font-semibold text-black"
              type="button"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-[11px] font-bold text-white">f</span>
              Đăng nhập với Facebook
            </button>
          </div>

          <div className="my-[13px] flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e3e3e7]" />
            <span className="text-xs text-[#6c7280]">Hoặc</span>
            <div className="h-px flex-1 bg-[#e3e3e7]" />
          </div>

          <form
            className="grid gap-[9px]"
            onSubmit={(event) => {
              event.preventDefault();
              continueWithEmail();
            }}
          >
            <label className="grid gap-2 text-[11px] font-bold text-black">
              Email
              <input
              className="h-[38px] rounded-lg border border-[#d0d4dc] bg-[#f3f4f6] px-3 text-xs font-medium text-[#555b6e] outline-none transition focus:border-[#16a34a] focus:bg-white"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@nextfarm.vn"
                type="email"
                value={email}
              />
            </label>
            <label className="grid gap-2 text-[11px] font-bold text-black">
              Mật khẩu
              <input
              className="h-[38px] rounded-lg border border-[#d0d4dc] bg-[#f3f4f6] px-3 text-xs font-medium text-[#555b6e] outline-none transition focus:border-[#16a34a] focus:bg-white"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-black">
              <input
                checked={remember}
                className="h-3 w-3 accent-[#16a34a]"
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              Nhớ lại
            </label>

            {error ? (
              <p className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs font-medium text-[#b91c1c]">
                {error}
              </p>
            ) : null}

            <button
              className="mt-1 h-9 rounded-md bg-[#16a34a] text-sm font-bold text-white transition hover:bg-[#15803d] disabled:cursor-wait disabled:opacity-75"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] leading-5 text-[#626a7d]">
            Bằng việc tiếp tục sử dụng, bạn đồng ý với <span className="text-[#178044]">Terms of Service</span> và các{' '}
            <span className="text-[#178044]">Privacy Policy</span>
          </p>
          <p className="mt-2 text-center text-xs text-black">
            Bạn chưa có tài khoản? <span className="font-bold text-[#16a34a]">Đăng ký ngay</span>
          </p>
        </div>

        <button
          aria-label="Trợ giúp"
          className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#e2e2e2] bg-white text-lg text-[#4b5563] shadow-sm"
          type="button"
        >
          ?
        </button>
      </section>
    </main>
  );
}
