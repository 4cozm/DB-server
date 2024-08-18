import { getShardByKey, getShardNumber, saveShard } from "../db/shardUtils.js";
import { toCamelCase } from "../utils/transformCase.js";
import fatalError from "../error/fatalError.js";
import formatDate from "../utils/dateFormatter.js";
import { mainDbConnections } from "../db/connect.js";

const SQL_QUERIES = {
  FIND_USER_BY_PLAYER_ID: "SELECT * FROM account WHERE player_id = ?",
  FIND_USER_BY_NAME: "SELECT * FROM account WHERE name = ?",
  CREATE_USER: "INSERT INTO account (player_id, pw, name, guild) VALUES (?, ?, ?, ?)",
  UPDATE_USER_LOGIN: "UPDATE account SET last_login = CURRENT_TIMESTAMP WHERE player_id = ?",
  FIND_MONEY_BY_PLAYER_ID: "SELECT money FROM money WHERE player_id = ?",
  UPDATE_MONEY: "UPDATE money SET money = ? WHERE player_id = ?",
  CREATE_USER_MONEY: "INSERT INTO money (player_id, money) VALUES (?, ?)",
};

export const findUserByPlayerId = async (req, res) => {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      return res.status(400).json({
        errorMessage: `필수 데이터가 누락되었습니다.`,
      });
    }
    const shard = await getShardByKey(player_id, "USER_DB", "account");
    const [rows] = await shard.query(SQL_QUERIES.FIND_USER_BY_PLAYER_ID, [player_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { player_id, name, pw, guild } = req.body;
    if (player_id == null || pw == null || name == null || guild == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const check = await accountDuplicateCheck(player_id);
    if (!check) {
      throw new Error("중복된 닉네임 입니다");
    }
    await saveShard(await getShardNumber(), "USER_DB", "account", SQL_QUERIES.CREATE_USER, player_id, [
      player_id,
      name,
      pw,
      guild,
    ]);
    res.status(201).json({ message: "계정 생성 성공", player_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "계정 생성중 오류 발생", error: error.message });
  }
};

export const createUserMoney = async (req, res) => {
  try {
    const { player_id, money } = req.body;
    if (player_id == null || money == null) {
      return res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    await saveShard(await getShardNumber(), "USER_DB", "money", SQL_QUERIES.CREATE_USER_MONEY, player_id, [
      player_id,
      money,
    ]);
    res.status(201).json({ message: "money 정보 생성 완료", player_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "money 정보 생성중 오류 발생", error: error.message });
  }
};

export const updateUserLogin = async (req, res) => {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      res.status(400).json({ errorMessage: "필수 데이터가 누락되었습니다." });
    }
    const shard = await getShardByKey(player_id, "USER_DB", "account");
    const [rows] = await shard.query(SQL_QUERIES.UPDATE_USER_LOGIN, [player_id]);
    if (rows.affectedRows === 0) {
      res.status(404).json({ errorMessage: `Player ID ${player_id}를 찾지 못했습니다` });
    }
    res.status(200).json({ message: "마지막 로그인 시간 업데이트 성공", date: formatDate(Date.now()) });
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

    const connection = await getShardByKey(player_id, "USER_DB", "money");
    const [rows] = await connection.query(SQL_QUERIES.FIND_MONEY_BY_PLAYER_ID, [player_id]);
    const money = rows.length > 0 ? toCamelCase(rows[0]) : null;
    res.status(201).json(money);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "유저의 돈을 불러오는 중 오류 발생 : " + error });
  }
};

const accountDuplicateCheck = async (player_id) => {
  try {
    const shard = await mainDbConnections();
    const [rows] = await shard.query(SQL_QUERIES.FIND_USER_BY_PLAYER_ID, [player_id]);
    if (rows.length > 0) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
  }
};
