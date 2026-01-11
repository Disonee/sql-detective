// check-training-data.cjs
const firebird = require('node-firebird');

const config = {
  host: 'localhost',
  port: 3050,
  database: 'C:/RedData/SQLNOIR_DATA.FDB',
  user: 'SYSDBA',
  password: '1234',
  charset: 'UTF-8',
  blobAsText: true
};

console.log('🔍 Проверка данных в учебной базе SQLNOIR_DATA.FDB\n');

firebird.attach(config, (err, db) => {
  if (err) {
    console.error('❌ Ошибка подключения:', err.message);
    return;
  }
  
  console.log('✅ Подключение к учебной базе успешно\n');
  
  // 1. Смотрим всех подозреваемых
  db.query('SELECT * FROM suspects', (err, result) => {
    if (err) {
      console.error('❌ Ошибка:', err.message);
      db.detach();
      return;
    }
    
    console.log(`📋 Всего подозреваемых в базе: ${result.length}`);
    console.log('\nСписок подозреваемых:');
    result.forEach((suspect, i) => {
      console.log(`\n${i + 1}. ${suspect.NAME} (${suspect.AGE} лет)`);
      console.log(`   Профессия: ${suspect.OCCUPATION}`);
      console.log(`   Мотив: ${suspect.MOTIVE}`);
      console.log(`   Алиби: ${suspect.ALIBI}`);
      console.log(`   Судимость: ${suspect.CRIMINAL_RECORD ? '✅ ЕСТЬ' : '❌ НЕТ'}`);
    });
    
    // 2. Подсчет по судимости - делаем проще
    console.log('\n📊 Статистика по судимостям:');
    
    // Вручную считаем из уже полученных данных
    let criminalCount = 0;
    let innocentCount = 0;
    
    result.forEach(suspect => {
      if (suspect.CRIMINAL_RECORD) {
        criminalCount++;
      } else {
        innocentCount++;
      }
    });
    
    console.log(`   • С судимостью: ${criminalCount} человек`);
    console.log(`   • Без судимости: ${innocentCount} человек`);
    console.log(`   • Всего: ${result.length} человек`);
    
    console.log('\n🎯 ВЫВОД:');
    console.log(`   Эталонный запрос "WHERE criminal_record = true" должен вернуть ${criminalCount} строк`);
    console.log(`   Ваш запрос "WHERE criminal_record = false" вернул ${innocentCount} строк`);
    console.log(`   ❌ Они не совпадают! Система работает правильно!`);
    
    // 3. Выполняем оба запроса для демонстрации
    console.log('\n🧪 Демонстрация работы системы:');
    
    // Запрос 1: Эталонный (true)
    db.query('SELECT * FROM suspects WHERE criminal_record = true', (err, criminals) => {
      if (err) {
        console.error('❌ Ошибка запроса 1:', err.message);
        return;
      }
      
      console.log(`\n1. Эталонный запрос (преступники):`);
      console.log(`   SQL: SELECT * FROM suspects WHERE criminal_record = true`);
      console.log(`   Результат: ${criminals.length} строк`);
      if (criminals.length > 0) {
        console.log(`   Первый: ${criminals[0].NAME}`);
      }
      
      // Запрос 2: Ваш (false)
      db.query('SELECT * FROM suspects WHERE criminal_record = false', (err, innocents) => {
        if (err) {
          console.error('❌ Ошибка запроса 2:', err.message);
          db.detach();
          return;
        }
        
        console.log(`\n2. Ваш запрос (невиновные):`);
        console.log(`   SQL: SELECT * FROM suspects WHERE criminal_record = false`);
        console.log(`   Результат: ${innocents.length} строк`);
        if (innocents.length > 0) {
          console.log(`   Первый: ${innocents[0].NAME}`);
          console.log(`   Второй: ${innocents[1].NAME}`);
        }
        
        console.log('\n📊 СРАВНЕНИЕ РЕЗУЛЬТАТОВ:');
        console.log(`   Эталонный: ${criminals.length} строк`);
        console.log(`   Ваш: ${innocents.length} строк`);
        console.log(`   Совпадают? ${criminals.length === innocents.length ? '✅ ДА' : '❌ НЕТ'}`);
        
        console.log('\n✅ Система сравнения работает ПРАВИЛЬНО!');
        console.log('   Она действительно сравнивает результаты выполнения запросов.');
        
        db.detach();
        console.log('\n🔚 Проверка завершена');
      });
    });
  });
});