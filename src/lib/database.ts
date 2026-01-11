// lib/database.ts - ИСПРАВЛЕННАЯ И ДОПОЛНЕННАЯ ВЕРСИЯ

const firebird = require('node-firebird');

// Конфигурация основной базы данных (MYDB.FDB)
const getDbConfig = () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3050'),
    database: process.env.DB_NAME || 'C:/RedData/MYDB.FDB',
    user: process.env.DB_USER || 'SYSDBA',
    password: process.env.DB_PASSWORD || '1234',
    charset: process.env.DB_CHARSET || 'UTF-8',
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
    wireCrypt: false,
    blobAsText: true
  };
  
  // Проверка и логирование конфигурации
  if (!config.user || !config.password) {
    console.warn('⚠️ Пользователь или пароль не заданы, использую значения по умолчанию');
    config.user = 'SYSDBA';
    config.password = '1234';
  }
  
  return config;
};

// Конфигурация учебной базы данных (SQLNOIR_DATA.FDB)
const getTrainingDbConfig = () => {
  const config = {
    host: process.env.TRAINING_DB_HOST || 'localhost',
    port: parseInt(process.env.TRAINING_DB_PORT || '3050'),
    database: process.env.TRAINING_DB_NAME || 'C:/RedData/SQLNOIR_DATA.FDB',
    user: process.env.TRAINING_DB_USER || 'SYSDBA',
    password: process.env.TRAINING_DB_PASSWORD || '1234',
    charset: process.env.TRAINING_DB_CHARSET || 'UTF-8',
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
    wireCrypt: false,
    blobAsText: true
  };
  
  console.log('📚 Конфигурация учебной БД:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password ? '***установлен***' : '❌ отсутствует'
  });
  
  return config;
};

export interface FormattedCase {
  id: number;
  title: string;
  description: string;
  short_description: string;
  task: string;
  schema: string[];
  schema_text: string;
  difficulty: string;
  correct_query: string;
  explanation: string;
  category: string;
  slug: string;
  views_count: number;
  completed_count: number;
}

// Функция для безопасного выполнения запросов на основной базе
export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const dbConfig = getDbConfig();
  
  return new Promise((resolve, reject) => {
    firebird.attach(dbConfig, (err: any, db: any) => {
      if (err) {
        console.error('❌ Ошибка подключения:', err.message);
        console.error('Конфигурация БД использовалась:', {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user,
          password: dbConfig.password ? '***установлен***' : '❌ отсутствует'
        });
        reject(new Error(`Ошибка подключения: ${err.message}`));
        return;
      }

      db.query(sql, params, (err: any, result: T[]) => {
        db.detach();
        if (err) {
          console.error('❌ Ошибка запроса:', err.message);
          console.error('SQL:', sql);
          reject(new Error(`Ошибка запроса: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });
  });
}

// НОВАЯ ФУНКЦИЯ: выполнение запросов на учебной базе
export async function executeTrainingQuery<T = any>(
  sql: string, 
  params: any[] = []
): Promise<T[]> {
  const dbConfig = getTrainingDbConfig();
  
  return new Promise((resolve, reject) => {
    firebird.attach(dbConfig, (err: any, db: any) => {
      if (err) {
        console.error('❌ Ошибка подключения к учебной базе:', err.message);
        reject(new Error(`Ошибка подключения к учебной базе: ${err.message}`));
        return;
      }

      db.query(sql, params, (err: any, result: T[]) => {
        db.detach();
        if (err) {
          console.error('❌ Ошибка запроса на учебной базе:', err.message);
          console.error('SQL:', sql);
          reject(new Error(`Ошибка запроса: ${err.message}`));
        } else {
          console.log(`✅ Запрос выполнен на учебной базе, строк: ${result?.length || 0}`);
          resolve(result || []);
        }
      });
    });
  });
}

export async function testConnection() {
  try {
    const result = await executeQuery<{ TEST: number }>('SELECT 1 as TEST FROM RDB$DATABASE');
    return { 
      success: true, 
      message: '✅ Подключение к Red Database успешно установлено' 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: `❌ Ошибка подключения: ${error.message}` 
    };
  }
}

// Получить все кейсы
export async function getAllCases(): Promise<FormattedCase[]> {
  console.log('🔄 Загрузка кейсов из БД...');
  
  try {
    const cases = await executeQuery<any>(`
      SELECT 
        ID, 
        TITLE, 
        DESCRIPTION,
        TASK,
        SCHEMA_TEXT,
        DIFFICULTY,
        CATEGORY,
        CORRECT_SOLUTION,
        EXPLANATION_TEXT,
        VIEWS_COUNT,
        COMPLETED_COUNT
      FROM CASES 
      ORDER BY ID
    `);

    console.log(`✅ Найдено кейсов: ${cases.length}`);
    
    return cases.map((c: any) => formatDbCase(c));
    
  } catch (error: any) {
    console.error('❌ Ошибка при загрузке кейсов:', error.message);
    return [];
  }
}

// Получить кейс по ID
export async function getCaseById(id: number): Promise<FormattedCase | null> {
  try {
    // Увеличиваем счетчик просмотров
    await incrementCaseViews(id);

    const cases = await executeQuery<any>(
      `SELECT * FROM CASES WHERE ID = ?`,
      [id]
    );

    if (cases.length === 0) {
      console.log(`⚠️ Кейс с ID ${id} не найден`);
      return null;
    }
    
    return formatDbCase(cases[0]);
    
  } catch (error: any) {
    console.error(`❌ Ошибка при загрузке кейса ${id}:`, error.message);
    return null;
  }
}

// Получить общее количество кейсов
export async function getTotalCasesCount(): Promise<number> {
  try {
    const result = await executeQuery<{ COUNT: number }>('SELECT COUNT(*) as COUNT FROM CASES');
    return result[0]?.COUNT || 0;
  } catch (error: any) {
    console.error('❌ Ошибка при получении количества дел:', error.message);
    return 0;
  }
}

// Получить количество кейсов по уровням сложности
export async function getCasesCountByDifficulty(): Promise<{ [key: string]: number }> {
  try {
    const result = await executeQuery<any>(
      `SELECT DIFFICULTY, COUNT(*) as COUNT FROM CASES GROUP BY DIFFICULTY`
    );
    
    const counts: { [key: string]: number } = {};
    
    result.forEach((row: any) => {
      const diff = formatDifficulty(row.DIFFICULTY);
      if (!counts[diff]) {
        counts[diff] = 0;
      }
      counts[diff] += Number(row.COUNT) || 0;
    });
    
    // Гарантируем наличие всех ключей
    if (!counts['Начинающий']) counts['Начинающий'] = 0;
    if (!counts['Продвинутый']) counts['Продвинутый'] = 0;
    if (!counts['Эксперт']) counts['Эксперт'] = 0;
    
    return counts;
  } catch (error: any) {
    console.error('❌ Ошибка при получении количества дел по уровням:', error.message);
    return { 'Начинающий': 0, 'Продвинутый': 0, 'Эксперт': 0 };
  }
}

// Получить следующий ID кейса
export async function getNextCaseId(currentId: number): Promise<number | null> {
  try {
    console.log(`🔍 Поиск следующего кейса после ID: ${currentId}`);
    
    const result = await executeQuery<{ NEXT_ID: number }>(
      `SELECT MIN(ID) as NEXT_ID FROM CASES WHERE ID > ?`,
      [currentId]
    );
    
    const nextId = result[0]?.NEXT_ID || null;
    console.log(`🔍 Следующий ID кейса: ${nextId}`);
    return nextId;
    
  } catch (error: any) {
    console.error('❌ Ошибка при поиске следующего кейса:', error.message);
    // Возвращаем логический следующий ID в случае ошибки
    const totalCount = await getTotalCasesCount();
    if (currentId < totalCount) return currentId + 1;
    return null;
  }
}

// Увеличить счетчик просмотров
export async function incrementCaseViews(caseId: number): Promise<void> {
  try {
    await executeQuery(
      'UPDATE CASES SET VIEWS_COUNT = COALESCE(VIEWS_COUNT, 0) + 1 WHERE ID = ?',
      [caseId]
    );
    console.log(`📊 Увеличен счетчик просмотров для кейса ${caseId}`);
  } catch (error: any) {
    console.error(`❌ Ошибка при увеличении счетчика просмотров для кейса ${caseId}:`, error.message);
  }
}

// Сохранить решение пользователя
// Сохранить решение пользователя (УПРОЩЕННАЯ ВЕРСИЯ)
export async function saveUserSolution(
  caseId: number, 
  userQuery: string, 
  isCorrect: boolean
): Promise<void> {
  try {
    console.log(`💾 Сохраняю решение для кейса ${caseId}: ${isCorrect ? 'ПРАВИЛЬНО' : 'НЕПРАВИЛЬНО'}`);
    
    // Обрезаем запрос если слишком длинный
    const truncatedQuery = userQuery.length > 3900 ? userQuery.substring(0, 3900) + '...' : userQuery;
    
    try {
      // Пробуем вставить без указания ID (автоинкремент сам сгенерирует)
      await executeQuery(
        `INSERT INTO USER_SOLUTIONS (CASE_ID, USER_QUERY, IS_CORRECT, CREATED_AT) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [caseId, truncatedQuery, isCorrect ? 1 : 0]
      );
      
      console.log(`✅ Решение сохранено в USER_SOLUTIONS`);
      
    } catch (tableError: any) {
      console.warn(`⚠️ Ошибка при сохранении: ${tableError.message}`);
      
      // Альтернативная попытка: получим максимальный ID вручную
      try {
        const maxIdResult = await executeQuery<{ MAX_ID: number }>(
          'SELECT MAX(ID) as MAX_ID FROM USER_SOLUTIONS'
        );
        const nextId = (maxIdResult[0]?.MAX_ID || 0) + 1;
        
        await executeQuery(
          `INSERT INTO USER_SOLUTIONS (ID, CASE_ID, USER_QUERY, IS_CORRECT, CREATED_AT) 
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [nextId, caseId, truncatedQuery, isCorrect ? 1 : 0]
        );
        
        console.log(`✅ Решение сохранено с ручным ID=${nextId}`);
      } catch (secondError: any) {
        console.warn(`⚠️ Вторая попытка также не удалась: ${secondError.message}`);
      }
    }
    
    // Если решение правильное, увеличиваем счетчик завершений
    if (isCorrect) {
      try {
        await executeQuery(
          'UPDATE CASES SET COMPLETED_COUNT = COALESCE(COMPLETED_COUNT, 0) + 1 WHERE ID = ?',
          [caseId]
        );
        console.log(`📈 Увеличен COMPLETED_COUNT для кейса ${caseId}`);
      } catch (updateError: any) {
        console.warn(`⚠️ Не удалось обновить COMPLETED_COUNT: ${updateError.message}`);
      }
    }
    
  } catch (error: any) {
    console.error(`❌ Общая ошибка при сохранении решения:`, error.message);
  }
}
// Получить прогресс пользователя
export async function getUserProgress(): Promise<{
  totalCases: number;
  solvedCases: number;
  progressPercentage: number;
  byDifficulty: { [key: string]: { total: number, solved: number, percentage: number } };
}> {
  try {
    const allCases = await getAllCases();
    const totalCases = allCases.length;
    
    // Здесь можно добавить логику получения решенных дел из USER_SOLUTIONS
    // Временная заглушка - возвращаем базовые значения
    const solvedCases = 0;
    
    // Считаем по уровням сложности
    const byDifficulty: { [key: string]: { total: number, solved: number, percentage: number } } = {
      'Начинающий': { total: 0, solved: 0, percentage: 0 },
      'Продвинутый': { total: 0, solved: 0, percentage: 0 },
      'Эксперт': { total: 0, solved: 0, percentage: 0 }
    };
    
    // Подсчет по уровням
    allCases.forEach(caseItem => {
      const difficulty = caseItem.difficulty;
      if (byDifficulty[difficulty]) {
        byDifficulty[difficulty].total++;
      }
    });
    
    // Вычисляем проценты
    Object.keys(byDifficulty).forEach(diff => {
      const data = byDifficulty[diff];
      data.percentage = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
    });
    
    const progressPercentage = totalCases > 0 ? Math.round((solvedCases / totalCases) * 100) : 0;
    
    return {
      totalCases,
      solvedCases,
      progressPercentage,
      byDifficulty
    };
    
  } catch (error: any) {
    console.error('❌ Ошибка при получении прогресса:', error.message);
    return {
      totalCases: 0,
      solvedCases: 0,
      progressPercentage: 0,
      byDifficulty: {
        'Начинающий': { total: 0, solved: 0, percentage: 0 },
        'Продвинутый': { total: 0, solved: 0, percentage: 0 },
        'Эксперт': { total: 0, solved: 0, percentage: 0 }
      }
    };
  }
}

// Вспомогательные функции
function formatDbCase(dbCase: any): FormattedCase {
  return {
    id: Number(dbCase.ID) || 0,
    title: dbCase.TITLE || 'Без названия',
    description: dbCase.DESCRIPTION || dbCase.TASK || dbCase.TITLE || 'Описание отсутствует',
    short_description: (dbCase.DESCRIPTION || '').substring(0, 100) || dbCase.TITLE || 'Краткое описание',
    task: dbCase.TASK || 'Задача не указана',
    schema: dbCase.SCHEMA_TEXT ? 
      dbCase.SCHEMA_TEXT.split('\n').filter((line: string) => line.trim()) : [],
    schema_text: dbCase.SCHEMA_TEXT || '',
    difficulty: formatDifficulty(dbCase.DIFFICULTY),
    correct_query: dbCase.CORRECT_SOLUTION || getDefaultQuery(Number(dbCase.ID)),
    explanation: dbCase.EXPLANATION_TEXT || getDefaultExplanation(Number(dbCase.ID)),
    category: dbCase.CATEGORY || 'SQL Basics',
    slug: `case-${dbCase.ID}`,
    views_count: Number(dbCase.VIEWS_COUNT) || 0,
    completed_count: Number(dbCase.COMPLETED_COUNT) || 0
  };
}

// Форматирование сложности
function formatDifficulty(difficulty: any): string {
  if (!difficulty) return 'Начинающий';
  
  const diffStr = difficulty.toString().toLowerCase();
  
  if (diffStr.includes('beginner') || diffStr.includes('начинающий') || diffStr === '1') 
    return 'Начинающий';
  if (diffStr.includes('intermediate') || diffStr.includes('продвинут') || diffStr === '2') 
    return 'Продвинутый';
  if (diffStr.includes('expert') || diffStr.includes('эксперт') || diffStr === '3') 
    return 'Эксперт';
    
  return 'Начинающий';
}

// Дефолтные запросы на случай, если их нет в базе
function getDefaultQuery(id: number): string {
  switch(id) {
    case 1: return "SELECT * FROM employee_attendance WHERE EXTRACT(HOUR FROM check_in_time) > 9;";
    case 2: return "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);";
    case 3: return "SELECT * FROM suspects WHERE criminal_record = true;";
    case 4: return "SELECT d.department_name, SUM(t.amount) as total_amount, AVG(t.amount) as avg_amount FROM departments d JOIN transactions t ON d.department_id = t.department_id GROUP BY d.department_name;";
    default: return "SELECT * FROM RDB$DATABASE;";
  }
}

function getDefaultExplanation(id: number): string {
  switch(id) {
    case 1: return "Используйте функцию EXTRACT(HOUR FROM ...) для извлечения часа из временной метки.";
    case 2: return "Сначала найдите среднюю зарплату с помощью подзапроса, затем сравните зарплату каждого сотрудника с этим значением.";
    case 3: return "Фильтруйте записи по полю criminal_record для поиска подозреваемых с судимостью.";
    case 4: return "Объедините таблицы отделов и транзакций, сгруппируйте по отделам и вычислите общую сумму и средний размер транзакций.";
    default: return "Объяснение будет добавлено позже.";
  }
}

// УДАЛИТЬ весь блок с export default в конце файла
// И оставить только именованный экспорт:

// Экспорт всех функций (только один экспорт!)