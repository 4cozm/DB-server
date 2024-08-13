import mysql from "mysql2/promise";
import { shards } from "./shardUtils.js";
import { ShardData } from "./cloudWatch.js";

let connections;

export const DbConnections = () => {
  if (!connections) {
    throw new Error("DB가 연결되지 않은 상태에서 DB를 조회 했습니다");
  } else {
    return connections;
  }
};

export const makeDbConnect = async () => {
  connections = {};
  for (const [key, config] of Object.entries(shards)) {
    try {
      const gameConnection = await mysql.createConnection({ ...config, database: "GAME_DB" });
      const userConnection = await mysql.createConnection({ ...config, database: "USER_DB" });
      const errorConnection = await mysql.createConnection({ ...config, database: "ERROR_DB" });

      const shardData = new ShardData(config.database);
      await shardData.shardUpdate();

      connections[key] = {
        game: gameConnection,
        user: userConnection,
        error: errorConnection,
        status: shardData,
      };

      console.log(`${config.database}연결 완료`);
    } catch (error) {
      console.error(`${config.database} 중 오류 발생:`, error);
    }
  }
};
