//테스트 코드
import { DbConnections } from '../db/connect.js';
import * as gameFuncTest from './gameFuncTest.js';
import * as userFuncTest from './userFuncTest.js';
const startTest = async () => {
  const connections = DbConnections();
  for (const key in connections) {
    if (connections[key].hasOwnProperty('GAME_DB')) {
      const gameDbConnection = connections[key].GAME_DB;
      await gameFuncTest.dbSaveTransactionTest(gameDbConnection);
      await gameFuncTest.findPossessionTest(gameDbConnection);
      await gameFuncTest.updatePossessionTest(gameDbConnection);
      await gameFuncTest.purchaseCharacterTest(gameDbConnection);
    } else if (connections[key].hasOwnProperty('USER_DB')) {
      const userDbConnection = connections[key].USER_DB;
      await userFuncTest.createUserFuncTest(userDbConnection);
      await userFuncTest.findMoneyFuncTest(userDbConnection);
      await userFuncTest.findUserFuncTest(userDbConnection);
      await userFuncTest.updateMoneyFuncTest(userDbConnection);
      await userFuncTest.updateUserLoginFuncTest(userDbConnection);
    }
  }
};

export default startTest;
