import { getShardByKey, getShardNumber, saveShard } from '../db/shardUtils.js';
import { toCamelCase } from '../utils/transformCase.js';
import fatalError from '../error/fatalError.js';
import formatDate from '../utils/dateFormatter.js';
import { DbConnections, mainDbConnections } from '../db/connect.js';
import { ErrorCodes } from '../error/errorCodes.js';
import { CustomError } from '../error/customError.js';
import SQL_QUERIES from './query/userSqlQueries.js';
import GAME_SQL_QUERIES from './query/gameSqlQueries.js';
import { setToMainDb } from '../db/main.js';
import { getCache, getHashCache, setCache, setHashCache } from '../db/elasticCache.js';

export const findUserByPlayerId = async (req, res) => {
  try {
    const { player_id } = req.query;
    if (!player_id) {
      return res.status(400).json({
        error: `필수 데이터가 누락되었습니다.`,
      });
    }
    const cache = await getHashCache('USER_DB', 'account', player_id);
    if (cache !== null) {
      return res.status(200).json(JSON.parse(cache));
    }
    const shard = await getShardByKey(player_id, 'USER_DB', 'account');

    const [rows] = await shard.query(SQL_QUERIES.FIND_USER_BY_PLAYER_ID, [player_id]);
    if (rows.length === 0) {
      fatalError(req, 'main DB에는 유저가 존재하지만 샤드에 해당 유저의 정보가 존재하지 않습니다');
    }
    console.log(rows);
    setHashCache('USER_DB', 'account', player_id, rows);
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
      throw new CustomError('중복된 ID 입니다', ErrorCodes.ALREADY_EXIST_ID);
    }

    connections['GAME_DB'].beginTransaction();
    connections['USER_DB'].beginTransaction();
    mainConnections.beginTransaction();

    await saveShard(shardNumber, 'USER_DB', 'account', SQL_QUERIES.CREATE_USER, player_id, [
      player_id,
      name,
      pw,
      guild,
    ]);
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
    const cache = await getCache('USER_DB', 'money', player_id);
    if (cache !== null) {
      return res.status(200).json(JSON.parse(cache));
    }
    const connection = await getShardByKey(player_id, 'USER_DB', 'money');
    const [rows] = await connection.query(SQL_QUERIES.FIND_MONEY_BY_PLAYER_ID, [player_id]);
    const money = rows.length > 0 ? toCamelCase(rows[0]) : null;
    setCache('USER_DB', 'money', player_id, money);
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
    await setCache('USER_DB', 'money', player_id, money);
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

export const purchaseEquipment = async (req, res) => {
  const { player_id, item_id, equip_slot, money } = req.body;
  if (player_id === null || item_id === null || equip_slot === null || money === null) {
    return res.status(400).json({
      errorMessage: `누락된 데이터가 있습니다 player_id:${player_id},item_id:${item_id}, equip_slot:${equip_slot},money:${equip_slot}`,
    });
  }

  const userMoneyConnection = await getShardByKey(player_id, 'USER_DB', 'money');
  const userInventoryConnection = await getShardByKey(player_id, 'USER_DB', 'inventory');
  try {
    await userMoneyConnection.beginTransaction();
    await userInventoryConnection.beginTransaction();

    let [rows] = await userInventoryConnection.query(SQL_QUERIES.CREATE_INVENTORY, [player_id, item_id, equip_slot]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }

    [rows] = await userMoneyConnection.query(SQL_QUERIES.UPDATE_MONEY, [money, player_id]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ errorMessage: `변경 사항이 반영되지 않았습니다. 영향을 받은 행이 없습니다` });
    }

    await userMoneyConnection.commit();
    await userInventoryConnection.commit();

    res.status(200).json({ player_id, item_id, equip_slot, money });
  } catch (error) {
    userMoneyConnection.rollback();
    userInventoryConnection.rollback();
    console.error(error);
    res.status(500).json({ errorMessage: 'purchaseEquipment 오류 발생' + error });
  }
};
export const findUserInventory = async (req, res) => {
  try {
    const { player_id } = req.query;
    if (player_id == null) {
      res.status(400).json({ errorMessage: '필수 데이터가 누락되었습니다.' });
    }
    const connection = await getShardByKey(player_id, 'USER_DB', 'inventory');
    const [rows] = await connection.query(SQL_QUERIES.FIND_USER_INVENTORY_BY_PLAYER_ID, [player_id]);
    setHashCache('USER_DB', 'inventory', player_id, rows);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ errorMessage: '유저의 인벤토리를 찾는중 오류 발생 : ' + error });
  }
};

export const findEquippedItems = async (req, res) => {
  try {
    const { player_id } = req.query;
    if (player_id == null) {
      res.status(400).json({ errorMessage: 'player_id 데이터가 누락되었습니다.', player_id });
    }
    const cache = await getHashCache('USER_DB', 'inventory', player_id);
    if (cache !== null) {
      return res.status(200).json(cache);
    }
    const connection = await getShardByKey(player_id, 'USER_DB', 'inventory');
    const [rows] = await connection.query(SQL_QUERIES.FIND_EQUIPPED_ITEMS_BY_PLAYER_ID, [player_id]);
    await setHashCache('USER_DB', 'inventory', player_id, rows);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ errorMessage: '유저가 장착한 아이템을 찾는중 오류 발생 :' + error });
  }
};

export const findItemIdInInventory = async (req, res) => {
  try {
    const { player_id, item_id } = req.query;
    if (player_id == null || item_id == null) {
      res.status(400).json({ errorMessage: `누락된 데이터가 있습니다. player_id:${player_id},item_id:${item_id}` });
    }
    const connection = await getShardByKey(player_id, 'USER_DB', 'inventory');
    const [rows] = await connection.query(SQL_QUERIES.FIND_ITEM_ID_IN_INVENTORY, [player_id, item_id]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ errorMessage: '유저 인벤토리에 해당 아이템을 찾는 중 오류 발생 : ' + error });
  }
};

export const equipItem = async (req, res) => {
  try {
    const { player_id, item_id } = req.body;
    if (player_id == null || item_id == null) {
      res.status(400).json({ errorMessage: `누락된 데이터가 있습니다. player_id:${player_id},item_id:${item_id}` });
    }
    const connection = await getShardByKey(player_id, 'USER_DB', 'inventory');
    const [rows] = await connection.query(SQL_QUERIES.EQUIP_ITEM, [player_id, item_id]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ errorMessage: '아이템을 장착하는 중 오류 발생 : ' + error });
  }
};

export const unequipItem = async (req, res) => {
  try {
    const { player_id, item_id } = req.body;
    if (player_id == null || item_id == null) {
      res.status(400).json({ errorMessage: `누락된 데이터가 있습니다. player_id:${player_id},item_id:${item_id}` });
    }
    const connection = await getShardByKey(player_id, 'USER_DB', 'inventory');
    const [rows] = await connection.query(SQL_QUERIES.UNEQUIP_ITEM, [player_id, item_id]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ errorMessage: '아이템을 탈착하는 중 오류 발생 : ' + error });
  }
};

export const countOfUsers = async (req, res) => {
  try {
    const connection = await mainDbConnections();
    const [rows] = await connection.query(SQL_QUERIES.COUNT_OF_USERS);
    console.log(rows);
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ errorMessage: '유저의 수를 확인하는 중 오류 발생 : ' + error });
  }
};
