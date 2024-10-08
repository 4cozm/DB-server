import { DbConnections, makeShardsConnect, shardConnections } from '../db/connect.js';
import { getQueries, resetAllData } from '../utils/migration/createSchema.js';
import { format } from 'sql-formatter';
import redisClient from '../db/elasticCache.js';
export const resetAllSchema = async (req, res) => {
  try {
    await makeShardsConnect();
    const connections = shardConnections();
    for (const shard of Object.values(connections)) {
      await resetAllData(shard);
    }
    const executed = await getQueries();
    const htmlFormattedQuery = format(executed).replace(/\n/g, '<br>');
    res.status(201).send(htmlFormattedQuery); //JSON으로 보내면 깨져서 html로 변환후 반환
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getTables = async () => {
  for (const shard of Object.values(DbConnections)) {
    const connection = await mysql.createConnection(shard);
    const getTables = `SHOW DATABASES;`;

    try {
    } catch (error) {
      console.error('테이블을 불러오는 중 오류 발생', error);
    } finally {
      await connection.end();
    }
  }
};

export const flushAllData = async (req, res) => {
  try {
    await redisClient.flushAll();
    res.status(200).json({ message: 'done' });
  } catch (error) {
    console.error('Redis flushAll에서 오류 발생:', error);
    res.status(500).json({ errorMessage: 'Redis flushAll에서 오류 발생' });
  }
};
