import { getAllCases } from '@/lib/database';
import Link from 'next/link';
import ProgressStats from '@/components/ProgressStats';
import ProgressByCategory from '@/components/ProgressByCategory';
import ResetProgressButton from '@/components/ResetProgressButton';
import CaseListFiltered from '@/components/CaseListFiltered';

export default async function CasesPage() {
  // Получаем дела из БД
  const cases = await getAllCases();
  
  console.log('📊 Загружено дел из БД:', cases.length);
  console.log('📊 Пример дела:', cases[0]);
  
  // Если дел нет, показываем сообщение
  if (cases.length === 0) {
    return (
      <main className="min-h-screen bg-amber-50 text-amber-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-6"
          >
            ← Вернуться на главную
          </Link>
          
          <div className="bg-white border border-amber-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold font-detective mb-2">База данных пуста</h1>
            <p className="text-amber-700 mb-4">
              В базе данных пока нет дел для расследования.
            </p>
            <p className="text-sm text-amber-600">
              Проверьте подключение к базе данных или добавьте дела через административную панель.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block px-6 py-3 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-medium transition"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Подготовим данные для компонентов
  const casesForStats = cases.map(c => ({ id: c.id, difficulty: c.difficulty }));
  
  // Подготовим данные для списка дел
  const casesForList = cases.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    category: c.category,
    short_description: c.short_description || c.description.substring(0, 100),
  }));

  return (
    <main className="min-h-screen bg-amber-50 text-amber-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок и кнопка возврата */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-4"
              >
                ← Вернуться на главную
              </Link>
              <h1 className="text-4xl font-bold font-detective mb-2">Архив дел</h1>
              <p className="text-amber-700">
                Выберите дело для расследования. Каждый кейс поможет освоить новую концепцию SQL.
              </p>
            </div>
          </div>

          {/* Прогресс и статистика */}
          <ProgressStats totalCases={cases.length} cases={casesForStats} />
        </header>

        {/* Фильтр и список дел */}
        <CaseListFiltered cases={casesForList} />

        {/* Прогресс по категориям */}
        <ProgressByCategory 
          beginnerCases={cases.filter(c => c.difficulty === 'Начинающий').length}
          advancedCases={cases.filter(c => c.difficulty === 'Продвинутый').length}
          expertCases={cases.filter(c => c.difficulty === 'Эксперт').length}
          cases={casesForStats}
        />

        {/* Кнопка возврата и сброса прогресса */}
        <div className="mt-8 pt-6 border-t border-amber-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 text-center px-6 py-3 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-medium transition"
            >
              ← Вернуться на главную
            </Link>
            <ResetProgressButton />
          </div>
          <div className="mt-4 text-xs text-amber-600 text-center">
            Прогресс сохраняется в вашем браузере. Для продолжения расследований используйте то же устройство.
          </div>
        </div>
      </div>
    </main>
  );
}