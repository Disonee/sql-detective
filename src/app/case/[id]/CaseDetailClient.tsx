"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CaseData {
  id: number;
  title: string;
  description: string;
  short_description: string;
  task: string;
  schema_text: string;
  correct_query: string;
  explanation: string;
  difficulty: string;
  category: string;
}

interface CaseDetailClientProps {
  caseData: CaseData;
  nextCaseId: number | null;
}

export default function CaseDetailClient({ caseData, nextCaseId }: CaseDetailClientProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  // Проверяем при загрузке, решено ли уже дело
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const solved = localStorage.getItem(`solved_${caseData.id}`);
      if (solved === 'true') {
        setIsSolved(true);
      }
    }
  }, [caseData.id]);
  
 const checkSolution = async () => {
  if (!query.trim()) {
    setResult('❌ Введите SQL-запрос для проверки');
    return;
  }

  setIsChecking(true);
  setResult('🔍 Проверяем запрос...');
  
  try {
    console.log('📤 Отправляю запрос на проверку...');
    
    const response = await fetch('/api/validate-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        caseId: caseData.id, 
        userQuery: query 
      })
    });
    
    const resultData = await response.json();
    
    console.log('📥 Ответ от сервера:', resultData);
    
    if (resultData.isError) {
      // Ошибка сервера
      setResult(`❌ Ошибка сервера: ${resultData.message}`);
    } else if (resultData.isCorrect) {
      // Запрос корректен
      let successMessage = `✅ ${resultData.message}`;
      if (resultData.comparisonType === 'quick') {
        successMessage += '\n🎯 Запрос точно совпадает с эталонным!';
      } else if (resultData.comparisonType === 'semantic') {
        successMessage += '\n🧠 Запрос семантически эквивалентен эталонному!';
      }
      setResult(successMessage);
      setIsSolved(true);
      
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`solved_${caseData.id}`, 'true');
        window.dispatchEvent(new Event('caseSolved'));
      }
    } else {
      // Запрос неверный
      let errorMessage = `❌ ${resultData.message}`;
      
      // Добавляем различия, если есть
      if (resultData.differences && resultData.differences.length > 0) {
        errorMessage += '\n\n🔍 Детали:';
        resultData.differences.forEach((diff: string, index: number) => {
          errorMessage += `\n${index + 1}. ${diff}`;
        });
      }
      
      // Добавляем подсказки, если есть
      if (resultData.hints && resultData.hints.length > 0) {
        errorMessage += '\n\n💡 Подсказки:';
        resultData.hints.forEach((hint: string, index: number) => {
          errorMessage += `\n${index + 1}. ${hint}`;
        });
      }
      
      // Добавляем статистику, если есть
      if (resultData.stats && (resultData.stats.userRows !== undefined || resultData.stats.correctRows !== undefined)) {
        errorMessage += `\n\n📊 Статистика:`;
        errorMessage += `\nВаш запрос вернул: ${resultData.stats.userRows} строк`;
        errorMessage += `\nОжидалось: ${resultData.stats.correctRows} строк`;
      }
      
      // Особые подсказки для распространенных ошибок
      if (resultData.message.includes('неожиданный конец команды') || resultData.message.includes('Unexpected end')) {
        errorMessage += '\n\n⚠️ Возможные проблемы:';
        errorMessage += '\n• Проверьте, что все скобки закрыты';
        errorMessage += '\n• Убедитесь, что есть условие (например, > 9)';
        errorMessage += '\n• Не забудьте точку с запятой в конце ;';
      }
      
      setResult(errorMessage);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке решения:', error);
    setResult('❌ Не удалось проверить решение. Проверьте подключение к серверу.');
  } finally {
    setIsChecking(false);
  }
};
  const getHint = () => {
  const queryLower = caseData.correct_query.toLowerCase();
  
  // Более умные подсказки на основе эталонного запроса
  if (queryLower.includes('extract(hour') || queryLower.includes('extract (hour')) {
    return "Используйте функцию EXTRACT(HOUR FROM timestamp) для извлечения часа из временной метки. Пример: SELECT * FROM employee_attendance WHERE EXTRACT(HOUR FROM check_in_time) > 9;";
  } else if (queryLower.includes('join')) {
    if (queryLower.includes('inner join')) {
      return "Используйте INNER JOIN для соединения таблиц. Укажите условие соединения с помощью ON: SELECT * FROM таблица1 INNER JOIN таблица2 ON таблица1.id = таблица2.table1_id";
    } else if (queryLower.includes('left join')) {
      return "Используйте LEFT JOIN для включения всех записей из левой таблицы, даже если нет соответствий в правой";
    }
    return "Для соединения таблиц используйте JOIN с указанием условия ON. Проверьте, правильно ли указаны имена таблиц и условия соединения.";
  } else if (queryLower.includes('group by')) {
    if (queryLower.includes('avg(')) {
      return "Используйте GROUP BY для группировки и AVG() для вычисления среднего значения: SELECT отдел, AVG(зарплата) FROM сотрудники GROUP BY отдел";
    } else if (queryLower.includes('sum(')) {
      return "Используйте GROUP BY для группировки и SUM() для вычисления суммы: SELECT категория, SUM(сумма) FROM транзакции GROUP BY категория";
    } else if (queryLower.includes('count(')) {
      return "Используйте GROUP BY для группировки и COUNT() для подсчета записей: SELECT статус, COUNT(*) FROM заказы GROUP BY статус";
    }
    return "Используйте GROUP BY для группировки результатов. Все неагрегированные столбцы в SELECT должны быть в GROUP BY.";
  } else if (queryLower.includes('where')) {
    if (queryLower.includes('> (select')) {
      return "Используйте подзапрос в условии WHERE для сравнения со значением из другого запроса: WHERE зарплата > (SELECT AVG(зарплата) FROM сотрудники)";
    } else if (queryLower.includes('between')) {
      return "Используйте BETWEEN для диапазона значений: WHERE дата BETWEEN '2024-01-01' AND '2024-01-31'";
    } else if (queryLower.includes('like')) {
      return "Используйте LIKE для поиска по шаблону. % - любое количество символов, _ - один символ: WHERE имя LIKE 'Иван%'";
    }
    return "Используйте WHERE для фильтрации записей по условию. Проверьте правильность условия и используемых операторов (=, >, <, >=, <=, <>, LIKE, IN).";
  } else if (queryLower.includes('select')) {
    if (queryLower.includes('distinct')) {
      return "Используйте DISTINCT для исключения дубликатов: SELECT DISTINCT город FROM клиенты";
    }
    return "Начните с простого SELECT * FROM имя_таблицы для просмотра данных. Затем уточните запрос.";
  }
  
  return "Проанализируйте структуру таблиц и условия задачи. Попробуйте разбить задачу на части: 1) Какие данные нужно получить, 2) Из каких таблиц, 3) Какие условия применить.";
};

  const schemaLines = caseData.schema_text 
    ? caseData.schema_text.split('\n').filter(line => line.trim())
    : [];

  return (
    <main className="min-h-screen bg-amber-50 text-amber-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link 
            href="/cases" 
            className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-6"
          >
            ← Вернуться к архиву дел
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                caseData.difficulty === 'Начинающий' ? 'bg-green-100 text-green-800' :
                caseData.difficulty === 'Продвинутый' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {caseData.difficulty}
              </span>
              <h1 className="text-3xl font-bold mt-2 font-detective">{caseData.title}</h1>
              <p className="text-amber-700 mt-2">{caseData.description}</p>
              <div className="mt-2 text-sm text-amber-600">
                Категория: <span className="font-medium">{caseData.category}</span>
              </div>
            </div>
            <div className="text-4xl">
              {isSolved ? '✅' : '🔍'}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Левая колонка */}
          <div className="space-y-6">
            <div className="bg-white border border-amber-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 font-detective">Задача</h2>
              <div className="text-amber-800 bg-amber-50 p-4 rounded-lg border border-amber-100 whitespace-pre-line">
                {caseData.task}
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 font-detective">Структура базы данных</h2>
              <div className="space-y-3">
                {schemaLines.length > 0 ? (
                  schemaLines.map((line, idx) => (
                    <div key={idx} className="font-mono text-sm bg-amber-50 p-3 rounded border border-amber-100 overflow-x-auto">
                      {line}
                    </div>
                  ))
                ) : (
                  <p className="text-amber-600">Структура не указана</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 font-detective">Объяснение решения</h2>
              <div className="text-amber-800 whitespace-pre-line">
                {caseData.explanation}
              </div>
            </div>
          </div>

          {/* Правая колонка - Допросник данных */}
          <div className="space-y-6">
            <div className="bg-white border border-amber-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-detective">Допросник данных</h2>
                {isSolved && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ Дело раскрыто
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Составьте запрос для поиска улик:</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-40 font-mono p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="-- Начните допрос данных здесь\n-- Например: SELECT имя, алиби FROM подозреваемые WHERE время_преступления = '21:00';"
                  spellCheck="false"
                  disabled={isChecking}
                />
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={checkSolution}
                  disabled={isChecking || isSolved}
                  className={`px-5 py-2.5 rounded-lg font-medium transition ${
                    isChecking || isSolved
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isChecking ? 'Проверка...' : isSolved ? 'Уже решено' : 'Проверить догадку'}
                </button>
                <button
                  onClick={() => setShowHint(!showHint)}
                  disabled={isChecking}
                  className={`px-5 py-2.5 rounded-lg font-medium transition ${
                    isChecking
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                </button>
                <button
                  onClick={() => {
                    setQuery(caseData.correct_query);
                    setShowSolution(true);
                  }}
                  disabled={isChecking}
                  className={`px-5 py-2.5 rounded-lg font-medium transition ${
                    isChecking
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  Раскрыть дело
                </button>
              </div>

              {showHint && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">💡 Подсказка:</h3>
                  <p className="text-yellow-700">{getHint()}</p>
                </div>
              )}

              {result && (
                <div className={`p-4 rounded-lg border ${
                  result.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 
                  'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <pre className="whitespace-pre-wrap">{result}</pre>
                </div>
              )}
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 font-detective">Официальный протокол допроса</h2>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="mb-4 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg"
              >
                {showSolution ? 'Скрыть решение' : 'Показать решение'}
              </button>
              
              {showSolution && (
                <div className="font-mono text-sm bg-amber-50 p-4 rounded border border-amber-100 overflow-x-auto">
                  <pre>{caseData.correct_query}</pre>
                </div>
              )}
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 font-detective">Следующие шаги</h2>
              <div className="space-y-3">
                {isSolved && nextCaseId ? (
                  <Link
                    href={`/case/${nextCaseId}`}
                    className="block w-full text-center py-3 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                  >
                    Следующее дело →
                  </Link>
                ) : isSolved ? (
                  <div className="text-center py-3 bg-green-100 text-green-800 rounded-lg">
                    🎉 Поздравляем! Вы завершили все кейсы!
                  </div>
                ) : (
                  <div className="text-center py-3 bg-amber-100 text-amber-800 rounded-lg">
                    🔍 Решите текущий кейс, чтобы перейти к следующему
                  </div>
                )}
                
                <Link
                  href="/cases"
                  className="block w-full text-center py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium transition"
                >
                  Вернуться в архив дел
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}