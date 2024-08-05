import { getShard } from "../utils/shardUtils.js";
import { toCamelCase } from "../utils/transformCase.js";

const SQL_QUERIES = {
  FIND_USER_BY_PLAYER_ID: "SELECT * FROM account WHERE player_id = ?",
  FIND_USER_BY_NAME: "SELECT * FROM account WHERE name = ?",
  CREATE_USER: "INSERT INTO account (player_id, pw, name) VALUES (?, ?, ?)",
  UPDATE_USER_LOGIN: "UPDATE account SET last_login = CURRENT_TIMESTAMP WHERE player_id = ?",
  FIND_MONEY_BY_PLAYER_ID: "SELECT money FROM money WHERE player_id = ?",
};

export const findUserByPlayerId = async (req, res) => {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShard(player_id);
    const [rows] = await shard.user.query(SQL_QUERIES.FIND_USER_BY_PLAYER_ID, [player_id]);
    const user = rows.length > 0 ? toCamelCase(rows[0]) : null;

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "이름 검색중 에러 발생 :" + error });
  }
};

// export const findUserByName = async (name) => { 이름값은 샤딩 되있지 않아서 다시 생각해봐야함 수리중--
//   const [rows] = await getShard(name).query(SQL_QUERIES.FIND_USER_BY_NAME, [name]);
//   return toCamelCase(rows[0]);
// };

export const createUser = async (req, res) => {
  try {
    const { player_id, pw, name } = req.body;

    if (!player_id || !pw || !name) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShard(player_id);
    await shard.user.query(SQL_QUERIES.CREATE_USER, [player_id, pw, name]);
    res.status(201).json({ message: "계정 생성 성공", playerId: player_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "계정 생성중 오류 발생 : " + error });
  }
};

export const updateUserLogin = async (req, res) => {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = getShard(player_id);
    const [rows] = await shard.user.query(SQL_QUERIES.UPDATE_USER_LOGIN, [player_id]);
    if (rows.affectedRows === 0) {
      res.status(404).json({ errorMessage: `Player ID ${player_id}를 찾지 못했습니다` });
    }
    res.status(200).json({ message: "마지막 로그인 시간 업데이트 성공" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "마지막 로그인 시간 업데이트 중 오류 발생 : " + error });
  }
};

export const findMoneyByPlayerId = async (req, res) => {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }

    const shard = getShard(player_id);
    const [rows] = await shard.user.query(SQL_QUERIES.FIND_MONEY_BY_PLAYER_ID, [player_id]);
    const money = rows.length > 0 ? toCamelCase(rows[0]) : null;
    res.status(201).json(money);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "유저의 돈을 불러오는 중 오류 발생 : " + error });
  }
};
