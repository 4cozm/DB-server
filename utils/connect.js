import mysql from "mysql2/promise";
import { shards } from "./shardUtils.js";

const dbConnection = {
  1: await mysql.createConnection(shards[1]),
  2: await mysql.createConnection(shards[2]),
  3: await mysql.createConnection(shards[3]),
};

export default dbConnection;
