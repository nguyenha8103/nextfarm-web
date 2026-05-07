'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  ChevronDown,
  Grid2X2,
  LogOut,
  Moon,
  Plus,
  Save,
  Settings,
  Shield,
  Sun,
  Trash2,
  Upload,
  UsersRound,
} from 'lucide-react';
import { IamSubsystemSwitcher } from './IamSubsystemSwitcher';

type Theme = 'light' | 'dark';
type Tab = 'general' | 'security' | 'ip';

type Workspace = {
  id: string;
  initial: string;
  name: string;
  role: string;
  members: number;
};

type GeneralSettings = {
  workspaceName: string;
  timezone: string;
  language: string;
  dateFormat: string;
  userTheme: Theme;
  notificationPreferences: boolean;
};

type SecuritySettings = {
  enforce2FA: boolean;
  sessionTimeout: number;
  failedLoginThreshold: number;
  lockoutDuration: number;
};

type IpRule = {
  id: string;
  cidr: string;
  note: string;
  createdAt: string;
};

const workspaces: Workspace[] = [
  { id: 'binh-dien', initial: 'H', name: 'HTX Nông nghiệp Bình Điền', role: 'Chủ sở hữu', members: 15 },
  { id: 'nong-san-xanh', initial: 'C', name: 'Công ty Nông sản Xanh', role: 'Quản trị viên', members: 8 },
  { id: 'cam-cao-phong', initial: 'C', name: 'HTX Cam Cao Phong', role: 'Quản lý nông trại', members: 12 },
];

const menu = [
  { label: 'Tổng quan', icon: Grid2X2, href: '/iam/' },
  { label: 'Người dùng', icon: UsersRound, href: '/iam/users/' },
  { label: 'Nhóm & quyền', icon: Shield, href: '/iam/groups/' },
  { label: 'Chi nhánh', icon: Building2, href: '/iam/branches/' },
  { label: 'Cài đặt', icon: Settings, href: '/iam/settings/', active: true },
];

const initialGeneral: GeneralSettings = {
  workspaceName: 'HTX Nông nghiệp Bình Điền',
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi',
  dateFormat: 'dd/MM/yyyy',
  userTheme: 'light',
  notificationPreferences: true,
};

const initialSecurity: SecuritySettings = {
  enforce2FA: false,
  sessionTimeout: 480,
  failedLoginThreshold: 5,
  lockoutDuration: 15,
};

const initialIpRules: IpRule[] = [
  { id: 'ip-1', cidr: '113.161.72.0/24', note: 'Văn phòng HTX', createdAt: '18/04/2026' },
  { id: 'ip-2', cidr: '14.241.120.18/32', note: 'Thiết bị quản trị', createdAt: '20/04/2026' },
];

function todayLabel() {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
}

function looksLikeCidr(value: string) {
  return /^(\d{1,3}\.){3}\d{1,3}\/([0-9]|[12][0-9]|3[0-2])$/.test(value.trim());
}

export function SettingsPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace>(workspaces[0]);
  const [theme, setTheme] = useState<Theme>('light');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [general, setGeneral] = useState<GeneralSettings>(initialGeneral);
  const [security, setSecurity] = useState<SecuritySettings>(initialSecurity);
  const [ipRules, setIpRules] = useState<IpRule[]>(initialIpRules);
  const [cidr, setCidr] = useState('');
  const [cidrNote, setCidrNote] = useState('');
  const [testIp, setTestIp] = useState('');
  const [testResult, setTestResult] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedWorkspace = window.localStorage.getItem('nextfarm:selectedWorkspace');
    const storedTheme = window.localStorage.getItem('nextfarm:theme') as Theme | null;

    if (storedWorkspace) {
      try {
        const parsedWorkspace = JSON.parse(storedWorkspace);
        setWorkspace(parsedWorkspace);
        setGeneral((current) => ({ ...current, workspaceName: parsedWorkspace.name }));
      } catch {
        window.localStorage.removeItem('nextfarm:selectedWorkspace');
      }
    }

    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
      setGeneral((current) => ({ ...current, userTheme: storedTheme }));
    }
  }, []);

  const dark = theme === 'dark';
  const surface = dark ? 'bg-[#111827] border-[#263244]' : 'bg-white border-slate-200/60';
  const muted = dark ? 'text-[#9ca3af]' : 'text-slate-500';
  const divider = dark ? 'border-[#263244]' : 'border-slate-200/60';
  const input = dark ? 'border-[#374151] bg-[#1f2937] text-white' : 'border-slate-200 bg-slate-50 text-slate-900';

  function switchWorkspace(nextWorkspace: Workspace) {
    setWorkspace(nextWorkspace);
    setWorkspaceOpen(false);
    setGeneral((current) => ({ ...current, workspaceName: nextWorkspace.name }));
    window.localStorage.setItem('nextfarm:selectedWorkspace', JSON.stringify(nextWorkspace));
  }

  function toggleTheme() {
    const nextTheme: Theme = dark ? 'light' : 'dark';
    setTheme(nextTheme);
    setGeneral((current) => ({ ...current, userTheme: nextTheme }));
    window.localStorage.setItem('nextfarm:theme', nextTheme);
  }

  function logout() {
    window.localStorage.removeItem('nextfarm:selectedWorkspace');
    router.push('/login/');
  }

  function saveSettings() {
    const nextWorkspace = { ...workspace, name: general.workspaceName };
    setWorkspace(nextWorkspace);
    setTheme(general.userTheme);
    window.localStorage.setItem('nextfarm:selectedWorkspace', JSON.stringify(nextWorkspace));
    window.localStorage.setItem('nextfarm:theme', general.userTheme);
    setMessage('Đã lưu cài đặt workspace');
  }

  function addIpRule() {
    if (!looksLikeCidr(cidr)) {
      setTestResult('CIDR không hợp lệ. Ví dụ đúng: 192.168.1.0/24');
      return;
    }

    setIpRules((current) => [
      ...current,
      {
        id: `ip-${Date.now()}`,
        cidr: cidr.trim(),
        note: cidrNote.trim() || 'Dải IP được phép',
        createdAt: todayLabel(),
      },
    ]);
    setCidr('');
    setCidrNote('');
    setMessage('Đã thêm IP whitelist');
  }

  function testCurrentIp() {
    if (!testIp.trim()) {
      setTestResult('Nhập IP cần kiểm tra.');
      return;
    }

    const matched = ipRules.some((rule) => {
      const prefix = rule.cidr.split('/')[0].split('.').slice(0, 3).join('.');
      return testIp.startsWith(prefix) || rule.cidr.startsWith(`${testIp}/`);
    });

    setTestResult(matched ? 'IP này đang được phép truy cập.' : 'IP này chưa nằm trong whitelist.');
  }

  return (
    <main className={`relative min-h-screen ${dark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`fixed left-0 top-0 h-screen min-h-screen w-[256px] border-r px-3 py-4 ${dark ? 'border-[#263244] bg-[#111827]' : 'border-slate-200/60 bg-slate-50'}`}>
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-semibold text-white">N</div>
          <div>
            <p className="text-lg font-medium leading-5">Nextfarm</p>
            <p className={`text-[10px] ${muted}`}>IAM System</p>
          </div>
        </div>

        <IamSubsystemSwitcher dark={dark} />

        <nav className="mt-8 grid gap-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`flex h-10 items-center gap-3 rounded-lg border-l-2 px-3 text-left text-sm font-medium ${
                  item.active
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : dark
                      ? 'text-[#e5e7eb] hover:bg-[#1f2937]'
                      : 'border-transparent text-slate-700 hover:bg-slate-100'
                }`}
                key={item.label}
                onClick={() => {
                  if (item.href) router.push(item.href);
                }}
                type="button"
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-h-screen pl-[256px]">
        <header className={`flex h-[45px] items-center justify-between border-b px-[20px] ${surface}`}>
          <div className="relative">
            <button
              className={`flex min-w-[245px] items-center gap-2 rounded-lg px-2 py-1 text-left transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'}`}
              onClick={() => {
                setWorkspaceOpen((current) => !current);
                setProfileOpen(false);
              }}
              type="button"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-xs font-semibold text-white">{workspace.initial}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-semibold leading-4">{workspace.name}</p>
                  <ChevronDown size={12} />
                </div>
                <p className={`text-[10px] ${muted}`}>{workspace.role}</p>
              </div>
            </button>

            {workspaceOpen ? (
              <div className={`absolute left-0 top-[40px] z-30 w-[286px] rounded-xl border p-2 shadow-md ${surface}`}>
                <p className={`px-2 pb-2 text-[11px] font-medium ${muted}`}>Chuyển workspace</p>
                <div className="grid gap-1">
                  {workspaces.map((item) => (
                    <button
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'}`}
                      key={item.id}
                      onClick={() => switchWorkspace(item)}
                      type="button"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">{item.initial}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{item.name}</span>
                        <span className={`text-[10px] ${muted}`}>{item.role} · {item.members} thành viên</span>
                      </span>
                      {item.id === workspace.id ? <Check className="text-emerald-600" size={16} /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            <button className={`flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'hover:bg-[#1f2937]' : 'hover:bg-slate-50'}`} onClick={toggleTheme} type="button">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="relative">
              <button
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#009688] text-xs font-semibold text-white"
                onClick={() => {
                  setProfileOpen((current) => !current);
                  setWorkspaceOpen(false);
                }}
                type="button"
              >
                A
              </button>
              {profileOpen ? (
                <div className={`absolute right-0 top-[34px] z-30 w-[210px] rounded-xl border p-2 shadow-md ${surface}`}>
                  <div className={`border-b px-2 pb-2 ${divider}`}>
                    <p className="text-xs font-semibold">Admin Nextfarm</p>
                    <p className={`mt-1 text-[10px] ${muted}`}>admin@nextfarm.vn</p>
                  </div>
                  <button className={`mt-2 flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-xs font-medium ${dark ? 'text-[#fca5a5] hover:bg-[#1f2937]' : 'text-[#dc2626] hover:bg-[#fef2f2]'}`} onClick={logout} type="button">
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="px-[16px] pb-8 pt-[19px]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold leading-7">Cài đặt Workspace</h1>
              <p className={`mt-1 text-xs ${muted}`}>Cấu hình thông tin tổ chức, bảo mật và IP whitelist</p>
            </div>
            <button className="flex h-[30px] items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white" onClick={saveSettings} type="button">
              <Save size={14} />
              Lưu cài đặt
            </button>
          </div>

          <div className={`mt-5 flex border-b ${divider}`}>
            {[
              { id: 'general', label: 'Chung' },
              { id: 'security', label: 'Bảo mật' },
              { id: 'ip', label: 'IP Whitelist' },
            ].map((tab) => (
              <button
                className={`h-10 border-b-2 px-3 text-xs font-medium ${activeTab === tab.id ? 'border-emerald-600 text-emerald-600' : `border-transparent ${muted}`}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {message ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600">{message}</div>
          ) : null}

          {activeTab === 'general' ? (
            <section className={`mt-4 rounded-xl border p-4 ${surface}`}>
              <div className="grid max-w-[680px] gap-4">
                <label className="grid gap-2 text-[11px] font-medium">
                  Tên workspace
                  <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setGeneral({ ...general, workspaceName: event.target.value })} value={general.workspaceName} />
                </label>
                <div className="grid gap-2 text-[11px] font-medium">
                  Logo workspace
                  <div className={`flex h-12 items-center justify-between rounded-xl border px-3 ${dark ? 'border-[#374151] bg-[#1f2937]' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-semibold text-white">{workspace.initial}</span>
                      <span className={`text-[11px] ${muted}`}>PNG/JPG, tối đa 2MB</span>
                    </div>
                    <button className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium" type="button">
                      <Upload size={13} />
                      Tải lên
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <label className="grid gap-2 text-[11px] font-medium">
                    Timezone
                    <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setGeneral({ ...general, timezone: event.target.value })} value={general.timezone}>
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                      <option value="Asia/Bangkok">Asia/Bangkok</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-[11px] font-medium">
                    Ngôn ngữ
                    <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setGeneral({ ...general, language: event.target.value })} value={general.language}>
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-[11px] font-medium">
                    Định dạng ngày
                    <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setGeneral({ ...general, dateFormat: event.target.value })} value={general.dateFormat}>
                      <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                      <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                      <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                    </select>
                  </label>
                </div>
                <div className={`rounded-xl border p-3 ${divider}`}>
                  <h2 className="text-sm font-semibold">Tùy chọn người dùng</h2>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="grid gap-2 text-[11px] font-medium">
                      Theme mặc định
                      <select className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setGeneral({ ...general, userTheme: event.target.value as Theme })} value={general.userTheme}>
                        <option value="light">Sáng</option>
                        <option value="dark">Tối</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 text-[11px] font-medium">
                      Liên kết notification preferences
                      <input checked={general.notificationPreferences} className="h-4 w-4 accent-emerald-600" onChange={(event) => setGeneral({ ...general, notificationPreferences: event.target.checked })} type="checkbox" />
                    </label>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === 'security' ? (
            <section className={`mt-4 rounded-xl border p-4 ${surface}`}>
              <div className="grid max-w-[620px] gap-4">
                <div className={`flex h-12 items-center justify-between rounded-xl border px-3 ${divider}`}>
                  <div>
                    <p className="text-xs font-semibold">Bắt buộc xác thực 2 yếu tố (2FA)</p>
                    <p className={`mt-1 text-[10px] ${muted}`}>Áp dụng cho tất cả người dùng trong workspace.</p>
                  </div>
                  <button
                    className={`h-6 w-11 rounded-full p-[2px] transition ${security.enforce2FA ? 'bg-emerald-600' : dark ? 'bg-[#374151]' : 'bg-[#d1d5db]'}`}
                    onClick={() => setSecurity({ ...security, enforce2FA: !security.enforce2FA })}
                    type="button"
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition ${security.enforce2FA ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <label className="grid gap-2 text-[11px] font-medium">
                    Thời gian phiên (phút)
                    <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} min={15} onChange={(event) => setSecurity({ ...security, sessionTimeout: Number(event.target.value) })} type="number" value={security.sessionTimeout} />
                  </label>
                  <label className="grid gap-2 text-[11px] font-medium">
                    Số lần đăng nhập thất bại
                    <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} min={1} onChange={(event) => setSecurity({ ...security, failedLoginThreshold: Number(event.target.value) })} type="number" value={security.failedLoginThreshold} />
                  </label>
                  <label className="grid gap-2 text-[11px] font-medium">
                    Thời gian khóa (phút)
                    <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} min={1} onChange={(event) => setSecurity({ ...security, lockoutDuration: Number(event.target.value) })} type="number" value={security.lockoutDuration} />
                  </label>
                </div>
                <div className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] px-3 py-3 text-[11px] text-[#0369a1]">
                  Theo rule IAM, access token vẫn giữ TTL 900 giây. Các cấu hình này điều khiển policy workspace và khóa tài khoản khi đăng nhập sai.
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === 'ip' ? (
            <section className={`mt-4 rounded-xl border p-4 ${surface}`}>
              <div className="grid grid-cols-[1fr_300px] gap-4">
                <div>
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                    <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setCidr(event.target.value)} placeholder="CIDR, ví dụ 192.168.1.0/24" value={cidr} />
                    <input className={`h-8 rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setCidrNote(event.target.value)} placeholder="Ghi chú" value={cidrNote} />
                    <button className="flex h-8 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white" onClick={addIpRule} type="button">
                      <Plus size={13} />
                      Thêm
                    </button>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-200/60">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className={dark ? 'bg-[#1f2937]' : 'bg-slate-50'}>
                        <tr className={muted}>
                          <th className="px-3 py-[10px] font-medium">CIDR</th>
                          <th className="px-3 py-[10px] font-medium">Ghi chú</th>
                          <th className="px-3 py-[10px] font-medium">Ngày tạo</th>
                          <th className="px-3 py-[10px] text-right font-medium">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ipRules.map((rule) => (
                          <tr className={`border-t ${divider}`} key={rule.id}>
                            <td className="px-3 py-[11px] font-medium">{rule.cidr}</td>
                            <td className="px-3 py-[11px]">{rule.note}</td>
                            <td className={`px-3 py-[11px] ${muted}`}>{rule.createdAt}</td>
                            <td className="px-3 py-[11px] text-right">
                              <button className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#fecaca] text-[#dc2626] hover:bg-[#fef2f2]" onClick={() => setIpRules((current) => current.filter((item) => item.id !== rule.id))} type="button">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={`rounded-xl border p-3 ${divider}`}>
                  <h2 className="text-sm font-semibold">Test IP</h2>
                  <p className={`mt-1 text-[11px] ${muted}`}>Kiểm tra nhanh một IP có nằm trong whitelist không.</p>
                  <input className={`mt-3 h-8 w-full rounded-xl border px-3 text-xs outline-none ${input}`} onChange={(event) => setTestIp(event.target.value)} placeholder="Ví dụ 113.161.72.10" value={testIp} />
                  <button className="mt-3 h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium" onClick={testCurrentIp} type="button">Kiểm tra</button>
                  {testResult ? <p className={`mt-3 rounded-lg px-3 py-2 text-[11px] font-medium ${testResult.includes('được phép') ? 'bg-emerald-50 text-emerald-600' : 'bg-[#fef2f2] text-[#dc2626]'}`}>{testResult}</p> : null}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <button
        aria-label="Trợ giúp"
        className={`fixed bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border text-lg  ${dark ? 'border-[#263244] bg-[#111827] text-[#d1d5db]' : 'border-[#e2e2e2] bg-white text-slate-600'}`}
        type="button"
      >
        ?
      </button>
    </main>
  );
}
