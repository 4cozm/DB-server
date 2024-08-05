import { DbConnections } from "../utils/connect.js";
import { resetAllData } from "../utils/migration/createSchema.js";

export const migration = async (req, res) => {
  try {
    for (const shard of Object.values(DbConnections)) {
      await resetAllData(shard);
    }
  } catch (error) {
    res.status(500).json({ errorMessage: "마이그레이션 중 오류 발생" });
  }
};

export const getTables = async () => {
  for (const shard of Object.values(DbConnections)) {
    const connection = await mysql.createConnection(shard);
    const getTables = `SHOW DATABASES;`;

    try {
    } catch (error) {
      console.error("테이블을 불러오는 중 오류 발생", error);
    } finally {
      await connection.end();
    }
  }
};
