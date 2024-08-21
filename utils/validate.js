/**
 * 각종 유효성 검사의 양식을 저장하는 파일
 */

export const validDatabases = ['GAME_DB', 'USER_DB', 'ERROR_DB'];
export const validTables = {
  GAME_DB: ['character', 'character_skill', 'rating', 'match_history', 'match_log', 'possession', 'score'],
  USER_DB: ['account', 'money', 'item','inventory'],
  ERROR_DB: ['error_log'],
};
