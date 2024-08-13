//에러의 내용을 웹 후크로 전송하는 코드

// import { sendErrorToDiscord } from "./webHook.js";

export const fatalError = (error, message) => {
  // sendErrorToDiscord(error, message);
  console.log("fatalError발생", error);
};

export default fatalError;
