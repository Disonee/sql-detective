export default function HelpPage() {
  const sqlCommands = [
    { command: 'SELECT', description: 'Выбор данных из таблиц' },
    { command: 'FROM', description: 'Указание таблицы для выборки' },
    { command: 'WHERE', description: 'Фильтрация записей по условию' },
    { command: 'JOIN', description: 'Соединение таблиц по общим полям' },
    { command: 'INNER JOIN', description: 'Внутреннее соединение таблиц' },
    { command: 'LEFT JOIN', description: 'Левое внешнее соединение' },
    { command: 'GROUP BY', description: 'Группировка результатов' },
    { command: 'ORDER BY', description: 'Сортировка результатов' },
    { command: 'HAVING', description: 'Фильтрация сгруппированных результатов' },
    { command: 'LIMIT', description: 'Ограничение количества результатов' },
    { command: 'DISTINCT', description: 'Удаление дубликатов' },
    { command: 'COUNT()', description: 'Подсчет количества записей' },
    { command: 'SUM()', description: 'Сумма значений' },
    { command: 'AVG()', description: 'Среднее значение' },
    { command: 'MIN() / MAX()', description: 'Минимальное/максимальное значение' },
  ];

  return (
    <main className="min-h-screen bg-amber-50 text-amber-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold font-detective mb-6">Помощь</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white border border-amber-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 font-detective">Справочные материалы</h2>
            <p className="text-amber-700 mb-4">
              Основные SQL-команды для работы с базами данных:
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {sqlCommands.map((item, index) => (
                <div key={index} className="flex items-start gap-3 py-2 border-b border-amber-100 last:border-0">
                  <code className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded min-w-[120px]">
                    {item.command}
                  </code>
                  <span className="text-amber-700">{item.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 font-detective">Советы детектива</h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-bold text-amber-800 mb-2">1. Начните с простого</h3>
                <p className="text-amber-700">
                  Используйте SELECT * FROM таблица для просмотра всех данных, прежде чем писать сложные запросы.
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-bold text-amber-800 mb-2">2. Проверяйте структуру</h3>
                <p className="text-amber-700">
                  Изучите схему базы данных перед составлением запроса. Знание полей таблиц — ключ к успеху.
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-bold text-amber-800 mb-2">3. Используйте подсказки</h3>
                <p className="text-amber-700">
                  Каждое дело содержит подсказки. Не стесняйтесь ими пользоваться, если застряли.
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-bold text-amber-800 mb-2">4. Практикуйтесь</h3>
                <p className="text-amber-700">
                  Чем больше дел вы раскроете, тем лучше освоите SQL. Начинайте с простых дел и постепенно повышайте сложность.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}