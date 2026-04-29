'use client';

import { useRouter } from 'next/navigation';
import { Shield, Sprout } from 'lucide-react';

export function IamSubsystemSwitcher({ dark }: { dark: boolean }) {
  const router = useRouter();

  return (
    <div className="mt-5 grid gap-1">
      <button
        className={`flex h-9 items-center gap-2 rounded-md px-3 text-left text-xs font-bold ${
          dark ? 'bg-[#123421] text-[#86efac]' : 'bg-[#e8f5e9] text-[#15803d]'
        }`}
        type="button"
      >
        <Shield size={15} />
        Admin
      </button>
      <button
        className={`flex h-9 items-center gap-2 rounded-md px-3 text-left text-xs font-bold ${
          dark ? 'text-[#e5e7eb] hover:bg-[#1f2937]' : 'text-[#111827] hover:bg-white'
        }`}
        onClick={() => {
          window.sessionStorage.setItem('nextfarm:navigatingSubsystem', 'farm');
          router.push('/gis/map/');
        }}
        type="button"
      >
        <Sprout size={15} />
        Nông nghiệp
      </button>
    </div>
  );
}
