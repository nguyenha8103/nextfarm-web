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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-[#dfe4ea] bg-white py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#16a34a] text-sm font-extrabold text-white">N</div>
      <div className="mt-5 grid gap-2">
        {allowedModules.map((module) => {
          const Icon = module.icon;
          const active = currentModule.id === module.id;
          return (
            <button
              aria-label={module.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-md transition ${
                active ? 'bg-[#16a34a] text-white shadow-sm' : 'text-[#475569] hover:bg-[#eef4ef] hover:text-[#16a34a]'
              }`}
              key={module.id}
              onClick={() => {
                window.sessionStorage.setItem('nextfarm:navigatingModule', module.id);
                router.push(module.href);
              }}
              title={module.label}
              type="button"
            >
              <Icon size={18} />
              <span className="pointer-events-none absolute left-12 top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded bg-[#111827] px-2 py-1 text-[11px] font-bold text-white shadow group-hover:block">
                {module.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#009688] text-xs font-extrabold text-white">A</div>
    </aside>
  );
}
