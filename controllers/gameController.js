import { getShardByKey, saveShard } from '../db/shardUtils.js';
import { getShardNumber } from '../db/shardUtils.js';
import formatDate from '../utils/dateFormatter.js';
import { DbConnections } from '../db/connect.js';
import GAME_SQL_QUERIES from './query/gameSqlQueries.js';
import SQL_QUERIES from './query/userSqlQueries.js';

//주의! 이미 유저의 테이블이 있다고 가정하고 사용하는 함수입니다 이후 담당자가 변경해주세요
export const createMatchHistory = async (req, res) => {
  try {
    const { session_id, player_id, kill, death, damage } = req.body;

    if (session_id == null || player_id == null || kill == null || death == null || damage == null) {
      return res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
    }

    const connection = await getShardByKey(player_id, 'GAME_DB', 'match_history'); //이미 해당 테이블이 생성되어 있어야함
    const log = await connection.query(GAME_SQL_QUERIES.CREATE_MATCH_HISTORY, [
      session_id,
      player_id,
      kill,
      death,
      damage,
    ]);

    res.status(200).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'createMatchHistory 오류 발생: ' + error });
  }
};

export const dbSaveTransaction = async (req, res) => {
  const { win_team, lose_team, users, session_id, win_team_color, start_time, map_name } = req.body;
  if (
    win_team == null ||
    lose_team == null ||
    users == null ||
    session_id == null ||
    win_team_color == null ||
    start_time == null ||
    map_name == null
  ) {
    return res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
  }
  try {
    await Promise.all([
      await updateUserScore(win_team, lose_team),
      await updateUserRating(win_team, lose_team),
      await createMatchHistory(users, session_id),
      await createMatchLog(session_id, win_team, lose_team, win_team_color, start_time, map_name),
      await gameEndUpdateUserMoney(users),
    ]);

    res.status(200).json({ message: '대전 결과 db 저장 완료!' });
  } catch (error) {
    console.error('dbSaveTransaction 에러 발생', error);
    const errorData = {
      win_team,
      lose_team,
      users,
      session_id,
      win_team_color,
      start_time,
      map_name,
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    await saveErrorDataToFile(errorData, session_id);
    res.status(500).json({ errorMessage: 'dbSaveTransaction 에러 발생', error });
  }
};

export const createMatchLog = async (session_id, win_team, lose_team, win_team_color, start_time, map_name) => {
  try {
    const end_time = Date.now();
    const shard = await getShardNumber();
    await saveShard(shard, 'GAME_DB', 'match_log', GAME_SQL_QUERIES.CREATE_MATCH_LOG, session_id, [
      session_id,
      win_team[0].playerId,
      win_team[1].playerId,
      lose_team[0].playerId,
      lose_team[1].playerId,
      win_team_color,
      map_name,
      formatDate(new Date(start_time)),
      formatDate(new Date(end_time)),
    ]);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateUserScore = async (win_team, lose_team) => {
  for (const user of win_team) {
    try {
      const connection = await getShardByKey(user.playerId, 'GAME_DB', 'score');
      const score = await getUserScore(user.playerId);
      await connection.query(GAME_SQL_QUERIES.UPDATE_USER_SCORE, [score + 50, user.playerId]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  for (const user of lose_team) {
    try {
      const connection = await getShardByKey(user.playerId, 'GAME_DB', 'score');
      let score = await getUserScore(user.playerId);
      if (score - 25 <= 0) {
        score = 0;
        await connection.query(GAME_SQL_QUERIES.UPDATE_USER_SCORE, [score, user.playerId]);
      } else {
        await connection.query(GAME_SQL_QUERIES.UPDATE_USER_SCORE, [score - 25, user.playerId]);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

export const updateUserRating = async (win_team, lose_team) => {
  for (const user of win_team) {
    try {
      const connection = await getShardByKey(user.playerId, 'GAME_DB', 'rating');
      const rating = await getUserRating(user.playerId);
      await connection.query(GAME_SQL_QUERIES.UPDATE_USER_RATING, [
        ++rating.win,
        rating.lose,
        user.playerId,
        user.characterId,
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  for (const user of lose_team) {
    try {
      const connection = await getShardByKey(user.playerId, 'GAME_DB', 'rating');
      const rating = await getUserRating(user.playerId);
      await connection.query(GAME_SQL_QUERIES.UPDATE_USER_RATING, [
        rating.win,
        ++rating.lose,
        user.playerId,
        user.characterId,
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

export const getUserScore = async (playerId) => {
  //최종 프로젝트 파일과 함수명 다름 findUserScoreTable
  try {
    const connection = await getShardByKey(playerId, 'GAME_DB', 'score');
    const [rows] = await connection.query(GAME_SQL_QUERIES.FIND_USER_SCORE_BY_PLAYER_ID, [playerId]);
    return rows[0].score;
  } catch (error) {
    console.error(error);
  }
};

export const getUserRating = async (player_id) => {
  try {
    const connection = await getShardByKey(player_id, 'GAME_DB', 'rating');
    const [rows] = await connection.query(GAME_SQL_QUERIES.FIND_USER_RATING_BY_PLAYER_ID, [player_id]);
    return rows[0];
  } catch (error) {
    console.error(error);
  }
};

export const gameEndUpdateUserMoney = async (users) => {
  for (const user of users) {
    try {
      const connection = await getShardByKey(user.playerId, 'USER_DB', 'money');
      const [userMoney] = await connection.query(SQL_QUERIES.FIND_MONEY_BY_PLAYER_ID, [user.playerId]);
      console.log(userMoney);
      await connection.query(SQL_QUERIES.UPDATE_MONEY, [userMoney[0].money + 5000, user.playerId]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

// 해당 기능은 챔피언? 영웅을 만드는 기능인데, 지금은 해당 데이터를 바로 저장해둔 상태라서 추가하는 기능은 불필요하다고 생각했음(사용하려면 구조 변경해야함)
// export const createCharacter = async (req, res) => {
//   try {
//     const { characterName, hp, speed, power, defense, critical, price } = req.body;
//     if (
//       characterName == null ||
//       hp == null ||
//       speed == null ||
//       power == null ||
//       defense == null ||
//       critical == null ||
//       price == null
//     ) {
//       return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
//     }
//     const shard = await getShardNumber();
//     const log = await saveShard(shard, "GAME_DB", "character", GAME_SQL_QUERIES.CREATE_CHARACTER, characterName, [
//       characterName,
//       hp,
//       speed,
//       power,
//       defense,
//       critical,
//       price,
//     ]);
//     res.status(201).json(log);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ errorMessage: "createCharacter 오류 발생" + error });
//   }
// };

// export const createCharacterSkill = async (req, res) => {
//   try {
//     const { skillName, skillType, characterId, damageFactor, coolTime, range, scale } = req.body;
//     if (!skillName || !skillType || !characterId || !damageFactor || !coolTime || !range || !scale) {
//       return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
//     }
//     const shard = getShardNumber(skillName);
//     await shard.game.query(GAME_SQL_QUERIES.CREATE_CHARACTER_SKILLS, [
//       skillName,
//       skillType,
//       characterId,
//       damageFactor,
//       coolTime,
//       range,
//       scale,
//     ]);
//     res.status(201).json({ skillName, skillType, characterId, damageFactor, coolTime, range, scale });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ errorMessage: "createCharacterSkill 오류 발생" + error });
//   }
// };

export const findPossessionByPlayerID = async (req, res) => {
  try {
    const { player_id } = req.query;
    if (player_id == null) {
      return res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
    }
    const connection = await getShardByKey(player_id, 'GAME_DB', 'possession');
    const [rows] = await connection.query(GAME_SQL_QUERIES.FIND_POSSESSION_BY_PLAYER_ID, [player_id]);
    if (rows.length < 0) {
      return res.status(404).json(`${player_id}유저를 찾지 못했습니다`);
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'findPossessionByPlayerID 오류 발생' + error });
  }
};

export const updatePossession = async (req, res) => {
  const { player_id, character_id } = req.body;
  if (player_id == null || character_id == null) {
    return res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
  }
  try {
    const connection = await getShardByKey(player_id, 'GAME_DB', 'possession');
    const [character] = await connection.query(GAME_SQL_QUERIES.FIND_POSSESSION_BY_PLAYER_ID, [player_id]);
    const [rows] = await connection.query(GAME_SQL_QUERIES.UPDATE_POSSESSION, [
      character[0].character_id + character_id,
      player_id,
    ]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }
    res.status(200).json({ player_id, character_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'updatePossession 오류 발생' + error });
  }
};

export const purchaseCharacter = async (req, res) => {
  const { player_id, character_id, money } = req.body;
  if (player_id == null || character_id == null || money) {
    return res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
  }

  const gameConnection = await getShardByKey(player_id, 'GAME_DB', 'possession');
  const userConnection = await getShardByKey(player_id, 'USER_DB', 'money');
  try {
    await gameConnection.beginTransaction();
    await userConnection.beginTransaction();

    const [character] = await gameConnection.query(GAME_SQL_QUERIES.FIND_POSSESSION_BY_PLAYER_ID, [player_id]);
    let [rows] = await gameConnection.query(GAME_SQL_QUERIES.UPDATE_POSSESSION, [
      character[0].character_id + character_id,
      player_id,
    ]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }

    [rows] = await userConnection.query(SQL_QUERIES.UPDATE_MONEY, [money, player_id]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }

    await gameConnection.commit();
    await userConnection.commit();

    res.status(200).json({ player_id, character_id, money });
  } catch (error) {
    gameConnection.rollback();
    userConnection.rollback();
    console.error(error);
    res.status(500).json({ errorMessage: 'purchaseCharacter 오류 발생' + error });
  }
};

export const findCharacterData = async (req, res) => {
  //모든 샤드의 GAME_DB에는 캐릭터 정보가 중복 포함되어 있음. redis 같은곳으로 캐릭터 조회를 옮겨야 함. 일단 어거지로 구현만 해둘 예정
  try {
    const connections = DbConnections();
    const [rows] = await connections[0]['GAME_DB'].query(GAME_SQL_QUERIES.FIND_CHARACTERS_DATA);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'findCharacterData 오류 발생' + error });
  }
};

/**
 * findCharacterData 와 유사함 쿼리는 일단 따로 만들어서 작동하게 끔 해둠
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const findCharacterInfo = async (req, res) => {
  const { character_id } = req.body;
  if (character_id == null) {
    return res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
  }
  try {
    const connections = DbConnections();
    const [rows] = await connections[0]['GAME_DB'].query(GAME_SQL_QUERIES.FIND_CHARACTERS_INFO, [character_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'findCharacterInfo 오류 발생' + error });
  }
};
