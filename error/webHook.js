// import axios from "axios";
// import config from "../config/config.js";

// const webHookUrl = config.DISCORD.WEB_HOOK;

// export const sendErrorToDiscord = async (error, message) => {
//   const errorMessage = {
//     content: `노드 5기 여러분 제 목소리 들리시나요?~ DB에서 에러가 발생해서 급하게 알려드립니다~${message} : ${error}`,
//   };

//   try {
//     await axios.post(webHookUrl, errorMessage);
//   } catch (error) {
//     console.log("Discord로 에러 메세지를 보내는데 실패했습니다");
//   }
// };
