import {
  dbSaveTransaction,
  findPossessionByPlayerID,
  purchaseCharacter,
  updatePossession,
} from '../controllers/gameController.js';
import { sendErrorToDiscord } from '../utils/webHook.js';
/**
 * 테스트 항목:
 * - createMatchHistory /
 * - createMatchLog /
 * - createUserScore 없음
 * - createUserRating 없음
 * - updateUserScore /
 * - updateUserRating /
 * - getUserScore /update안에 있음
 * - getUserRating /update안에 있음
 * - findPossessionByPlayerID /
 * - updatePossession
 * - purchaseCharacter
 * - findCharacterData
 * - findCharacterInfo
 */
export const dbSaveTransactionTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let session_id = 'testSessionId';
    let users = [
      { playerId: 'testId', kill: 2, death: 0, damage: 132 },
      { playerId: 'testId', kill: 0, death: 1, damage: 118 },
      { playerId: 'testId', kill: 0, death: 1, damage: 82 },
      { playerId: 'testId', kill: 1, death: 1, damage: 68 },
    ];
    let win_team = [
      { playerId: 'testId', kill: 2, death: 0, damage: 132 },
      { playerId: 'testId', kill: 0, death: 1, damage: 118 },
    ];
    let lose_team = [
      { playerId: 'testId', kill: 0, death: 1, damage: 82 },
      { playerId: 'testId', kill: 1, death: 1, damage: 68 },
    ];
    let win_team_color = 'green';
    let start_time = Date.now();
    let map_name = '비내리는 호남선';
    let req = {
      body: { win_team, lose_team, users, session_id, win_team_color, start_time, map_name },
    };
    await dbSaveTransaction(req, res);
    console.log('dbSaveTransactionTest pass');
    connection.rollback();
  } catch (e) {
    console.error('CI/CD dbSaveTransactionTest 중 오류 발생:', e.message);
    console.error('에러 스택:', e.stack);
    sendErrorToDiscord(e.message);
  }
};

export const findPossessionTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let player_id = 'testId';
    let req = {
      body: { player_id },
    };
    await findPossessionByPlayerID(req, res);
    console.log('findPossessionTest pass');
    connection.rollback();
  } catch (e) {
    console.error('CI/CD findPossessionTest 중 오류 발생:', e.message);
    console.error('에러 스택:', e.stack);
    sendErrorToDiscord(e.message);
  }
};

export const updatePossessionTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let player_id = 'testId';
    let character_id = 4;
    let req = {
      body: { player_id, character_id },
    };
    await updatePossession(req, res);
    console.log('updatePossessionTest pass');
    connection.rollback();
  } catch (e) {
    console.error('CI/CD updatePossessionTest 중 오류 발생:', e.message);
    console.error('에러 스택:', e.stack);
    sendErrorToDiscord(e.message);
  }
};

export const purchaseCharacterTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let player_id = 'testId';
    let character_id = 2;
    let money = 15000;
    let req = {
      body: { player_id, character_id, money },
    };
    await purchaseCharacter(req, res);
    console.log('purchaseCharacterTest pass');
    connection.rollback();
  } catch (e) {
    console.error('CI/CD purchaseCharacterTest 중 오류 발생:', e.message);
    console.error('에러 스택:', e.stack);
    sendErrorToDiscord(e.message);
  }
};
