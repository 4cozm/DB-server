import SQL_QUERIES from '../controllers/query/userSqlQueries.js';
import {
  createUser,
  findUserByPlayerId,
  updateUserLogin,
  findMoneyByPlayerId,
  updateMoney,
} from '../controllers/userController.js';
import { sendErrorToDiscord } from '../utils/webHook.js';

/**
 * 테스트 항목
 * - findUserByPlayerId
 * - createUser
 * - createUserMoney
 * - updateUserLogin
 * - findMoneyByPlayerId
 * - updateMoney
 */

//* createUser *//
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

//Test response
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

  try {
    await connection.beginTransaction(); 
    await createUser(req, res);

    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', res.body);

    if (res.statusCode !== 201 || !res.body || !res.body.player_id) {
        throw new Error('유저 생성 실패');
    }

    await connection.rollback();
  } catch (error) {
    console.error('createUser 오류 발생: ', error);

    await sendErrorToDiscord('CI/CD 테스트 중 createUser 중 오류 발생', error);

    await connection.rollback();
  } 
};

//* findUserByPlayerId *//
export const findUserFuncTest = async (connection) =>{

    let player_id = 'TCU1'; 
    let req = {
        query: { player_id },
    };

    let res = {
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

    try {
        await connection.beginTransaction();
        await findUserByPlayerId(req, res);

        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', res.body);

        if (res.statusCode !== 200 || !res.body || res.body.length === 0) {
            throw new Error('유저 조회 실패 또는 데이터를 찾을 수 없습니다.');
        }

        await connection.rollback();
    } catch (error) {
        console.error('findUserByPlayerId 오류 발생: ', error);

        await sendErrorToDiscord('CI/CD 테스트 중 findUserByPlayerId 중 오류 발생', error);

        await connection.rollback();
    } 
};

//* updateUserLogin *//
export const updateUserLoginFuncTest = async (connection) => {
    
    //Test 1 : Correct player_id
    const reqSuccess = {
        body: {
            player_id: 'TCU1', 
        },
    };

    //Test 2: Missing player_id
    const reqMissing = {
        body: {
            
        },
    };

    //Test 3: Non-existing player_id
    const reqNotFound = {
        body: {
            player_id: 'NonExistingPlayer', 
        },
    };

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

    try {
        await connection.beginTransaction();

        // Test Case 1: Successful login update
        await updateUserLogin(reqSuccess, res);
        console.log('Success Case - Response Status:', res.statusCode);
        console.log('Success Case - Response Body:', res.body);

        if (res.statusCode !== 200 || !res.body || res.body.message !== '마지막 로그인 시간 업데이트 성공') {
            throw new Error('로그인 시간 업데이트 실패');
        }

        // Test Case 2: Missing player_id
        await updateUserLogin(reqMissing, res);
        console.log('Missing player_id Case - Response Status:', res.statusCode);
        console.log('Missing player_id Case - Response Body:', res.body);

        if (res.statusCode !== 400 || !res.body || !res.body.errorMessage) {
            throw new Error('player_id가 누락되었습니다');
        }

        // Test Case 3: User not found
        await updateUserLogin(reqNotFound, res);
        console.log('User Not Found Case - Response Status:', res.statusCode);
        console.log('User Not Found Case - Response Body:', res.body);

        if (res.statusCode !== 404 || !res.body || !res.body.errorMessage) {
            throw new Error('존재하지 않는 유저입니다 ');
        }

        await connection.rollback();
    } catch (error) {
        console.error('updateUserLogin 오류 발생:', error);
        await sendErrorToDiscord('CI/CD 테스트 updateUserLogin 중 오류 발생', error);
        await connection.rollback();
    } 
};

//* findMoneyByPlayerId *//
export const findMoneyFuncTest = async (connection) => {
    
    //Test 1 : Correct player_id
    const reqSuccess = {
        query: {
            player_id: 'TCU1', 
        },
    };

    //Test 2: Missing player_id
    const reqMissing = {
        query: {

        },
    };
    
    //Test 3: Non-existing player_id
    const reqNotFound = {
        query: {
            player_id: 'NonExistentPlayer', 
        },
    };

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

    try {
        await connection.beginTransaction();

        // Test Case 1: Successful in finding user money
        await findMoneyByPlayerId(reqSuccess, res);
        console.log('Success Case - Response Status:', res.statusCode);
        console.log('Success Case - Response Body:', res.body);

        if (res.statusCode !== 201 || !res.body || typeof res.body.amount !== 'number') {
            throw new Error('유저의 money 조회 실패');
        }

        // Test Case 2 : Missing player_id
        await findMoneyByPlayerId(reqMissing, res);
        console.log('Missing player_id Case - Response Status:', res.statusCode);
        console.log('Missing player_id Case - Response Body:', res.body);

        if (res.statusCode !== 400 || !res.body || !res.body.errorMessage) {
            throw new Error('player_id가 누락되었습니다.');
        }

        //Test Case 3: User not found
        await findMoneyByPlayerId(reqNotFound, res);
        console.log('User Not Found Case - Response Status:', res.statusCode);
        console.log('User Not Found Case - Response Body:', res.body);

        if (res.statusCode !== 201 || res.body !== null) {
            throw new Error('존재하지 않는 유저입니다.');
        }

        await connection.rollback();
    } catch (error) {
        console.error('findMoneyByPlayerId 오류 발생:', error);
        await sendErrorToDiscord('CI/CD 테스트 findMoneyByPlayerId 중 오류 발생', error);
        await connection.rollback();
    } 
};

//* updateMoney *//
export const updateMoneyFuncTest = async (connection) => {
    
    // Test 1: Correct player_id 
    const reqSuccess = {
        body: {
            player_id: 'TCU1', 
            money: 1000, 
        },
    };

    //Test 2: Missing player_id
    const reqMissing = {
        body: {

            money: 1000,
        },
    };

    // Test 3: Non-existing player_id
    const reqNotFound = {
        body: {
            player_id: 'NonExistentPlayer', 
            money: 1000,
        },
    };

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

    try {
        await connection.beginTransaction();

        // Test Case 1: Successful money update
        await updateMoney(reqSuccess, res);
        console.log('Success Case - Response Status:', res.statusCode);
        console.log('Success Case - Response Body:', res.body);

        if (res.statusCode !== 200 || !res.body || res.body.affectedRows === 0) {
            throw new Error('유저의 돈 업데이트 실패');
        }

        // Test Case 2: Missing player_id
        await updateMoney(reqMissing, res);
        console.log('Missing player_id Case - Response Status:', res.statusCode);
        console.log('Missing player_id Case - Response Body:', res.body);

        if (res.statusCode !== 400 || !res.body || !res.body.errorMessage) {
            throw new Error('player_id가 누락되었습니다.');
        }

        // Test Case 3: User not found
        await updateMoney(reqNotFound, res);
        console.log('User Not Found Case - Response Status:', res.statusCode);
        console.log('User Not Found Case - Response Body:', res.body);

        if (res.statusCode !== 200 || !res.body || res.body.affectedRows === 0) {
            throw new Error('존재하지 않는 유저입니다.');
        }

        await connection.rollback();
    } catch (error) {
        console.error('updateMoney 오류 발생:', error);
        await sendErrorToDiscord('CI/CD 테스트 updateMoney 중 오류 발생', error);
        await connection.rollback();
    } 
};
