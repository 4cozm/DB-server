import express from "express";
import * as gameController from "../controllers/gameController.js";

const gameRouter = express.Router();

gameRouter.post("/createMatchHistory", gameController.createMatchHistory);
gameRouter.post("/createMatchLog", gameController.createMatchLog);
gameRouter.post("/createUserScore", gameController.createUserScore);
gameRouter.post("/createUserRating", gameController.createUserRating);
gameRouter.patch("/updateUserRating", gameController.updateUserRating);
gameRouter.get("/getUserScore", gameController.getUserScore);
gameRouter.get("/getUserRating", gameController.getUserRating);
// gameRouter.post("/createCharacter", gameController.createCharacter);
gameRouter.post("/createPossession", gameController.createPossession);
gameRouter.get("/findPossessionByPlayerID", gameController.findPossessionByPlayerID);
gameRouter.get("/findCharacterData", gameController.findCharacterData);
gameRouter.get("/findCharacterInfo", gameController.findCharacterInfo);
gameRouter.patch("/updatePossession", gameController.updatePossession);

export default gameRouter;