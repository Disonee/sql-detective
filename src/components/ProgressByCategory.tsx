"use client";

import { useSolvedCases } from '@/hooks/useSolvedCases';

interface ProgressByCategoryProps {
  beginnerCases: number;
  advancedCases: number;
  expertCases: number;
  cases: Array<{ id: number; difficulty: string }>;
}

export default function ProgressByCategory({ 
  beginnerCases, 
  advancedCases, 
  expertCases,
  cases
}: ProgressByCategoryProps) {
  const { solvedByDifficulty } = useSolvedCases(cases);

  const totalSolved = solvedByDifficulty.beginner + solvedByDifficulty.advanced + solvedByDifficulty.expert;
  const totalCases = beginnerCases + advancedCases + expertCases;
  const progressPercentage = totalCases > 0 ? Math.round((totalSolved / totalCases) * 100) : 0;

  return (
    <div className="mt-12 bg-white border border-amber-200 rounded-xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-detective mb-2">Ваш прогресс по категориям</h2>
          <p className="text-amber-700">Следите за своим прогрессом в раскрытии дел</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-amber-900">{progressPercentage}%</div>
          <div className="text-sm text-amber-600">Общий прогресс</div>
        </div>
      </div>

      {/* Детальная статистика по уровням */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-amber-600 mb-2">
            <span>Начинающий</span>
            <span>{solvedByDifficulty.beginner}/{beginnerCases} решено</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: beginnerCases > 0 ? `${Math.round((solvedByDifficulty.beginner / beginnerCases) * 100)}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-amber-600 mb-2">
            <span>Продвинутый</span>
            <span>{solvedByDifficulty.advanced}/{advancedCases} решено</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2.5">
            <div 
              className="bg-yellow-500 h-2.5 rounded-full" 
              style={{ width: advancedCases > 0 ? `${Math.round((solvedByDifficulty.advanced / advancedCases) * 100)}%` : '0%' }}
            ></div>
          </div>
        </div>

        {expertCases > 0 && (
          <div>
            <div className="flex justify-between text-sm text-amber-600 mb-2">
              <span>Эксперт</span>
              <span>{solvedByDifficulty.expert}/{expertCases} решено</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2.5">
              <div 
                className="bg-red-500 h-2.5 rounded-full" 
                style={{ width: expertCases > 0 ? `${Math.round((solvedByDifficulty.expert / expertCases) * 100)}%` : '0%' }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}