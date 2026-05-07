'use client';

import { useRouter } from 'next/navigation';
import { Shield, Sprout } from 'lucide-react';

export function IamSubsystemSwitcher({ dark }: { dark: boolean }) {
  const router = useRouter();

  return (
    <div className="mt-7 grid gap-1">
      <button
        className={`flex h-10 items-center gap-3 rounded-lg border-l-2 px-3 text-left text-sm font-medium ${
          dark ? 'border-emerald-500 bg-[#123421] text-[#86efac]' : 'border-emerald-600 bg-emerald-50 text-emerald-700'
        }`}
        type="button"
      >
        <Shield size={18} strokeWidth={1.5} />
        Admin
      </button>
      <button
        className={`flex h-10 items-center gap-3 rounded-lg border-l-2 px-3 text-left text-sm font-medium transition-all duration-150 ${
          dark ? 'border-transparent text-[#e5e7eb] hover:bg-[#1f2937]' : 'border-transparent text-slate-700 hover:bg-slate-100'
        }`}
        onClick={() => {
          window.sessionStorage.setItem('nextfarm:navigatingSubsystem', 'farm');
          router.push('/gis/map/');
        }}
        type="button"
      >
        <Sprout size={18} strokeWidth={1.5} />
        Nông nghiệp
      </button>
    </div>
  );
}
