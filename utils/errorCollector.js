import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const errorDataDir = path.join(__dirname, '../error/errorData');

/**
 * 트랜잭션 실패 시 데이터를 파일로 저장하는 함수
 * @param {Object} errorData - 저장할 에러 데이터 객체
 * @param {string} sessionId - 세션 ID를 이용해 고유한 파일명을 생성
 */
const saveErrorDataToFile = async (errorData, sessionId) => {
  const filePath = path.join(errorDataDir, `transaction_${sessionId}.json`);

  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(errorData, null, 2), 'utf-8');
    console.log(`에러 데이터를 ${filePath}에 저장했습니다.`);
  } catch (fileError) {
    console.error('에러 데이터를 저장하는 중 문제가 발생했습니다.', fileError);
  }
};

export default saveErrorDataToFile;
