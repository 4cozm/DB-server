import { getShardByKey, getShardNumber, saveShard } from '../db/shardUtils.js';
import { toCamelCase } from '../utils/transformCase.js';
import fatalError from '../error/fatalError.js';
import formatDate from '../utils/dateFormatter.js';
import { mainDbConnections } from '../db/connect.js';
import { ErrorCodes } from '../error/errorCodes.js';
import { CustomError } from '../error/customError.js';
import SQL_QUERIES from './query/userSqlQueries.js';
import GAME_SQL_QUERIES from './query/gameSqlQueries.js';
import { DbConnections } from '../db/connect.js';
import { setToMainDb } from '../db/main.js';

export const findUserByPlayerId = async (req, res) => {
  try {
    const { player_id } = req.query;
    if (!player_id) {
      return res.status(400).json({
        error: `필수 데이터가 누락되었습니다.`,
      });
    }
    const shard = await getShardByKey(player_id, 'USER_DB', 'account');

    const [rows] = await shard.query(SQL_QUERIES.FIND_USER_BY_PLAYER_ID, [player_id]);
    if (rows.length === 0) {
      fatalError('', 'main DB에는 유저가 존재하지만 샤드에 해당 유저의 정보가 존재하지 않습니다');
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, errorCode: ErrorCodes.USER_NOT_FOUND });
  }
};

export const createUser = async (req, res) => {
  const shardNumber = await getShardNumber();
  const connections = DbConnections()[shardNumber];
  const mainConnections = mainDbConnections();

  try {
    const { player_id, name, pw, guild, money, character_id } = req.body;
    if (player_id == null || pw == null || name == null || guild == null || money == null || character_id == null) {
      return res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
    }
    const check = await accountDuplicateCheck(player_id);
    if (!check) {
      throw new CustomError('중복된 닉네임 입니다', ErrorCodes.ALREADY_EXIST_ID);
    }

    connections['GAME_DB'].beginTransaction();
    connections['USER_DB'].beginTransaction();
    mainConnections.beginTransaction();

    // main DB에 샤드 껍데기만 생성
    await setToMainDb(player_id, shardNumber, 'USER_DB', 'inventory');
    await setToMainDb(player_id, shardNumber, 'GAME_DB', 'match_history');
    await saveShard(shardNumber, 'GAME_DB', 'rating', GAME_SQL_QUERIES.CREATE_USER_RATING, player_id, [
      player_id,
      character_id,
      0,
      0,
    ]);
    await saveShard(shardNumber, 'GAME_DB', 'score', GAME_SQL_QUERIES.CREATE_USER_SCORE, player_id, [player_id, 0]);

    // 계정 생성
    await saveShard(shardNumber, 'USER_DB', 'account', SQL_QUERIES.CREATE_USER, player_id, [
      player_id,
      name,
      pw,
      guild,
    ]);

    //Money 생성
    await saveShard(shardNumber, 'USER_DB', 'money', SQL_QUERIES.CREATE_USER_MONEY, player_id, [player_id, money]);

    //소유 캐릭터 생성
    await saveShard(shardNumber, 'GAME_DB', 'possession', GAME_SQL_QUERIES.CREATE_POSSESSION, player_id, [
      player_id,
      character_id,
    ]);

    connections['GAME_DB'].commit();
    connections['USER_DB'].commit();
    mainConnections.commit();

    res.status(201).json({ message: '계정 생성 성공', player_id });
  } catch (error) {
    connections['GAME_DB'].rollback();
    connections['USER_DB'].rollback();
    mainConnections.rollback();
    console.error(error);
    res.status(500).json({ message: '계정 생성중 오류 발생', error: error.message, errorCode: error.errorCode });
  }
};

export const updateUserLogin = async (req, res) => {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
    }
    const shard = await getShardByKey(player_id, 'USER_DB', 'account');
    const [rows] = await shard.query(SQL_QUERIES.UPDATE_USER_LOGIN, [player_id]);
    if (rows.affectedRows === 0) {
      res.status(404).json({ errorMessage: `Player ID ${player_id}를 찾지 못했습니다` });
    }
    res.status(200).json({ message: '마지막 로그인 시간 업데이트 성공', date: formatDate(Date.now()) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '마지막 로그인 시간 업데이트 중 오류 발생 : ' + error });
  }
};

export const findMoneyByPlayerId = async (req, res) => {
  try {
    const { player_id } = req.query;
    if (!player_id) {
      res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
    }

    const connection = await getShardByKey(player_id, 'USER_DB', 'money');
    const [rows] = await connection.query(SQL_QUERIES.FIND_MONEY_BY_PLAYER_ID, [player_id]);
    const money = rows.length > 0 ? toCamelCase(rows[0]) : null;
    res.status(201).json(money);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '유저의 돈을 불러오는 중 오류 발생 : ' + error });
  }
};

export const updateMoney = async (req, res) => {
  try {
    const { player_id, money } = req.body;
    if (player_id == null) {
      res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
    }
    const connection = await getShardByKey(player_id, 'USER_DB', 'money');
    const [rows] = await connection.query(SQL_QUERIES.UPDATE_MONEY, [money, player_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '유저의 돈을 수정하는 중 오류 발생 : ' + error });
  }
};

const accountDuplicateCheck = async (player_id) => {
  const shard = await mainDbConnections();
  const [rows] = await shard.query(SQL_QUERIES.CHECK_DUPLICATE_PLAYER_ID, [player_id, 'USER_DB', 'account']);
  if (rows.length > 0) {
    return false;
  }
  return true;
};
