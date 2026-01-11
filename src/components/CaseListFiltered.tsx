"use client";

import { useState, useEffect } from 'react';
import CaseCard from './CaseCard';

interface CaseItem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  short_description?: string;
}

interface CaseListFilteredProps {
  cases: CaseItem[];
}

export default function CaseListFiltered({ cases }: CaseListFilteredProps) {
  const [filter, setFilter] = useState<'all' | 'Начинающий' | 'Продвинутый' | 'Эксперт'>('all');
  const [filteredCases, setFilteredCases] = useState<CaseItem[]>(cases);
  
  // Подсчет дел по категориям
  const counts = {
    all: cases.length,
    beginner: cases.filter(c => c.difficulty === 'Начинающий').length,
    advanced: cases.filter(c => c.difficulty === 'Продвинутый').length,
    expert: cases.filter(c => c.difficulty === 'Эксперт').length,
  };

  // Функция для применения фильтра
  const applyFilter = (filterType: 'all' | 'Начинающий' | 'Продвинутый' | 'Эксперт') => {
    setFilter(filterType);
    if (filterType === 'all') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(c => c.difficulty === filterType));
    }
  };

  // Применяем фильтр при загрузке
  useEffect(() => {
    applyFilter(filter);
  }, [cases]);

  return (
    <div>
      {/* Фильтры по сложности */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 font-detective">Фильтр по сложности</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => applyFilter('all')}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200'
            }`}
          >
            Все ({counts.all})
          </button>
          <button
            onClick={() => applyFilter('Начинающий')}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              filter === 'Начинающий'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200'
            }`}
          >
            Начинающий ({counts.beginner})
          </button>
          <button
            onClick={() => applyFilter('Продвинутый')}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              filter === 'Продвинутый'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}
          >
            Продвинутый ({counts.advanced})
          </button>
          {counts.expert > 0 && (
            <button
              onClick={() => applyFilter('Эксперт')}
              className={`px-5 py-2.5 rounded-lg font-medium transition ${
                filter === 'Эксперт'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              Эксперт ({counts.expert})
            </button>
          )}
        </div>
        
        {/* Информация о текущем фильтре */}
        <div className="mt-3 text-sm text-amber-600">
          {filter === 'all' && `Показаны все дела (${counts.all} шт.)`}
          {filter === 'Начинающий' && `Показаны только дела для начинающих (${counts.beginner} шт.)`}
          {filter === 'Продвинутый' && `Показаны только продвинутые дела (${counts.advanced} шт.)`}
          {filter === 'Эксперт' && `Показаны только экспертные дела (${counts.expert} шт.)`}
        </div>
      </div>

      {/* Список дел */}
      {filteredCases.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseData={caseItem} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-amber-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold font-detective mb-2">Дела не найдены</h3>
          <p className="text-amber-700">
            По выбранному фильтру нет доступных дел. Попробуйте выбрать другую сложность.
          </p>
          <button
            onClick={() => applyFilter('all')}
            className="mt-4 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-medium transition"
          >
            Показать все дела
          </button>
        </div>
      )}
    </div>
  );
}