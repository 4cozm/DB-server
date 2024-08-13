import config from "../config/config.js";
import { DbConnections } from "./connect.js";

/**
 * DB로 보내는 ID값과 조회할때 사용하는 ID값은 항상 같아야 합니다
 * @param {*} id
 * @returns
 */
export const getShard = () => {
  const connections = DbConnections();
  
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
