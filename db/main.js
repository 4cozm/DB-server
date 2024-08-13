/*
mainDB에 대한 코드가 저장되는 곳입니다
mainDB는 key가 몇번 샤드에 저장되었는지 최종적으로 관리하는 DB입니다
저장할때는 샤드와 mainDB에 동시에 저장되어야 합니다
호출할때는 mainDB를 통해 샤드의 위치를 파악한다음 해당 샤드로 접근하는 식으로 구현되면 됩니다

세부적인 로직은 해당 코드 스페이스에서 하고 여기서는 get,set에 관한 내용만 다룹니다
*/

import fatalError from "../error/fatalError.js";
import { getMainDb } from "./connect.js";

/**
 * 샤드의 Key 와 샤드 번호를 저장하는 함수
 * @param {String} key
 * @param {Number} shardNumber
 * @param {'game' | 'user' | 'error'} type
 */
export const setToMainDb = async (key, shardNumber, type) => {
  const connection = getMainDb();

  try {
    await connection.beginTransaction();
    await connection.execute(`INSERT INTO Shards (\`key\`, shard_number,\`type\`) VALUES (?, ?, ?)`, [
      key,
      shardNumber,
      type,
    ]);
    await connection.commit();
  } catch (error) {
    if (connection) {
      console.log("메인 DB 롤백");
      await connection.rollback();
    }
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("중복된 요소: 이 키는 이미 존재합니다.");
    } else {
      fatalError(error, "메인 DB에 키,샤드 정보 저장에 실패했습니다");
    }
  }
};

/**
 * Key 값을 넣으면 해당하는 shard의 번호와 저장된 database의 타입(game,user,error)을 반환
 * @param {String} key
 */
export const getToMainDb = async (key) => {
  const connection = getMainDb();
  try {
    const [rows] = await connection.execute("SELECT shard_number,type FROM Shards WHERE `key` = ?", [key]);
    if (rows.length > 0) {
      return { shard: rows[0].shard_number, type: rows[0].type };
    } else {
      console.log("해당 key에 대한 shard_name을 찾을 수 없습니다.");
      return null;
    }
  } catch (err) {
    console.error("데이터 조회 중 오류 발생:", err);
  }
};
