import Link from 'next/link';
import { ArrowRight, Bot, Cpu, Map, Wheat } from 'lucide-react';

export default function HomePage() {
  const modules = [
    {
      href: '/gis/map',
      title: 'GIS map',
      description: 'Quan ly thua dat, zone va lop ban do canh tac.',
      icon: Map,
    },
    {
      href: '/iot/dashboard',
      title: 'IoT telemetry',
      description: 'Theo doi cam bien, gateway va canh bao moi truong.',
      icon: Cpu,
    },
    {
      href: '/harvest',
      title: 'Thu hoach',
      description: 'Kiem soat lo hang, san luong va truy xuat nguon goc.',
      icon: Wheat,
    },
    {
      href: '/ai/chat',
      title: 'AI assistant',
      description: 'Hoi dap va goi y ke hoach canh tac theo du lieu.',
      icon: Bot,
    },
  ];

  return (
    <section className="p-6">
      <div className="max-w-5xl">
        <p className="text-sm font-medium text-[#236b4a]">Nextfarm Web</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#17211b]">Bang dieu hanh nong trai</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66736b]">
          Frontend Next.js cho cac module GIS, Process, Harvest, IoT va AI. Giao dien duoc custom bang TailwindCSS va san sang ket noi Gateway API.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              className="group rounded-lg border border-[#dbe3dc] bg-white p-5 shadow-sm transition hover:border-[#236b4a]"
              href={module.href}
              key={module.href}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef4ef] text-[#236b4a]">
                <Icon size={20} />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{module.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#66736b]">{module.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#236b4a]">
                Mo module
                <ArrowRight className="transition group-hover:translate-x-1" size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
