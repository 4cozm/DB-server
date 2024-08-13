import { saveShard } from "../db/shardUtils.js";
import { getShardNumber } from "../utils/shardUtils.js";

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
  CREATE_CHARACTER:
    "INSERT INTO `character` (character_name, hp, speed, power, defense, critical, price) VALUES (?, ?, ?, ?, ?, ?, ?)",
  CREATE_CHARACTER_SKILLS:
    "INSERT INTO character_skills (skill_name, skill_type, character_id, damage_factor, cool_time, `range`, `scale`) VALUES (?, ?, ?, ?, ?, ?, ?)",
};

export const createMatchHistory = async (req, res) => {
  try {
    const { sessionId, playerId, kill, death, damage } = req.body;
    if (!sessionId || !playerId || !kill || !death || !damage) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(sessionId);
    await saveShard(shard, game, GAME_SQL_QUERIES.CREATE_MATCH_HISTORY, sessionId, [
      sessionId,
      playerId,
      kill,
      death,
      damage,
    ]);
    res.status(200).json({ sessionId, playerId, kill, death, damage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createMatchHistory 오류 발생" + error });
  }
};

export const createMatchLog = async (req, res) => {
  try {
    const { sessionId, redPlayer1Id, redPlayer2Id, bluePlayer1Id, bluePlayer2Id, winTeam, startTime } = req.body;
    if (!sessionId || !redPlayer1Id || !redPlayer2Id || !bluePlayer1Id || !bluePlayer2Id || !winTeam || !startTime) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const endTime = Date.now();
    const shard = getShardNumber(sessionId);
    await shard.game.query(GAME_SQL_QUERIES.CREATE_MATCH_LOG, [
      sessionId,
      redPlayer1Id,
      redPlayer2Id,
      bluePlayer1Id,
      bluePlayer2Id,
      winTeam,
      formatDate(new Date(startTime)),
      formatDate(new Date(endTime)),
    ]);
    res.status(201).json({ sessionId, redPlayer1Id, redPlayer2Id, bluePlayer1Id, bluePlayer2Id, winTeam, endTime });
  } catch (error) {
    res.status(500).json({ errorMessage: "createMatchLog 오류 발생:" + error });
    console.error(error);
  }
};

export const createUserScore = async (req, res) => {
  try {
    const { playerId, score } = req.body;
    if (!playerId || !score) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(playerId);
    await shard.game.query(GAME_SQL_QUERIES.CREATE_USER_SCORE, [playerId, score]);
    res.status(201).json({ playerId, score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createUserScore 오류 발생" + error });
  }
};

export const createUserRating = async (req, res) => {
  try {
    const { playerId, characterId, win, lose } = req.body;
    if (!playerId || !characterId || !win || !lose) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(playerId);
    await shard.game.query(GAME_SQL_QUERIES.CREATE_USER_RATING, [playerId, characterId, win, lose]);
    res.status(201).json({ playerId, characterId, win, lose });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createUserRating 오류 발생" + error });
  }
};

export const updateUserScore = async (req, res) => {
  try {
    const { playerId, score } = req.body;
    if (!playerId || !score) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(playerId);
    const [rows] = await shard.game.query(GAME_SQL_QUERIES.UPDATE_USER_SCORE, [score, playerId]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `Player ID ${playerId}를 찾지 못했습니다` });
    }
    res.status(200).json({ playerId, score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "updateUserScore 오류 발생" + error });
  }
};

export const updateUserRating = async (req, res) => {
  try {
    const { playerId, characterId, win, lose } = req.body;
    if (!playerId || !characterId || !win || !lose) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(playerId);
    const [rows] = await shard.game.query(GAME_SQL_QUERIES.UPDATE_USER_RATING, [win, lose, playerId, characterId]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `Player ID ${playerId}를 찾지 못했습니다` });
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
    if (!playerId) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(playerId);
    const [rows] = await shard.game.query(GAME_SQL_QUERIES.FIND_USER_SCORE_BY_PLAYER_ID, [playerId]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `Player ID ${playerId}를 찾지 못했습니다` });
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
    if (!playerId) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(playerId);
    const [rows] = shard.game.query(GAME_SQL_QUERIES.FIND_USER_RATING_BY_PLAYER_ID, [playerId]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `Player ID ${playerId}를 찾지 못했습니다` });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "findUserRatingTable 오류 발생" + error });
  }
};

export const createCharacter = async (req, res) => {
  try {
    const { characterName, hp, speed, power, defense, critical, price } = req.body;
    if ((!characterName || !hp || !speed || !power || !defense, !critical || !price)) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(characterName);
    await shard.game.query(GAME_SQL_QUERIES.CREATE_CHARACTER, [
      characterName,
      hp,
      speed,
      power,
      defense,
      critical,
      price,
    ]);
    res.status(201).json({ characterName, hp, speed, power, defense, critical, price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createCharacter 오류 발생" + error });
  }
};

export const createCharacterSkill = async (req, res) => {
  try {
    const { skillName, skillType, characterId, damageFactor, coolTime, range, scale } = req.body;
    if (!skillName || !skillType || !characterId || !damageFactor || !coolTime || !range || !scale) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(skillName);
    await shard.game.query(GAME_SQL_QUERIES.CREATE_CHARACTER_SKILLS, [
      skillName,
      skillType,
      characterId,
      damageFactor,
      coolTime,
      range,
      scale,
    ]);
    res.status(201).json({ skillName, skillType, characterId, damageFactor, coolTime, range, scale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createCharacterSkill 오류 발생" + error });
  }
};

export const findPossessionByPlayerID = async (req, res) => {
  //포지션 보다는 캐릭터 보유 목록을 반환하는게 어떨까
  try {
    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(playerId);
    const [rows] = await shard.game.query(GAME_SQL_QUERIES.FIND_POSSESSION_BY_PLAYER_ID, [playerId]);
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
    if (!player_id || !character_id) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShardNumber(player_id);
    await shard.game.query(GAME_SQL_QUERIES.CREATE_POSSESSION, [player_id, character_id]);
    res.status(200).json({ player_id, character_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "createPossession 오류 발생" + error });
  }
};
