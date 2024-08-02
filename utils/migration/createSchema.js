import mysql from 'mysql2/promise';
import fs from 'fs/promises';


const readSQLFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error(`마이그레이션 오류:파일 읽기 실패 ${filePath}`, err);
    throw err;
  }
};

export const resetAllData = async (shard) => {
  const connection = await mysql.createConnection(shard);

  const dropDatabaseSQL = `
  DROP DATABASE IF EXISTS USER_DB;
  DROP DATABASE IF EXISTS GAME_DB;
  DROP DATABASE IF EXISTS ERROR_DB;
  `;
  try {
    await connection.query(dropDatabaseSQL);

    const createUserDatabaseSQL = await readSQLFile('./sql/createUserDatabase.sql');
    const createGameDatabaseSQL = await readSQLFile('./sql/createGameDatabase.sql');
    const createErrorDatabaseSQL = await readSQLFile('./sql/createErrorDatabase.sql');

    await connection.query(createUserDatabaseSQL);
    await connection.query(createGameDatabaseSQL);
    await connection.query(createErrorDatabaseSQL);

    console.log(`데이터 마이그레이션 성공 샤드:${shard}번`);
  } catch (error) {
    console.error(`마이그레이션 중 에러 발생 샤드:${shard}번`);
  } finally {
    await connection.end();
  }
};

