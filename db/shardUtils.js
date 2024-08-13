import config from "../config/config.js";
import { DbConnections } from "./connect.js";

/**
 * DB로 보내는 ID값과 조회할때 사용하는 ID값은 항상 같아야 합니다
 * @param {*} id
 * @returns
 */
export const getShard = () => {
  const connections = DbConnections();
  const shards = checkUpdateTime(connections);
  return selectBestShard(shards);
};

const checkUpdateTime = (connections) => {
  const shards = {};
  Object.keys(connections).forEach(async (key) => {
    if (Date.now - connections[key].status.getShardData().lastUpdate >= 60000) {
      //최근 1분간 조회 했다면 생략
      await connections[key].status.updateShard();
    }
    shards[key] = connections[key].status.getShardData();
  });
  return shards;
};

const selectBestShard = (shards) => {
  if (Object.keys(shards).length <= 0) {
    throw new Error("샤드의 정보가 존재하지 않습니다");
  }
  let result;
  Object.keys(shards).forEach((key) => {
    const shard = shards[key];

    let biggestStorage = 0;
    if (shard.remainingStorage > biggestStorage) {
      biggestStorage = shard.remainingStorage;
      result = shard;
    }
  });

  if (result.cpu > 80) {
    console.log("cpu 과부하로 인해 CPU 점유율이 가장 낮은곳에 저장합니다");

    Object.keys(shards).forEach((key) => {
      const shard = shards[key];
      let result;
      let lessUsageCpu;
      if (shard.cpuUsage > lessUsageCpu) {
        lessUsageCpu = shard.cpuUsage;
        result = shard;
      }
    });
  }
  return result.shardName;
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
