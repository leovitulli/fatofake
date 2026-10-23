'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/minha-area?tab=admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080e18] flex items-center justify-center text-slate-400 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Redirecionando para a Minha Área Cívica...</span>
      </div>
    </div>
  );
}
