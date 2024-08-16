import * as env from "../constants/env.js";

export const config = {
  SHARDS: {
    1: {
      user: env.SHARD_1_USER,
      password: env.SHARD_1_PASSWORD,
      host: env.SHARD_1_HOST,
      port: env.SHARD_1_PORT,
      name: env.SHARD_1_NAME,
    },
    2: {
      user: env.SHARD_2_USER,
      password: env.SHARD_2_PASSWORD,
      host: env.SHARD_2_HOST,
      port: env.SHARD_2_PORT,
      name: env.SHARD_2_NAME,
    },
    3: {
      user: env.SHARD_3_USER,
      password: env.SHARD_3_PASSWORD,
      host: env.SHARD_3_HOST,
      port: env.SHARD_3_PORT,
      name: env.SHARD_3_NAME,
    },
  },
  MAIN: {
    user: env.MAIN_USER,
    password: env.MAIN_PASSWORD,
    host: env.MAIN_HOST,
    port: env.MAIN_PORT,
    database: env.MAIN_NAME,
  },
  DISCORD: {
    WEB_HOOK: env.DISCORD_WEB_HOOK,
  },
  GITHUB: {
    WEB_HOOK: env.DISCORD_WEB_HOOK,
  },
};

export default config;
