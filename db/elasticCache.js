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
  console.log(redisKey);
  try {
    await redisClient.setEx(redisKey, 300, value);
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
  console.log(redisKey);
  try {
    const value = await redisClient.get(redisKey);
    if (value) {
      console.log('Elastic cache적중', redisKey); //테스트 로그
      return value;
    } else {
      console.log('Elastic cache에서 값 찾지 못함'); //테스트 로그
      return null;
    }
  } catch (error) {
    console.error('getCache에서 오류 발생', error);
  }
};

export const setHashCache = async (database, table, key, values) => {
  const redisKey = `${database}:${table}:${key}`;
  console.log(redisKey);
  try {
    await redisClient.hSet(redisKey, JSON.stringify(values));
  } catch (error) {
    console.error('setHashCache에서 오류 발생', error);
  }
};

export const getHashCache = async (database, table, key) => {
  const redisKey = `${database}:${table}:${key}`;
  console.log(redisKey);
  try {
    const value = await redisClient.hGet(redisKey);
    if (value) {
      console.log('Elastic cache적중', redisKey); //테스트 로그
      return JSON.parse(value);
    } else {
      console.log('Elastic cache에서 값 찾지 못함'); //테스트 로그
      return null;
    }
  } catch (error) {
    console.error('getHashCache에서 오류 발생', error);
  }
};

export default redisClient;
