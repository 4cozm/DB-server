import * as env from "../constants/env.js";

export const config = {
  SHARDS: {
    1: {
      user: env.SHARD_1_USER,
      password: env.SHARD_1_PASSWORD,
      host: env.SHARD_1_HOST,
      port: env.SHARD_1_PORT,
    },
    2: {
      user: env.SHARD_2_USER,
      password: env.SHARD_2_PASSWORD,
      host: env.SHARD_2_HOST,
      port: env.SHARD_2_PORT,
    },
    3: {
      user: env.SHARD_3_USER,
      password: env.SHARD_3_PASSWORD,
      host: env.SHARD_3_HOST,
      port: env.SHARD_3_PORT,
    },
  },
};

export default config;
