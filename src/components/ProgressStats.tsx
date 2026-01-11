"use client";

import { useSolvedCases } from '@/hooks/useSolvedCases';

interface ProgressStatsProps {
  totalCases: number;
  cases: Array<{ id: number; difficulty: string }>;
  filteredCount?: number; // Добавляем опциональный параметр для фильтрованных дел
}

export default function ProgressStats({ totalCases, cases, filteredCount }: ProgressStatsProps) {
  const { solvedCases } = useSolvedCases(cases);
  const progressPercentage = totalCases > 0 ? Math.round((solvedCases / totalCases) * 100) : 0;

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-amber-600 mb-2">Общая статистика</div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-900">{totalCases}</div>
              <div className="text-xs text-amber-600">всего дел</div>
            </div>
            <div className="h-8 w-px bg-amber-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{solvedCases}</div>
              <div className="text-xs text-amber-600">решено</div>
            </div>
            <div className="h-8 w-px bg-amber-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-900">{progressPercentage}%</div>
              <div className="text-xs text-amber-600">прогресс</div>
            </div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-sm text-amber-600 mb-2">
            <span>Прогресс по всем делам</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Показываем количество фильтрованных дел, если передано */}
      {filteredCount !== undefined && (
        <div className="mt-4 text-sm text-amber-600">
          В текущем фильтре: <span className="font-medium">{filteredCount} дел</span>
        </div>
      )}
    </div>
  );
}