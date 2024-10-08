import redis from 'redis';
import config from '../config/config.js';

export const redisClient = redis.createClient({
  url: config.ELASTIC_CACHE.elastic,
});

redisClient.on('connect', () => {
  console.log('Elastic cache 준비 완료');
});

redisClient.on('error', (error) => {
  console.error('Elastic cache 연결 오류 발생', error);
});

/**
 * 단일 value값을 캐싱처리할때
 * @param {*} database
 * @param {*} table
 * @param {*} key
 * @param {*} value
 */
export const setCache = async (database, table, key, value) => {
  const redisKey = `${database}:${table}:${key}`;
  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    await redisClient.setEx(redisKey, 300, stringValue);
  } catch (error) {
    console.error('setCache에서 오류 발생', error);
  }
};

/**
 * 단일 value값을 가지고 올때
 * @param {*} database
 * @param {*} table
 * @param {*} key
 * @returns
 */
export const getCache = async (database, table, key) => {
  const redisKey = `${database}:${table}:${key}`;
  try {
    const value = await redisClient.get(redisKey);
    if (value) {
      return JSON.parse(value);
    } else {
      return null;
    }
  } catch (error) {
    console.error('getCache에서 오류 발생', error);
  }
};

export const setHashCache = async (database, table, key, values) => {
  const redisKey = `${database}:${table}:${key}`;
  try {
    if (Array.isArray(values) && values.length > 0) {
      const fields = {};
      values.forEach((obj, index) => {
        for (const [field, value] of Object.entries(obj)) {
          fields[`${index}:${field}`] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        }
      });
      await redisClient.hSet(redisKey, fields);
    }
  } catch (error) {
    console.error('setHashCache에서 오류 발생', error);
  }
};
/**
 * 해시 형태로 값을 조회할 때
 * @param {*} database
 * @param {*} table
 * @param {*} key
 * @returns
 */
export const getHashCache = async (database, table, key) => {
  const redisKey = `${database}:${table}:${key}`;
  try {
    const fields = await redisClient.hGetAll(redisKey);
    if (Object.keys(fields).length > 0) {
      const parsedValue = {};
      for (const [field, value] of Object.entries(fields)) {
        const [index, fieldName] = field.split(':');
        if (!parsedValue[index]) {
          parsedValue[index] = {};
        }
        try {
          parsedValue[index][fieldName] = JSON.parse(value);
        } catch {
          parsedValue[index][fieldName] = value;
        }
      }
      return Object.values(parsedValue);
    } else {
      return null;
    }
  } catch (error) {
    console.error('getHashCache에서 오류 발생', error);
  }
};

export const deleteHashCache = async (database, table, key) => {
  const redisKey = `${database}:${table}:${key}`;
  try {
    await redisClient.del(redisKey);
  } catch (error) {
    console.error('deleteHashCache에서 오류 발생', error);
  }
};

export default redisClient;
