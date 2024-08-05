import fs from "fs/promises";

const readSQLFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(`파일 읽기 실패 ${filePath}`, err);
    throw err;
  }
};

const executeQueries = async (connection, filePath) => {
  try {
    // SQL 파일에서 쿼리 읽기
    const sql = await readSQLFile(filePath);

    // 세미콜론으로 쿼리 분리
    const queries = sql.split(";").filter((query) => query.trim());

    // 각 쿼리 실행
    for (const query of queries) {
      if (query) {
        // 빈 쿼리 방지
        await connection.query(query);
      }
    }
  } catch (error) {
    console.error(`쿼리 실행 중 오류 발생: ${error.message}`);
    throw error;
  }
};

export const resetAllData = async (connection) => {
  const dropDatabaseSQL = [
    "DROP DATABASE IF EXISTS USER_DB;",
    "DROP DATABASE IF EXISTS GAME_DB;",
    "DROP DATABASE IF EXISTS ERROR_DB;",
  ];
  try {
    await connection.beginTransaction();
    for (const sql of dropDatabaseSQL) {
      await connection.query(sql);
    }
    await connection.commit();

    await connection.beginTransaction();
    await executeQueries(connection, "./utils/migration/sql/createUserDatabase.sql");
    await executeQueries(connection, "./utils/migration/sql/createGameDatabase.sql");
    await executeQueries(connection, "./utils/migration/sql/createErrorDatabase.sql");
    await connection.commit();

    console.log(`데이터 마이그레이션 성공`);
  } catch (error) {
    throw new Error(`마이그레이션 중 에러 발생:${error}`);
  }
};
