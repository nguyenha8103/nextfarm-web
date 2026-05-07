'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentModule, getUserRole, isAllowed, modules, type UserRole } from './moduleNavigation';

export function GlobalModuleRail() {
  const pathname = usePathname();
  const router = useRouter();
  const currentModule = getCurrentModule(pathname);
  const [role, setRole] = useState<UserRole>('owner');

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const allowedModules = modules.filter((module) => isAllowed(module.roles, role));

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-slate-200/60 bg-slate-50 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">N</div>
      <div className="mt-5 grid gap-2">
        {allowedModules.map((module) => {
          const Icon = module.icon;
          const active = currentModule.id === module.id;
          return (
            <button
              aria-label={module.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150 ${
                active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'
              }`}
              key={module.id}
              onClick={() => {
                window.sessionStorage.setItem('nextfarm:navigatingModule', module.id);
                router.push(module.href);
              }}
              title={module.label}
              type="button"
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="pointer-events-none absolute left-12 top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-md group-hover:block">
                {module.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#009688] text-xs font-semibold text-white">A</div>
    </aside>
  );
}
