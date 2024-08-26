import assert from 'assert';
import {
  createUser,
  findUserByPlayerId,
  updateUserLogin,
  findMoneyByPlayerId,
  updateMoney,
} from '../controllers/userController.js';
import { sendErrorToDiscord } from '../utils/webHook.js';

// Mock된 응답 객체 생성
const createMockResponse = () => {
  const res = {};
  res.status = () => res;
  res.json = () => res;
  return res;
};

export const createUserFuncTest = async (connection) => {
  const req = {
    body: {
      player_id: 'TCU1',
      name: 'TCU1',
      pw: 'TCU1',
      guild: 1,
      money: 5000,
      character_id: 1,
    },
  };

  const res = createMockResponse();

  try {
    await connection.beginTransaction();
    await createUser(req, res);

    assert.strictEqual(res.status.callCount, 1);
    assert.strictEqual(res.status.firstCall.args[0], 201);
    assert.deepStrictEqual(res.json.firstCall.args[0], {
      player_id: 'TCU1',
    });

    await connection.rollback();
  } catch (error) {
    console.error('createUser 오류 발생: ', error);
    await sendErrorToDiscord('CI/CD 테스트 중 createUser 중 오류 발생', error);
    await connection.rollback();
  }
};

//* findUserByPlayerId *//
export const findUserFuncTest = async (connection) => {
  const req = {
    query: { player_id: 'testId' },
  };

  const res = createMockResponse();

  try {
    await connection.beginTransaction();
    await findUserByPlayerId(req, res);

    assert.strictEqual(res.status.callCount, 1);
    assert.strictEqual(res.status.firstCall.args[0], 200);
    assert.ok(res.json.firstCall.args[0]);

    await connection.rollback();
  } catch (error) {
    console.error('findUserByPlayerId 오류 발생: ', error);
    await sendErrorToDiscord('CI/CD 테스트 중 findUserByPlayerId 중 오류 발생', error);
    await connection.rollback();
  }
};

//* updateUserLogin *//
export const updateUserLoginFuncTest = async (connection) => {
  const reqSuccess = { body: { player_id: 'testId' } };
  const reqMissing = { body: {} };
  const reqNotFound = { body: { player_id: 'NonExistingPlayer' } };

  const res = createMockResponse();

  try {
    await connection.beginTransaction();

    // Test Case 1: Successful login update
    await updateUserLogin(reqSuccess, res);
    assert.strictEqual(res.status.callCount, 1);
    assert.strictEqual(res.status.firstCall.args[0], 200);
    assert.deepStrictEqual(res.json.firstCall.args[0], {
      message: '마지막 로그인 시간 업데이트 성공',
    });

    // Test Case 2: Missing player_id
    await updateUserLogin(reqMissing, res);
    assert.strictEqual(res.status.callCount, 2);
    assert.strictEqual(res.status.secondCall.args[0], 400);
    assert.deepStrictEqual(res.json.secondCall.args[0], {
      errorMessage: 'player_id가 누락되었습니다',
    });

    // Test Case 3: User not found
    await updateUserLogin(reqNotFound, res);
    assert.strictEqual(res.status.callCount, 3);
    assert.strictEqual(res.status.thirdCall.args[0], 404);
    assert.deepStrictEqual(res.json.thirdCall.args[0], {
      errorMessage: '존재하지 않는 유저입니다',
    });

    await connection.rollback();
  } catch (error) {
    console.error('updateUserLogin 오류 발생:', error);
    await sendErrorToDiscord('CI/CD 테스트 updateUserLogin 중 오류 발생', error);
    await connection.rollback();
  }
};

//* findMoneyByPlayerId *//
export const findMoneyFuncTest = async (connection) => {
  const reqSuccess = {
    query: { player_id: 'testId' },
  };
  const reqMissing = {
    query: {},
  };
  const reqNotFound = {
    query: { player_id: 'NonExistentPlayer' },
  };

  const res = createMockResponse();

  try {
    await connection.beginTransaction();

    // Test Case 1: Successful in finding user money
    await findMoneyByPlayerId(reqSuccess, res);
    assert.strictEqual(res.status.callCount, 1);
    assert.strictEqual(res.status.firstCall.args[0], 201);
    assert.deepStrictEqual(res.json.firstCall.args[0], {
      amount: 1000, // 예상 금액을 지정하세요.
    });

    // Test Case 2: Missing player_id
    await findMoneyByPlayerId(reqMissing, res);
    assert.strictEqual(res.status.callCount, 2);
    assert.strictEqual(res.status.secondCall.args[0], 400);
    assert.deepStrictEqual(res.json.secondCall.args[0], {
      errorMessage: 'player_id가 누락되었습니다.',
    });

    // Test Case 3: User not found
    await findMoneyByPlayerId(reqNotFound, res);
    assert.strictEqual(res.status.callCount, 3);
    assert.strictEqual(res.status.thirdCall.args[0], 201);
    assert.deepStrictEqual(res.json.thirdCall.args[0], null);

    await connection.rollback();
  } catch (error) {
    console.error('findMoneyByPlayerId 오류 발생:', error);
    await sendErrorToDiscord('CI/CD 테스트 findMoneyByPlayerId 중 오류 발생', error);
    await connection.rollback();
  }
};

//* updateMoney *//
export const updateMoneyFuncTest = async (connection) => {
  const reqSuccess = { body: { player_id: 'testId', money: 1000 } };
  const reqMissing = { body: { money: 1000 } };
  const reqNotFound = { body: { player_id: 'NonExistentPlayer', money: 1000 } };

  const res = createMockResponse();

  try {
    await connection.beginTransaction();

    // Test Case 1: Successful money update
    await updateMoney(reqSuccess, res);
    assert.strictEqual(res.status.callCount, 1);
    assert.strictEqual(res.status.firstCall.args[0], 200);
    assert.deepStrictEqual(res.json.firstCall.args[0], {
      affectedRows: 1, // 예상 affectedRows 값을 지정하세요.
    });

    // Test Case 2: Missing player_id
    await updateMoney(reqMissing, res);
    assert.strictEqual(res.status.callCount, 2);
    assert.strictEqual(res.status.secondCall.args[0], 400);
    assert.deepStrictEqual(res.json.secondCall.args[0], {
      errorMessage: 'player_id가 누락되었습니다.',
    });

    // Test Case 3: User not found
    await updateMoney(reqNotFound, res);
    assert.strictEqual(res.status.callCount, 3);
    assert.strictEqual(res.status.thirdCall.args[0], 200);
    assert.deepStrictEqual(res.json.thirdCall.args[0], {
      affectedRows: 0,
    });

    await connection.rollback();
  } catch (error) {
    console.error('updateMoney 오류 발생:', error);
    await sendErrorToDiscord('CI/CD 테스트 updateMoney 중 오류 발생', error);
    await connection.rollback();
  }
};
