import express from "express";
import * as gameController from "../controllers/gameController.js";

const gameRouter = express.Router();

gameRouter.post("/createUserScore", gameController.createUserScore);
gameRouter.post("/createUserRating", gameController.createUserRating);
// gameRouter.post("/createCharacter", gameController.createCharacter);
gameRouter.post("/createPossession", gameController.createPossession);
gameRouter.get("/findCharacterData", gameController.findCharacterData);
gameRouter.get("/findCharacterInfo", gameController.findCharacterInfo);
gameRouter.patch("/updatePossession", gameController.updatePossession);
gameRouter.get("/findPossessionByPlayerID", gameController.findPossessionByPlayerID);
gameRouter.post("/dbSaveTransaction", gameController.dbSaveTransaction);

export default gameRouter;
