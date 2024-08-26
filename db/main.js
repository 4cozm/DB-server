/*
mainDB에 대한 코드가 저장되는 곳입니다
mainDB는 key가 몇번 샤드에 저장되었는지 최종적으로 관리하는 DB입니다
저장할때는 샤드와 mainDB에 동시에 저장되어야 합니다
호출할때는 mainDB를 통해 샤드의 위치를 파악한다음 해당 샤드로 접근하는 식으로 구현되면 됩니다

세부적인 로직은 해당 코드 스페이스에서 하고 여기서는 get,set에 관한 내용만 다룹니다
*/

import { CustomError } from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';
import { mainDbConnections } from './connect.js';

/**
 * 샤드의 Key 와 샤드 번호를 저장하는 함수
 * @param {String} key
 * @param {Number} shardNumber
 * @param {'game' | 'user' | 'error'} database
 * @param {String} table
 * 가능한 값:
 * - GAME_DB:
 *   - "character"
 *   - "character_skill"
 *   - "rating"
 *   - "match_history"
 *   - "match_log"
 *   - "possession"
 *   - "score"
 *
 * - USER_DB:
 *   - "account"
 *   - "money"
 *
 * - ERROR_DB:
 *   - "error_log"
 *
 */
export const setToMainDb = async (key, shardNumber, database, table) => {
  const connection = mainDbConnections();
  try {
    const [rows] = await connection.execute(
      `SELECT shard_number FROM Shards WHERE \`key\` = ? AND \`database\` = ? AND \`table\` = ?`,
      [key, database, table],
    );

    if (rows.length > 0) {
      throw new CustomError(
        `중복 저장을 하고 있습니다! - 저장을 시도한 샤드: ${shardNumber} 번, key: ${key}, database: ${database}, table: ${table}은 이미 ${rows[0].shard_number} 번 샤드에 존재합니다`,
      );
    }
    await connection.execute(
      `INSERT INTO Shards (\`key\`, shard_number, \`database\`, \`table\`) VALUES (?, ?, ?, ?)`,
      [key, shardNumber, database, table],
    );
  } catch (error) {
    console.error(error);
    throw new CustomError(error);
  }
};

/**
 * Key 값을 넣으면 해당하는 shard의 번호와 저장된 database의 타입(game,user,error)을 반환
 * @param {String} key
 */
export const getToMainDb = async (key, database, table) => {
  const connection = mainDbConnections();
  const query = `
      SELECT shard_number
      FROM Shards
      WHERE \`key\` = ?
        AND \`database\` = ?
        AND \`table\` =?
    `;
  try {
    const [rows] = await connection.execute(query, [key, database, table]);
    if (rows.length > 0) {
      return rows[0].shard_number;
    } else {
      throw new CustomError(
        `getToMainDb 에러 - 해당 key:${key}로 저장된 shard 위치를 찾을 수 없습니다.`,
        ErrorCodes.SHARD_NOT_FOUND,
      );
    }
  } catch (error) {
    console.error('데이터 조회 중 오류 발생:', error);
    throw new CustomError(error.message, ErrorCodes.DB_QUERY_FAILED);
  }
};
