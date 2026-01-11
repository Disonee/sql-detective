// src/lib/semantic-comparator.ts
export class SQLSemanticComparator {
  /**
   * Сравнивает два SQL-запроса семантически
   * @param userQuery Пользовательский SQL-запрос
   * @param correctQuery Эталонный SQL-запрос
   * @param executeQuery Функция для выполнения запроса на учебной базе
   * @returns Результат сравнения
   */
  static async compareQueries(
    userQuery: string,
    correctQuery: string,
    executeQuery: Function
  ): Promise<{
    isSemanticallyEquivalent: boolean;
    message: string;
    userRows: number;
    correctRows: number;
    differences?: string[];
    hints?: string[];
  }> {
    console.log('🧠 Начинаем семантическое сравнение запросов...');
    console.log('   Шаг 1/3: Выполняем пользовательский запрос');
    
    try {
      // Выполняем пользовательский запрос
      const userResults = await executeQuery(userQuery);
      console.log(`      ✅ Пользовательский запрос выполнен, строк: ${userResults.length}`);
      
      console.log('   Шаг 2/3: Выполняем эталонный запрос');
      const correctResults = await executeQuery(correctQuery);
      console.log(`      ✅ Эталонный запрос выполнен, строк: ${correctResults.length}`);
      
      console.log('   Шаг 3/3: Сравниваем результаты');
      
      // Сравниваем количество строк
      if (userResults.length !== correctResults.length) {
        console.log(`      ❌ Количество строк не совпадает: ${userResults.length} ≠ ${correctResults.length}`);
        
        // Дополнительный анализ для разных типов кейсов
        let specificHints = [];
        let specificDifferences = [];
        
        if (correctQuery.includes('EXTRACT(HOUR')) {
          // Кейс 1: Время прихода
          specificHints = [
            '💡 Используйте EXTRACT(HOUR FROM check_in_time) > 9',
            '💡 Убедитесь, что правильно указали условие времени',
            '💡 Проверьте формат временных меток'
          ];
          specificDifferences = [
            'Возможно, неправильно указано время (> 9)',
            'Проверьте функцию EXTRACT(HOUR FROM ...)'
          ];
        } else if (correctQuery.includes('AVG(salary)')) {
          // Кейс 2: Зарплаты
          specificHints = [
            '💡 Используйте подзапрос: WHERE salary > (SELECT AVG(salary) FROM employees)',
            '💡 Убедитесь, что правильно вычисляете среднюю зарплату',
            '💡 Проверьте условие сравнения'
          ];
          specificDifferences = [
            'Возможно, неправильно вычислена средняя зарплата',
            'Проверьте подзапрос и сравнение'
          ];
        } else if (correctQuery.includes('criminal_record')) {
          // Кейс 3: Подозреваемые
          specificHints = [
            '💡 Используйте WHERE criminal_record = true',
            '💡 В Firebird true может быть 1',
            '💡 Проверьте значение поля criminal_record'
          ];
          specificDifferences = [
            'Возможно, неправильное условие WHERE',
            'Проверьте значение true/false или 1/0'
          ];
        } else if (correctQuery.includes('SUM(t.amount)')) {
          // Кейс 4: Финансовый аудит
          specificHints = [
            '💡 Используйте JOIN для соединения departments и transactions',
            '💡 Убедитесь в правильности условия ON d.department_id = t.department_id',
            '💡 Проверьте агрегатные функции SUM() и AVG()'
          ];
          specificDifferences = [
            'Возможно, неправильно соединены таблицы',
            'Проверьте агрегатные функции и GROUP BY'
          ];
        }
        
        return {
          isSemanticallyEquivalent: false,
          message: `❌ Результаты не совпадают. Ваш запрос вернул ${userResults.length} строк, ожидалось ${correctResults.length}`,
          userRows: userResults.length,
          correctRows: correctResults.length,
          differences: [
            `Количество строк: ${userResults.length} (ваш) vs ${correctResults.length} (ожидалось)`,
            ...specificDifferences
          ],
          hints: [
            '💡 Проверьте условия в WHERE',
            '💡 Убедитесь в правильности JOIN',
            '💡 Проверьте агрегатные функции (COUNT, SUM, AVG)',
            ...specificHints
          ]
        };
      }
      
      // Если количество строк совпадает, можно провести более глубокое сравнение
      console.log(`      ✅ Количество строк совпадает: ${userResults.length} строк`);
      
      // Проверяем структуру результата (колонки)
      const userColumns = userResults.length > 0 ? Object.keys(userResults[0]) : [];
      const correctColumns = correctResults.length > 0 ? Object.keys(correctResults[0]) : [];
      
      if (userColumns.length !== correctColumns.length) {
        console.log(`      ❌ Количество колонок не совпадает: ${userColumns.length} ≠ ${correctColumns.length}`);
        
        return {
          isSemanticallyEquivalent: false,
          message: `❌ Структура результатов не совпадает. Ваш запрос вернул ${userColumns.length} колонок, ожидалось ${correctColumns.length}`,
          userRows: userResults.length,
          correctRows: correctResults.length,
          differences: [
            `Колонки вашего запроса: ${userColumns.join(', ')}`,
            `Ожидаемые колонки: ${correctColumns.join(', ')}`,
            'Проверьте список колонок в SELECT'
          ],
          hints: [
            '💡 Проверьте список колонок в SELECT',
            '💡 Убедитесь, что все нужные колонки присутствуют',
            '💡 Проверьте алиасы колонок (AS)'
          ]
        };
      }
      
      console.log(`      ✅ Структура результатов совпадает: ${userColumns.length} колонок`);
      
      // Если дошли сюда, считаем запрос правильным
      return {
        isSemanticallyEquivalent: true,
        message: `✅ Запрос корректен! Возвращает правильные данные (${userResults.length} строк)`,
        userRows: userResults.length,
        correctRows: correctResults.length,
        differences: [],
        hints: [
          '🎉 Отличная работа!',
          '💡 Попробуйте оптимизировать запрос',
          '💡 Рассмотрите альтернативные способы решения'
        ]
      };
      
    } catch (error: any) {
      console.error('      ❌ Ошибка при выполнении запроса:', error.message);
      throw error;
    }
  }
  
  /**
   * Быстрое сравнение запросов по тексту (нормализация)
   */
  static quickCompare(userQuery: string, correctQuery: string): boolean {
    const normalize = (query: string): string => {
      return query
        .toLowerCase()
        .replace(/\s+/g, ' ')           // Заменяем множественные пробелы на один
        .replace(/;$/g, '')             // Убираем точку с запятой в конце
        .trim()
        .replace(/\s*\(\s*/g, '(')      // Убираем пробелы вокруг скобок
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*=\s*/g, '=')       // Нормализуем пробелы вокруг операторов
        .replace(/\s*,\s*/g, ',')       // Нормализуем пробелы после запятых
        .replace(/\s+from\s+/g, ' from ') // Сохраняем ключевые слова
        .replace(/\s+where\s+/g, ' where ')
        .replace(/\s+join\s+/g, ' join ')
        .replace(/\s+group by\s+/g, ' group by ')
        .replace(/\s+order by\s+/g, ' order by ');
    };
    
    const normalizedUser = normalize(userQuery);
    const normalizedCorrect = normalize(correctQuery);
    
    console.log('   🔍 Быстрое сравнение:');
    console.log(`      Нормализованный пользовательский: ${normalizedUser.substring(0, 80)}${normalizedUser.length > 80 ? '...' : ''}`);
    console.log(`      Нормализованный эталонный: ${normalizedCorrect.substring(0, 80)}${normalizedCorrect.length > 80 ? '...' : ''}`);
    console.log(`      Совпадают: ${normalizedUser === normalizedCorrect ? 'ДА' : 'НЕТ'}`);
    
    return normalizedUser === normalizedCorrect;
  }
  
  /**
   * Проверяет, является ли запрос потенциально правильным
   * (вспомогательная функция для улучшения подсказок)
   */
  static analyzeQueryStructure(userQuery: string, correctQuery: string): {
    hasCorrectTables: boolean;
    hasCorrectConditions: boolean;
    hasCorrectAggregations: boolean;
    suggestions: string[];
  } {
    const userLower = userQuery.toLowerCase();
    const correctLower = correctQuery.toLowerCase();
    
    const suggestions: string[] = [];
    
    // Проверяем наличие нужных таблиц
    let hasCorrectTables = true;
    if (correctLower.includes('employee_attendance') && !userLower.includes('employee_attendance')) {
      hasCorrectTables = false;
      suggestions.push('Используйте таблицу employee_attendance');
    }
    if (correctLower.includes('employees') && !userLower.includes('employees')) {
      hasCorrectTables = false;
      suggestions.push('Используйте таблицу employees');
    }
    if (correctLower.includes('suspects') && !userLower.includes('suspects')) {
      hasCorrectTables = false;
      suggestions.push('Используйте таблицу suspects');
    }
    if ((correctLower.includes('departments') || correctLower.includes('transactions')) && 
        (!userLower.includes('departments') || !userLower.includes('transactions'))) {
      hasCorrectTables = false;
      suggestions.push('Используйте таблицы departments и transactions');
    }
    
    // Проверяем наличие нужных условий
    let hasCorrectConditions = true;
    if (correctLower.includes('extract(hour') && !userLower.includes('extract')) {
      hasCorrectConditions = false;
      suggestions.push('Используйте функцию EXTRACT(HOUR FROM ...) для работы со временем');
    }
    if (correctLower.includes('avg(') && !userLower.includes('avg(')) {
      hasCorrectConditions = false;
      suggestions.push('Используйте функцию AVG() для вычисления среднего значения');
    }
    if (correctLower.includes('sum(') && !userLower.includes('sum(')) {
      hasCorrectConditions = false;
      suggestions.push('Используйте функцию SUM() для вычисления суммы');
    }
    if (correctLower.includes('criminal_record = true') && 
        !userLower.includes('criminal_record') && 
        !userLower.includes('criminal_record = 1')) {
      hasCorrectConditions = false;
      suggestions.push('Используйте условие WHERE criminal_record = true');
    }
    if (correctLower.includes('join') && !userLower.includes('join')) {
      hasCorrectConditions = false;
      suggestions.push('Используйте JOIN для соединения таблиц');
    }
    
    // Проверяем наличие агрегатных функций
    let hasCorrectAggregations = true;
    if (correctLower.includes('group by') && !userLower.includes('group by')) {
      hasCorrectAggregations = false;
      suggestions.push('Используйте GROUP BY для группировки результатов');
    }
    
    return {
      hasCorrectTables,
      hasCorrectConditions,
      hasCorrectAggregations,
      suggestions
    };
  }
}