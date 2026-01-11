// types.ts или где у вас объявлен интерфейс Case
export interface Case {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  xpReward: number;
  completed: boolean;
  isNew: boolean;
  category: "beginner" | "intermediate" | "advanced" | "expert";
  brief: string;
  objectives: string[];
  solution: {
    answer: string;
    successMessage: string;
    explanation: string;
  };
  schema_text: string;
  correct_query: string;
  // Добавьте эти поля
  short_description: string;
  task: string;
  explanation: string; // отдельное поле, не только в solution
}