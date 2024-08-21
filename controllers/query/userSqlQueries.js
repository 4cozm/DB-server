const SQL_QUERIES = {
  FIND_USER_BY_PLAYER_ID: "SELECT * FROM account WHERE `player_id` = ?",
  CHECK_DUPLICATE_PLAYER_ID: "SELECT * FROM Shards WHERE `Key` = ? AND `database` = ? AND`table` = ?",
  FIND_USER_BY_NAME: "SELECT * FROM Shards WHERE name = ?",
  CREATE_USER: "INSERT INTO account (player_id, name, pw, guild) VALUES (?, ?, ?, ?)",
  UPDATE_USER_LOGIN: "UPDATE account SET last_login = CURRENT_TIMESTAMP WHERE player_id = ?",
  FIND_MONEY_BY_PLAYER_ID: "SELECT money FROM money WHERE player_id = ?",
  UPDATE_MONEY: "UPDATE money SET money = ? WHERE player_id = ?",
  CREATE_USER_MONEY: "INSERT INTO money (player_id, money) VALUES (?, ?)",
  FIND_USER_INVENTORY_BY_PLAYER_ID: 'SELECT * FROM inventory WHERE player_id = ?',
  FIND_EQUIPPED_ITEMS_BY_PLAYER_ID: 'SELECT * FROM inventory WHERE player_id = ? AND equipped_items = 1',
  CREATE_INVENTORY: 'INSERT INTO inventory (player_id, item_id, equip_slot) VALUES (?, ?, ?)',
  EQUIP_ITEM: 'UPDATE inventory SET equipped_items = TRUE WHERE player_id = ? AND item_id = ?',
  UNEQUIP_ITEM: 'UPDATE inventory SET equipped_items = FALSE WHERE player_id = ? AND item_id = ?'
};

export default SQL_QUERIES;
