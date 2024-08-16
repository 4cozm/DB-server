import { sendErrorToDiscord } from "../utils/webHook.js";

export const fatalError = (error, message) => {
  sendErrorToDiscord(error, message);
  console.log("fatalError발생", error);
};

export default fatalError;
