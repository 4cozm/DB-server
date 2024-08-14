import { getShardByKey, saveShard } from "../db/shardUtils.js";
import { getShardNumber } from "../db/shardUtils.js";
import formatDate from "../utils/dateFormatter.js";
import { DbConnections } from "../db/connect.js";

const GAME_SQL_QUERIES = {
  // FIND_USER_BY_DEVICE_ID: 'SELECT * FROM user WHERE device_id = ?',
  // CREATE_USER: 'INSERT INTO user (id, device_id) VALUES (?, ?)',
  // UPDATE_USER_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
  // UPDATE_USER_LOCATION: 'UPDATE user SET x = ?, y = ? WHERE device_id = ?',
  CREATE_MATCH_HISTORY:
    "INSERT INTO match_history (game_session_id, player_id, `kill`, death, damage) VALUES(?, ?, ?, ?, ?)",
  CREATE_MATCH_LOG:
    "INSERT INTO match_log (game_session_id, red_player1_id, red_player2_id, blue_player1_id , blue_player2_id, winner_team, start_time, end_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
  FIND_POSSESSION_BY_PLAYER_ID: "SELECT * FROM possession WHERE player_id = ?",
  CREATE_POSSESSION: "INSERT INTO possession (player_id, character_id) VALUES(?, ?)",
  CREATE_USER_SCORE: "INSERT INTO score (player_id, score) VALUES(?, ?)",
  CREATE_USER_RATING: "INSERT INTO rating (player_id, character_id, win, lose) VALUES(?, ?, ?, ?)",
  UPDATE_USER_SCORE: "UPDATE score SET score = ? WHERE player_id = ?",
  UPDATE_USER_RATING: "UPDATE rating SET win = ?, lose = ? WHERE player_id = ? AND character_id = ?",
  FIND_USER_SCORE_BY_PLAYER_ID: "SELECT * FROM score WHERE player_id = ?",
  FIND_USER_RATING_BY_PLAYER_ID: "SELECT * FROM rating WHERE player_id = ?",
  FIND_CHARACTERS_DATA: "SELECT * FROM `character`",
  FIND_CHARACTERS_INFO: "SELECT * FROM `character` WHERE character_id=? ",
  UPDATE_POSSESSION: "UPDATE possession SET character_id = ? WHERE player_id = ?",
};

export const createMatchHistory = async (req, res) => {
  try {
    const { sessionId, playerId, kill, death, damage } = req.body;
    if (sessionId == null || playerId == null || kill == null || death == null || damage == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = await getShardNumber();
    const log = await saveShard(shard, "GAME_DB", "match_history", GAME_SQL_QUERIES.CREATE_MATCH_HISTORY, sessionId, [
      sessionId,
      playerId,
      kill,
      death,
      damage,
    ]);
    res.status(200).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createMatchHistory 오류 발생" + error });
  }
};

export const createMatchLog = async (req, res) => {
  try {
    const { sessionId, redPlayer1Id, redPlayer2Id, bluePlayer1Id, bluePlayer2Id, winTeam, startTime } = req.body;
    if (
      sessionId == null ||
      redPlayer1Id == null ||
      redPlayer2Id == null ||
      bluePlayer1Id == null ||
      bluePlayer2Id == null ||
      winTeam == null ||
      startTime == null
    ) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const endTime = Date.now();
    const shard = await getShardNumber();
    const log = await saveShard(shard, "GAME_DB", "match_log", GAME_SQL_QUERIES.CREATE_MATCH_LOG, sessionId, [
      sessionId,
      redPlayer1Id,
      redPlayer2Id,
      bluePlayer1Id,
      bluePlayer2Id,
      winTeam,
      formatDate(new Date(startTime)),
      formatDate(new Date(endTime)),
    ]);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ errorMessage: "createMatchLog 오류 발생:" + error });
    console.error(error);
  }
};

export const createUserScore = async (req, res) => {
  try {
    const { playerId, score } = req.body;
    if (playerId == null || score == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = await getShardNumber();
    const log = await saveShard(shard, "GAME_DB", "score", GAME_SQL_QUERIES.CREATE_USER_SCORE, playerId, [
      playerId,
      score,
    ]);
    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createUserScore 오류 발생" + error });
  }
};

export const createUserRating = async (req, res) => {
  try {
    const { playerId, characterId, win, lose } = req.body;
    if (playerId == null || characterId == null || win == null || lose == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = await getShardNumber();
    const log = await saveShard(shard, "GAME_DB", "rating", GAME_SQL_QUERIES.CREATE_USER_RATING, playerId, [
      playerId,
      characterId,
      win,
      lose,
    ]);
    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createUserRating 오류 발생" + error });
  }
};

export const updateUserScore = async (req, res) => {
  try {
    const { playerId, score } = req.body;
    if (playerId == null || score == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const connection = getShardByKey(playerId, "GAME_DB", "score");
    await connection.query(GAME_SQL_QUERIES.UPDATE_USER_SCORE, [score, playerId]);
    res.status(200).json({ playerId, score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "updateUserScore 오류 발생" + error });
  }
};

export const updateUserRating = async (req, res) => {
  try {
    const { playerId, characterId, win, lose } = req.body;
    if (playerId == null || characterId == null || win == null || lose == null) {
      return res.status(400).json({
        errorMessage: `필수 데이터가 누락되었습니다.playerId:${playerId},characterId:${characterId},win:${win},lose:${lose}`,
      });
    }
    const connection = await getShardByKey(playerId, "GAME_DB", "rating");
    const [rows] = await connection.query(GAME_SQL_QUERIES.UPDATE_USER_RATING, [win, lose, playerId, characterId]);
    console.log(rows);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }
    res.status(200).json({ playerId, characterId, win, lose });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "updateUserRating 오류 발생" + error });
  }
};

export const getUserScore = async (req, res) => {
  //최종 프로젝트 파일과 함수명 다름 findUserScoreTable
  try {
    const { playerId } = req.body;
    if (playerId == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const connection = await getShardByKey(playerId, "GAME_DB", "score");
    const [rows] = await connection.query(GAME_SQL_QUERIES.FIND_USER_SCORE_BY_PLAYER_ID, [playerId]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "findUserScoreTable 오류 발생" + error });
  }
};

export const getUserRating = async (req, res) => {
  try {
    const { playerId } = req.body;
    if (playerId == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const connection = await getShardByKey(playerId, "GAME_DB", "rating");
    const [rows] = await connection.query(GAME_SQL_QUERIES.FIND_USER_RATING_BY_PLAYER_ID, [playerId]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "findUserRatingTable 오류 발생" + error });
  }
};

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
    const { playerId } = req.body;
    if (playerId == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const connection = await getShardByKey(playerId, "GAME_DB", "possession");
    const [rows] = await connection.query(GAME_SQL_QUERIES.FIND_POSSESSION_BY_PLAYER_ID, [playerId]);
    if (rows.length < 0) {
      return res.status(404).json(`${playerId}유저를 찾지 못했습니다`);
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "findPossessionByPlayerID 오류 발생" + error });
  }
};

export const createPossession = async (req, res) => {
  try {
    const { player_id, character_id } = req.body;
    if (player_id == null || character_id == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = await getShardNumber();
    const log = await saveShard(shard, "GAME_DB", "possession", GAME_SQL_QUERIES.CREATE_POSSESSION, player_id, [
      player_id,
      character_id,
    ]);
    res.status(200).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createPossession 오류 발생" + error });
  }
};

export const updatePossession = async (req, res) => {
  const { player_id, character_id } = req.body;
  if (player_id == null || character_id == null) {
    return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
  }
  try {
    const connection = await getShardByKey(player_id, "GAME_DB", "possession");
    const [rows] = await connection.query(GAME_SQL_QUERIES.CREATE_POSSESSION, [player_id, character_id]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }
    res.status(200).json({ player_id, character_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "updatePossession 오류 발생" + error });
  }
};

export const findCharacterData = async (req, res) => {
  //모든 샤드의 GAME_DB에는 캐릭터 정보가 중복 포함되어 있음. redis 같은곳으로 캐릭터 조회를 옮겨야 함. 일단 어거지로 구현만 해둘 예정
  try {
    const connections = DbConnections();
    const [rows] = await connections[0]["GAME_DB"].query(GAME_SQL_QUERIES.FIND_CHARACTERS_DATA);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "findCharacterData 오류 발생" + error });
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
    return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
  }
  try {
    const connections = DbConnections();
    const [rows] = await connections[0]["GAME_DB"].query(GAME_SQL_QUERIES.FIND_CHARACTERS_INFO, [character_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "findCharacterInfo 오류 발생" + error });
  }
};
