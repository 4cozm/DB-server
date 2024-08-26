import {
  dbSaveTransaction,
  findPossessionByPlayerID,
  purchaseCharacter,
  updatePossession,
} from '../controllers/gameController.js';

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
const daSaveTransactionTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let session_id = 'testSessionId';
    let users = [
      { playerId: 'test1', kill: 2, death: 0, damage: 132 },
      { playerId: 'test2', kill: 0, death: 1, damage: 118 },
      { playerId: 'test3', kill: 0, death: 1, damage: 82 },
      { playerId: 'test4', kill: 1, death: 1, damage: 68 },
    ];
    let win_team = [
      { playerId: 'test1', kill: 2, death: 0, damage: 132 },
      { playerId: 'test2', kill: 0, death: 1, damage: 118 },
    ];
    let lose_team = [
      { playerId: 'test3', kill: 0, death: 1, damage: 82 },
      { playerId: 'test4', kill: 1, death: 1, damage: 68 },
    ];
    let win_team_color = 'green';
    let start_time = Date.now();
    let map_name = '비내리는 호남선';
    let req = {
      body: { win_team, lose_team, users, session_id, win_team_color, start_time, map_name },
    };
    await dbSaveTransaction(req, res);
    console.log('test성공!');
    connection.rollback();
  } catch (e) {
    sendTestErrorToDiscord(e.message);
  }
};

const findPossessionTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let player_id = 'testId';
    let req = {
      body: { player_id },
    };
    await findPossessionByPlayerID(req, res);
    connection.rollback();
  } catch (e) {
    sendTestErrorToDiscord(e.message);
  }
};

const updatePossessionTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let player_id = 'testId';
    let character_id = 4;
    let req = {
      body: { player_id, character_id },
    };
    await updatePossession(req, res);
    connection.rollback();
  } catch (e) {
    sendTestErrorToDiscord(e.message);
  }
};

const purchaseCharacterTest = async (connection) => {
  try {
    await connection.beginTransaction();
    let player_id = 'testId';
    let character_id = 2;
    let money = 15000;
    let req = {
      body: { player_id, character_id, money },
    };
    await purchaseCharacter(req, res);
    connection.rollback();
  } catch (e) {
    sendTestErrorToDiscord(e.message);
  }
};

const sendTestErrorToDiscord = async (message) => {
  const errorMessage = {
    content: `노드 5기 여러분 제 목소리 들리시나요?~ CI/CD 게임함수 테스트 중 에러가 발생해서 급하게 알려드립니다~${message}`,
  };

  try {
    await axios.post(webHookUrl, errorMessage);
  } catch (error) {
    console.log('Discord로 에러 메세지를 보내는데 실패했습니다');
  }
};
