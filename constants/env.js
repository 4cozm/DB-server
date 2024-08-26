import dotenv from 'dotenv';

dotenv.config();

export const HOST = process.env.HOST;
export const PORT = process.env.PORT;

export const SHARD_1_USER = process.env.AWS_SHARD_1_USER;
export const SHARD_1_PASSWORD = process.env.AWS_SHARD_1_PASSWORD;
export const SHARD_1_HOST = process.env.AWS_SHARD_1_HOST;
export const SHARD_1_PORT = process.env.AWS_SHARD_1_PORT;
export const SHARD_1_NAME = process.env.AWS_SHARD_1_NAME;

export const SHARD_2_USER = process.env.AWS_SHARD_2_USER;
export const SHARD_2_PASSWORD = process.env.AWS_SHARD_2_PASSWORD;
export const SHARD_2_HOST = process.env.AWS_SHARD_2_HOST;
export const SHARD_2_PORT = process.env.AWS_SHARD_2_PORT;
export const SHARD_2_NAME = process.env.AWS_SHARD_2_NAME;

export const SHARD_3_USER = process.env.AWS_SHARD_3_USER;
export const SHARD_3_PASSWORD = process.env.AWS_SHARD_3_PASSWORD;
export const SHARD_3_HOST = process.env.AWS_SHARD_3_HOST;
export const SHARD_3_PORT = process.env.AWS_SHARD_3_PORT;
export const SHARD_3_NAME = process.env.AWS_SHARD_3_NAME;

export const MAIN_USER = process.env.AWS_MAIN_USER;
export const MAIN_PASSWORD = process.env.AWS_MAIN_PASSWORD;
export const MAIN_HOST = process.env.AWS_MAIN_HOST;
export const MAIN_PORT = process.env.AWS_MAIN_PORT;
export const MAIN_NAME = process.env.AWS_MAIN_NAME;

export const ELASTIC_CACHE = process.env.ELASTIC_CACHE;

export const DISCORD_WEB_HOOK = process.env.DISCORD_WEB_HOOK;
export const GITHUB_WEB_HOOK = process.env.GITHUB_WEB_HOOK;
