import { shards } from "../utils/shardUtils.js";
import { resetAllData } from "../utils/migration/createSchema.js";

export const migration = async () => {
  for (const shard of Object.values(shards)) {
    await resetAllData(shard);
  }
};

export const getTables = async () => {
  for (const shard of Object.values(shards)) {
    const connection = await mysql.createConnection(shard);
    const getTables = `SHOW DATABASES;`;

    try{
      
    }catch(error){
      console.error("테이블을 불러오는 중 오류 발생",error);
    }finally{
      await connection.end();
    }
  }
};
