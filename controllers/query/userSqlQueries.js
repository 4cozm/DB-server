const SQL_QUERIES = {
  FIND_USER_BY_PLAYER_ID: "SELECT * FROM account WHERE `player_id` = ?",
  CHECK_DUPLICATE_PLAYER_ID: "SELECT * FROM Shards WHERE `Key` = ? AND `database` = ? AND`table` = ?",
  FIND_USER_BY_NAME: "SELECT * FROM Shards WHERE name = ?",
  CREATE_USER: "INSERT INTO account (player_id, name, pw, guild) VALUES (?, ?, ?, ?)",
  UPDATE_USER_LOGIN: "UPDATE account SET last_login = CURRENT_TIMESTAMP WHERE player_id = ?",
  FIND_MONEY_BY_PLAYER_ID: "SELECT money FROM money WHERE player_id = ?",
  UPDATE_MONEY: "UPDATE money SET money = ? WHERE player_id = ?",
  CREATE_USER_MONEY: "INSERT INTO money (player_id, money) VALUES (?, ?)",
};

export default SQL_QUERIES;