import assert from 'assert';
import {
  dbSaveTransaction,
  findPossessionByPlayerID,
  purchaseCharacter,
  updatePossession,
} from '../controllers/gameController.js';

// Mock된 응답 객체 생성
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
};

// dbSaveTransaction 테스트
export const dbSaveTransactionTest = async (connection) => {
  const req = {
    body: {
      win_team: [
        { playerId: 'testId', kill: 2, death: 0, damage: 132 },
        { playerId: 'testId', kill: 0, death: 1, damage: 118 },
      ],
      lose_team: [
        { playerId: 'testId', kill: 0, death: 1, damage: 82 },
        { playerId: 'testId', kill: 1, death: 1, damage: 68 },
      ],
      users: [
        { playerId: 'testId', kill: 2, death: 0, damage: 132 },
        { playerId: 'testId', kill: 0, death: 1, damage: 118 },
      ],
      session_id: Math.random(),
      win_team_color: 'green',
      start_time: Date.now(),
      map_name: '비내리는 호남선',
    },
  };
  const res = createMockResponse();

  try {
    await connection.beginTransaction();
    await dbSaveTransaction(req, res);

    assert.strictEqual(res.statusCode, 200);
    console.log('dbSaveTransactionTest pass');

    await connection.rollback();
  } catch (error) {
    console.error('CI/CD dbSaveTransactionTest 중 오류 발생:', error.message);
    console.error('에러 스택:', error.stack);
    await connection.rollback();
  }
};

// findPossessionByPlayerID 테스트
export const findPossessionTest = async (connection) => {
  const req = {
    query: { player_id: 'testId' },
  };
  const res = createMockResponse();

  try {
    await connection.beginTransaction();
    await findPossessionByPlayerID(req, res);

    assert.strictEqual(res.statusCode, 200);
    console.log('findPossessionTest pass');

    await connection.rollback();
  } catch (error) {
    console.error('CI/CD findPossessionTest 중 오류 발생:', error.message);
    console.error('에러 스택:', error.stack);
    await connection.rollback();
  }
};

// updatePossession 테스트
export const updatePossessionTest = async (connection) => {
  const req = {
    body: {
      player_id: 'testId',
      character_id: 15,
    },
  };
  const res = createMockResponse();

  try {
    await connection.beginTransaction();
    await updatePossession(req, res);

    assert.strictEqual(res.statusCode, 200);
    console.log('updatePossessionTest pass');

    await connection.rollback();
  } catch (error) {
    console.error('CI/CD updatePossessionTest 중 오류 발생:', error.message);
    console.error('에러 스택:', error.stack);
    await connection.rollback();
  }
};

// purchaseCharacter 테스트
export const purchaseCharacterTest = async (connection) => {
  const req = {
    body: {
      player_id: 'testId',
      character_id: 2,
      money: 15000,
    },
  };
  const res = createMockResponse();

  try {
    await connection.beginTransaction();
    await purchaseCharacter(req, res);

    assert.strictEqual(res.statusCode, 200);
    console.log('purchaseCharacterTest pass');

    await connection.rollback();
  } catch (error) {
    console.error('CI/CD purchaseCharacterTest 중 오류 발생:', error.message);
    console.error('에러 스택:', error.stack);
    await connection.rollback();
  }
};
