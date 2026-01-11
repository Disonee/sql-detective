// C:\projects\sqlnoir\src\app\api\validate-query\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeTrainingQuery, getCaseById, saveUserSolution } from '@/lib/database';
import { SQLSemanticComparator } from '@/lib/semantic-comparator';

export async function POST(request: NextRequest) {
  console.log('🔍 API /api/validate-query вызван');
  
  try {
    const body = await request.json();
    const { caseId, userQuery } = body;
    
    console.log(`📥 Данные: caseId=${caseId}, userQuery=${userQuery?.substring(0, 50)}...`);
    
    if (!caseId || !userQuery) {
      return NextResponse.json({
        success: false,
        isCorrect: false,
        message: 'Отсутствуют обязательные поля: caseId и userQuery',
        isError: true
      }, { status: 400 });
    }
    
    // 1. Получаем эталонный запрос
    const caseData = await getCaseById(Number(caseId));
    if (!caseData) {
      return NextResponse.json({
        success: false,
        isCorrect: false,
        message: `Кейс с ID ${caseId} не найден`,
        isError: true
      }, { status: 404 });
    }
    
    const correctQuery = caseData.correct_query;
    console.log(`📋 Эталонный запрос: ${correctQuery}`);
    console.log(`📊 Длина пользовательского запроса: ${userQuery.length} символов`);
    console.log(`📊 Длина эталонного запроса: ${correctQuery.length} символов`);
    
    // 2. Быстрая проверка (для обратной совместимости)
    console.log('🔍 Быстрая проверка (точное совпадение)...');
    const isQuickMatch = false; // SQLSemanticComparator.quickCompare(userQuery, correctQuery);
    
    if (isQuickMatch) {
      console.log('✅ Быстрое сравнение: запросы идентичны после нормализации');
      
      await saveUserSolution(Number(caseId), userQuery, true);
      
      return NextResponse.json({
        success: true,
        isCorrect: true,
        message: '✅ Запрос корректен! (точное совпадение с эталонным)',
        comparisonType: 'quick',
        details: {
          userQuery: userQuery,
          correctQuery: correctQuery,
          userRows: 0,
          correctRows: 0,
          normalizationApplied: true
        }
      });
    }
    
    console.log('⚠️ Быстрое сравнение не прошло, переходим к семантическому');
    
    // 3. Пробуем семантическое сравнение
    console.log('🔍 Пробуем семантическое сравнение...');
    console.log('   Подключаемся к учебной базе SQLNOIR_DATA.FDB');
    
    try {
      // Выполняем семантическое сравнение
      const comparison = await SQLSemanticComparator.compareQueries(
        userQuery,
        correctQuery,
        executeTrainingQuery
      );
      
      console.log('📊 Результаты семантического сравнения:');
      console.log(`   - Эквивалентны: ${comparison.isSemanticallyEquivalent ? 'ДА' : 'НЕТ'}`);
      console.log(`   - Сообщение: ${comparison.message}`);
      console.log(`   - Строк пользовательского запроса: ${comparison.userRows || 0}`);
      console.log(`   - Строк эталонного запроса: ${comparison.correctRows || 0}`);
      
      if (comparison.differences && comparison.differences.length > 0) {
        console.log('   - Различия:');
        comparison.differences.forEach((diff, idx) => {
          console.log(`     ${idx + 1}. ${diff}`);
        });
      }
      
      // 4. Сохраняем решение
      await saveUserSolution(Number(caseId), userQuery, comparison.isSemanticallyEquivalent);
      
      // 5. Формируем расширенный ответ с деталями
      const response = {
        success: true,
        isCorrect: comparison.isSemanticallyEquivalent,
        message: comparison.message,
        comparisonType: 'semantic',
        details: {
          userQuery: userQuery,
          correctQuery: correctQuery,
          userRows: comparison.userRows || 0,
          correctRows: comparison.correctRows || 0,
          rowDifference: Math.abs((comparison.userRows || 0) - (comparison.correctRows || 0)),
          differences: comparison.differences || [],
          hints: comparison.hints || [],
          timestamp: new Date().toISOString(),
          caseId: Number(caseId)
        }
      };
      
      console.log('📤 Отправляем ответ клиенту:');
      console.log(`   - Правильный: ${response.isCorrect ? 'ДА' : 'НЕТ'}`);
      console.log(`   - Тип сравнения: ${response.comparisonType}`);
      console.log(`   - Количество различий: ${response.details.differences.length}`);
      
      return NextResponse.json(response);
      
    } catch (trainingDbError: any) {
      // Если учебная БД недоступна или ошибка в запросе
      console.error('❌ Ошибка при работе с учебной БД:');
      console.error('   Сообщение:', trainingDbError.message);
      console.error('   Стек:', trainingDbError.stack);
      
      let errorMessage = '❌ Ошибка при выполнении запроса';
      let differences = [`Ошибка выполнения: ${trainingDbError.message}`];
      let hints = [
        '💡 Проверьте синтаксис SQL-запроса',
        '💡 Убедитесь, что все скобки закрыты',
        '💡 Не забудьте точку с запятой в конце'
      ];
      
      // Анализируем тип ошибки для более точных подсказок
      if (trainingDbError.message.includes('Unexpected end of command')) {
        errorMessage = '❌ Ошибка синтаксиса SQL: неожиданный конец команды';
        differences = [
          'Возможно, не хватает закрывающей скобки )',
          'Или условия (например, > 9)',
          'Или точки с запятой в конце ;',
          'Или кавычек вокруг строкового значения'
        ];
      } else if (trainingDbError.message.includes('Table unknown')) {
        errorMessage = '❌ Ошибка: таблица не найдена в учебной базе';
        differences = [
          'Учебная база данных может не содержать нужных таблиц',
          'Проверьте правильность имен таблиц в запросе',
          'Попробуйте использовать другие таблицы из схемы'
        ];
        hints.push('💡 Проверьте названия таблиц в разделе "Структура базы данных"');
      } else if (trainingDbError.message.includes('Column unknown')) {
        errorMessage = '❌ Ошибка: колонка не найдена в таблице';
        differences = [
          'Указанная колонка отсутствует в таблице',
          'Проверьте правильность имени колонки',
          'Убедитесь, что таблица содержит эту колонку'
        ];
        hints.push('💡 Проверьте названия колонок в разделе "Структура базы данных"');
      } else if (trainingDbError.message.includes('Your user name and password are not defined')) {
        errorMessage = '❌ Ошибка подключения к учебной базе';
        differences = [
          'Проверьте настройки подключения в файле .env.local',
          'Убедитесь, что база данных SQLNOIR_DATA.FDB существует',
          'Проверьте правильность логина и пароля'
        ];
        hints = [
          '💡 Убедитесь, что файл .env.local содержит правильные настройки',
          '💡 Проверьте, существует ли база данных по указанному пути',
          '💡 Убедитесь, что Firebird сервер запущен'
        ];
      } else if (trainingDbError.message.includes('Dynamic SQL Error')) {
        errorMessage = '❌ Ошибка выполнения SQL-запроса';
        differences = [
          'Возможно, неверный синтаксис SQL',
          'Проверьте правильность операторов',
          'Убедитесь в корректности условий'
        ];
      }
      
      // Сохраняем как неверное решение
      await saveUserSolution(Number(caseId), userQuery, false);
      
      console.log(`💾 Сохранено как неправильное решение для кейса ${caseId}`);
      
      return NextResponse.json({
        success: true,
        isCorrect: false,
        message: errorMessage,
        comparisonType: 'error',
        details: {
          errorType: 'training_database_error',
          errorMessage: trainingDbError.message,
          differences,
          hints,
          timestamp: new Date().toISOString(),
          userQuery: userQuery,
          correctQuery: correctQuery
        }
      });
    }
    
  } catch (error: any) {
    console.error('❌ Критическая ошибка в /api/validate-query:');
    console.error('   Сообщение:', error.message);
    console.error('   Стек:', error.stack);
    console.error('   Входные данные:', request.body ? 'есть' : 'отсутствуют');
    
    return NextResponse.json({
      success: false,
      isCorrect: false,
      message: `Внутренняя ошибка сервера: ${error.message}`,
      isError: true,
      comparisonType: 'critical_error',
      details: {
        errorType: 'server_error',
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      },
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}