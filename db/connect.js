import mysql from "mysql2/promise";
import { shards } from "./shardUtils.js";
import { ShardData } from "./cloudWatch.js";
import config from "../config/config.js";
let connections;
let mainDb;
let shardList;

export const mainDbConnections = () => {
  if (!mainDb) {
    throw new Error("DB가 연결되지 않은 상태에서 DB를 조회 했습니다");
  } else {
    return mainDb;
  }
};
export const DbConnections = () => {
  if (!connections) {
    throw new Error("DB가 연결되지 않은 상태에서 DB를 조회 했습니다");
  } else {
    return connections;
  }
};
export const shardConnections = () => {
  if (!shardList) {
    throw new Error("DB가 연결되지 않은 상태에서 DB를 조회 했습니다");
  } else {
    return shardList;
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
        GAME_DB: gameConnection,
        USER_DB: userConnection,
        ERROR_DB: errorConnection,
        STATUS: shardData,
      };

      console.log(`${config.database}연결 완료`);
    } catch (error) {
      console.error(`${config.database} 중 오류 발생:`, error);
    }
  }
};

export const connectMainDb = async () => {
  try {
    mainDb = await mysql.createConnection({ ...config.MAIN });
    console.log("메인 DB 연결 성공");
  } catch (error) {
    throw new Error("메인 DB 연결 실패", error);
  }
};

export const makeShardsConnect = async () => {
  shardList = {};
  try {
    for (const [key, config] of Object.entries(shards)) {
      shardList[key] = await mysql.createConnection({ ...config, database: null });
    }
    console.log("shard 정보 연결 성공");
  } catch (error) {
    console.error("샤드 연결 실패", error);
    throw new Error("샤드 연결 실패", error);
  }
};
