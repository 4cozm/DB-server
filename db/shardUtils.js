import config from "../config/config.js";
import fatalError from "../error/fatalError.js";
import { DbConnections, mainDbConnections } from "./connect.js";
import { getToMainDb, setToMainDb } from "./main.js";
import { validTables, validDatabases } from "../utils/validate.js";

/**
 * 가장 최적의 샤드 객체 번호를 가져오는 함수
 * @return connections 기반의 shard 번호를 반환 (0,1,2...)
 */
export const getShardNumber = async () => {
  const connections = DbConnections();
  const shards = await checkUpdateTime(connections);
  return selectBestShard(shards);
};

/**
 * Main DB와 입력받은 샤드에 데이터를 저장, 저장후 결과를 반환
 * @param {Number} shardNumber - getShardNumber() 함수의 결과를 대입
 * @param {'GAME_DB'|'USER_DB'| 'ERROR_DB'} database - 어떤 DB에 저장할 지 선택
 * @param {String} table
 * 가능한 값:
 * - GAME_DB:
 *   - "character"
 *   - "character_skill"
 *   - "rating"
 *   - "match_history"
 *   - "match_log"
 *   - "possession"
 *   - "score"
 *
 * - USER_DB:
 *   - "account"
 *   - "money"
 *
 * - ERROR_DB:
 *   - "error_log"
 *
 * @param {Query} query - 시행할 쿼리를 선택
 * @param {String} key - 조회시 사용될 key를 선택(조회시 해당 KEY값을 대입해야함)
 * @param {value} any - 저장할 정보
 * @returns - ${shardNumber}번 샤드,${database} , ${table}에 key:${key}, 저장: ${value}로 저장되었습니다
 */
export const saveShard = async (shardNumber, database, table, query, key, value) => {
  // 데이터베이스 값이 유효한지 확인
  if (!validDatabases.includes(database)) {
    throw new Error(`올바르지 않은 데이터 베이스: ${database}. 가능한 값 ${validDatabases.join(", ")}.`);
  }
  if (!validTables[database].includes(table)) {
    throw new Error(`올바르지 않은 테이블: ${table} 가능 한 값: ${validTables[database]}`);
  }
  const connections = DbConnections();
  const dbConnection = connections[shardNumber][database];
  if (!dbConnection) {
    throw new Error(`샤드 번호: ${shardNumber} 가 올바르지 않습니다 없는 샤드 번호거나 현재 사용 불가능한 샤드입니다`);
  }
  try {
    await dbConnection.beginTransaction();

    // 쿼리 실행
    await dbConnection.query(query, value);
    await setToMainDb(key, shardNumber, database, table);

    await dbConnection.commit();

    const log = `${shardNumber}번 샤드,${database} , ${table}에 key:${key}, 저장: ${value}로 저장되었습니다`;
    console.log(log);
    return log;
  } catch (error) {
    await dbConnection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("중복된 저장 입니다");
    } else {
      throw new Error(error);
    }
  }
};

/**
 * key를 대입하면 해당 값을 가진 shard 연결을 반환
 * @param {String} key
 * @param {'GAME_DB'|'USER_DB'| 'ERROR_DB'} database - 어떤 DB에서 가져올 지 선택
 * @param {String} table
 * 가능한 값:
 * - GAME_DB:
 *   - "character"
 *   - "character_skill"
 *   - "rating"
 *   - "match_history"
 *   - "match_log"
 *   - "possession"
 *   - "score"
 *
 * - USER_DB:
 *   - "account"
 *   - "money"
 *
 * - ERROR_DB:
 *   - "error_log"
 *
 * @returns
 */
export const getShardByKey = async (key, database, table) => {
  if (!validDatabases.includes(database)) {
    throw new Error(`올바르지 않은 데이터 베이스: ${database}. 가능한 값 ${validDatabases.join(", ")}.`);
  }
  if (!validTables[database].includes(table)) {
    throw new Error(`올바르지 않은 테이블: ${table} 가능 한 값: ${validTables[database]}`);
  }

  try {
    const result = await getToMainDb(key, database, table);
    const connections = DbConnections();
    return connections[result][database];
  } catch (error) {
    throw new Error(error);
  }
};

const checkUpdateTime = async (connections) => {
  const shards = {};
  Object.keys(connections).forEach(async (key) => {
    if (Date.now - connections[key].STATUS.getShardNumberData().lastUpdate >= 60000) {
      //최근 1분간 조회 했다면 생략
      await connections[key].STATUS.updateShard();
    }
    shards[key] = connections[key].STATUS.getShardNumberData();
  });
  return shards;
};

const getPrimaryKey = async (connection, type, table) => {
  const query = `
  SELECT COLUMN_NAME 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = ?
    AND TABLE_NAME = ? 
    AND COLUMN_KEY = 'PRI';
  `;
  try {
    const [rows] = await connection.execute(query, [type, table]);
    return rows[0].COLUMN_NAME;
  } catch (error) {
    console.error("프라이머리 키를 가지고 오는데 실패했습니다", error);
    throw new Error(error);
  }
};

const selectBestShard = (shards) => {
  if (Object.keys(shards).length <= 0) {
    throw new Error("샤드의 정보가 존재하지 않습니다");
  }
  let result;
  let biggestStorage = 0;
  Object.keys(shards).forEach((key) => {
    const shard = shards[key];
    if (shard.remainingStorage > biggestStorage) {
      biggestStorage = shard.remainingStorage;
      result = key;
    }
  });

  if (result.cpu > 80) {
    console.log("cpu 과부하로 인해 CPU 점유율이 가장 낮은곳에 저장합니다");
    Object.keys(shards).forEach((key) => {
      const shard = shards[key];

      let lessUsageCpu;
      if (shard.cpuUsage > lessUsageCpu) {
        lessUsageCpu = shard.cpuUsage;
        result = key;
      }
    });
  }
  return result;
};

export const shards = {
  0: {
    host: config.SHARDS[1].host,
    user: config.SHARDS[1].user,
    password: config.SHARDS[1].password,
    database: config.SHARDS[1].name,
    port: config.SHARDS[1].port,
    connectTimeout: 10000,
  },
  1: {
    host: config.SHARDS[2].host,
    user: config.SHARDS[2].user,
    password: config.SHARDS[2].password,
    database: config.SHARDS[2].name,
    port: config.SHARDS[2].port,
    connectTimeout: 10000,
  },
  2: {
    host: config.SHARDS[3].host,
    user: config.SHARDS[3].user,
    password: config.SHARDS[3].password,
    database: config.SHARDS[3].name,
    port: config.SHARDS[3].port,
    connectTimeout: 10000,
  },
};
