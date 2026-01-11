// C:\projects\sqlnoir\src\hooks\useSolvedCases.ts
"use client";

import { useEffect, useState, useCallback } from 'react';

interface CaseInfo {
  id: number;
  difficulty: string;
}

export function useSolvedCases(cases: CaseInfo[]) {
  const [solvedCases, setSolvedCases] = useState(0);
  const [solvedByDifficulty, setSolvedByDifficulty] = useState({
    beginner: 0,
    advanced: 0,
    expert: 0,
  });

  const countSolvedCases = useCallback(() => {
    if (typeof window === 'undefined') return;

    let solved = 0;
    let beginner = 0;
    let advanced = 0;
    let expert = 0;

    cases.forEach(caseItem => {
      const solvedKey = `solved_${caseItem.id}`;
      const isSolved = localStorage.getItem(solvedKey) === 'true';
      
      if (isSolved) {
        solved++;
        switch (caseItem.difficulty) {
          case 'Начинающий':
            beginner++;
            break;
          case 'Продвинутый':
            advanced++;
            break;
          case 'Эксперт':
            expert++;
            break;
        }
      }
    });

    setSolvedCases(solved);
    setSolvedByDifficulty({ beginner, advanced, expert });
  }, [cases]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    countSolvedCases();

    const handleStorageChange = () => {
      countSolvedCases();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('caseSolved', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('caseSolved', handleStorageChange);
    };
  }, [cases, countSolvedCases]);

  return { 
    solvedCases, 
    solvedByDifficulty,
    refreshProgress: countSolvedCases
  };
}