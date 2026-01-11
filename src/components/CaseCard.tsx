"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface CaseCardProps {
  caseData: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    short_description?: string;
  };
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    // Проверяем, решено ли дело
    if (typeof window !== 'undefined') {
      const solved = localStorage.getItem(`solved_${caseData.id}`);
      if (solved === 'true') {
        setIsSolved(true);
      }
    }
  }, [caseData.id]);

  const getDifficultyColor = () => {
    switch (caseData.difficulty) {
      case 'Начинающий': return 'bg-green-100 text-green-800 border-green-200';
      case 'Продвинутый': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Эксперт': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getCategoryColor = () => {
    if (caseData.category.includes('начинающих')) return 'bg-blue-50 text-blue-700';
    if (caseData.category.includes('анализ') || caseData.category.includes('Анализ')) return 'bg-purple-50 text-purple-700';
    return 'bg-amber-50 text-amber-700';
  };

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor()}`}>
          {caseData.difficulty}
        </span>
        
        {/* Иконка статуса */}
        <div className="text-2xl">
          {isSolved ? (
            <div className="text-green-600" title="Дело раскрыто">✅</div>
          ) : (
            <div className="text-amber-600" title="Дело ожидает расследования">🔍</div>
          )}
        </div>
      </div>
      
      {/* Иконка дела */}
      <div className="text-4xl text-center mb-4">
        {caseData.difficulty === 'Начинающий' && '📊'}
        {caseData.difficulty === 'Продвинутый' && '🔎'}
        {caseData.difficulty === 'Эксперт' && '🕵️'}
      </div>
      
      <h2 className="text-xl font-bold mb-2 font-detective">{caseData.title}</h2>
      
      <p className="text-amber-700 mb-4 line-clamp-2 flex-grow">
        {caseData.short_description || caseData.description}
      </p>
      
      <div className="text-sm text-amber-600 mb-2">
        Категория: <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor()}`}>
          {caseData.category}
        </span>
      </div>
      
      {/* Прогресс-бар для каждого дела */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-amber-600 mb-1">
          <span>Прогресс дела</span>
          <span>{isSolved ? '100%' : '0%'}</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isSolved ? 'bg-green-600' : 'bg-amber-300'
            }`}
            style={{ width: isSolved ? '100%' : '0%' }}
          ></div>
        </div>
      </div>
      
      {/* Кнопка перехода к делу */}
      <Link
        href={`/case/${caseData.id}`}
        className={`mt-4 block text-center py-2.5 rounded-lg font-medium transition ${
          isSolved 
            ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-200' 
            : 'bg-amber-800 hover:bg-amber-700 text-white'
        }`}
      >
        {isSolved ? 'Пересмотреть дело' : 'Начать расследование'}
      </Link>
    </div>
  );
}