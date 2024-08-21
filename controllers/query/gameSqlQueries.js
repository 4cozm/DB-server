const GAME_SQL_QUERIES = {
  // FIND_USER_BY_DEVICE_ID: 'SELECT * FROM user WHERE device_id = ?',
  // CREATE_USER: 'INSERT INTO user (id, device_id) VALUES (?, ?)',
  // UPDATE_USER_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
  // UPDATE_USER_LOCATION: 'UPDATE user SET x = ?, y = ? WHERE device_id = ?',
  CREATE_MATCH_HISTORY:
    "INSERT INTO match_history (game_session_id, player_id, `kill`, death, damage) VALUES(?, ?, ?, ?, ?)",
  CREATE_MATCH_LOG:
    "INSERT INTO match_log (game_session_id, green_player1_id, green_player2_id, blue_player1_id , blue_player2_id, winner_team, map_name, start_time, end_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
  FIND_ALL_ITEMS: 'SELECT * FROM item',
  FIND_ITEM_STATS: 'SELECT * FROM item WHERE item_id = ?',
};

export default GAME_SQL_QUERIES;
