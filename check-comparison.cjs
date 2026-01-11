const firebird = require('node-firebird');

async function testComparison() {
  console.log('🧪 ТЕСТ: Проверка сравнения запросов\n');
  
  // 1. Подключаемся к основной базе (MYDB.FDB)
  console.log('1️⃣ Подключаемся к MYDB.FDB (основная база)...');
  const mainDb = await connectToDb({
    database: 'C:/RedData/MYDB.FDB',
    user: 'SYSDBA',
    charset: 'UTF-8',
    password: '1234'
    
  });
  
  // 2. Получаем эталонные запросы
  console.log('\n2️⃣ Получаем эталонные запросы из таблицы CASES:');
  const cases = await query(mainDb, 'SELECT ID, TITLE, CORRECT_SOLUTION FROM CASES ORDER BY ID');
  
  cases.forEach(c => {
    console.log(`   Кейс ${c.ID}: "${c.TITLE}"`);
    console.log(`   Эталон: ${c.CORRECT_SOLUTION}`);
    console.log(`   Длина: ${c.CORRECT_SOLUTION.length} символов\n`);
  });
  
  // 3. Подключаемся к учебной базе
  console.log('3️⃣ Подключаемся к SQLNOIR_DATA.FDB (учебная база)...');
  const trainingDb = await connectToDb({
    database: 'C:/RedData/SQLNOIR_DATA.FDB',
    user: 'SYSDBA',
    password: '1234'
  });
  
  // 4. Проверяем выполнение запросов
  console.log('\n4️⃣ Проверяем выполнение эталонных запросов:');
  
  for (const c of cases) {
    try {
      const result = await query(trainingDb, c.CORRECT_SOLUTION);
      console.log(`   Кейс ${c.ID}: выполнен, строк = ${result.length}`);
      
      // Показываем первую строку результата
      if (result.length > 0) {
        console.log(`   Первая строка:`, Object.keys(result[0]));
      }
    } catch (err) {
      console.log(`   Кейс ${c.ID}: ОШИБКА - ${err.message}`);
    }
  }
  
  console.log('\n✅ ТЕСТ ЗАВЕРШЕН');
}

function connectToDb(config) {
  return new Promise((resolve, reject) => {
    firebird.attach({
      ...config,
      host: 'localhost',
      port: 3050,
      charset: 'UTF-8'
    }, (err, db) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function query(db, sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

testComparison().catch(console.error);