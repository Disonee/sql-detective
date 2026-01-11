"use client";

import { useRouter } from 'next/navigation';

export default function ResetProgressButton() {
  const router = useRouter();

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      // Сброс прогресса
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('solved_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.dispatchEvent(new Event('caseSolved'));
      alert('Прогресс сброшен! Обновите страницу.');
      router.refresh(); // Обновляем страницу, чтобы пересчитать прогресс
    }
  };

  return (
    <button 
      className="flex-1 px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium transition"
      onClick={handleReset}
    >
      Сбросить прогресс
    </button>
  );
}