import Link from 'next/link';
import {
  Bot,
  ClipboardList,
  Cpu,
  Layers3,
  Map,
  Sprout,
  Wheat,
} from 'lucide-react';

const navItems = [
  { href: '/gis/map', label: 'Ban do', icon: Map },
  { href: '/gis/parcels', label: 'Thua dat', icon: Layers3 },
  { href: '/process/tasks', label: 'Cong viec', icon: ClipboardList },
  { href: '/harvest', label: 'Thu hoach', icon: Wheat },
  { href: '/iot/dashboard', label: 'IoT', icon: Cpu },
  { href: '/ai/chat', label: 'AI', icon: Bot },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-[#f7f9f6] max-md:grid-cols-1">
      <aside className="border-r border-[#dbe3dc] bg-white px-4 py-5 max-md:border-r-0 max-md:border-b">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#236b4a] text-white">
            <Sprout size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold">Nextfarm</p>
            <p className="text-xs text-[#66736b]">Workspace dashboard</p>
          </div>
        </div>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#334139] hover:bg-[#eef4ef]"
                href={item.href}
                key={item.href}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-[#dbe3dc] bg-white px-6">
          <div>
            <p className="text-sm font-medium">Trang dieu hanh</p>
            <p className="text-xs text-[#66736b]">Gateway API /api/v1</p>
          </div>
          <Link className="text-sm font-medium text-[#236b4a]" href="/login">
            Dang nhap
          </Link>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
