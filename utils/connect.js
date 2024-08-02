import mysql from "mysql2/promise";
import { shards } from "./shardUtils.js";

let connections;

export const getDbConnections = () => {
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
      connections[key] = await mysql.createConnection(config);
      console.log(`DB 연결 ${key} 완료`);
    } catch (error) {
      console.error(`DB 연결 ${key} 중 오류 발생:`, error);
    }
  }
};
