import express from 'express';
import * as gameController from '../controllers/gameController.js';

const gameRouter = express.Router();

// gameRouter.post("/createCharacter", gameController.createCharacter);
gameRouter.get('/findCharacterData', gameController.findCharacterData);
gameRouter.get('/findCharacterInfo', gameController.findCharacterInfo);
gameRouter.patch('/updatePossession', gameController.updatePossession);
gameRouter.patch('/purchaseCharacter', gameController.purchaseCharacter);
gameRouter.get('/findPossessionByPlayerID', gameController.findPossessionByPlayerID);
gameRouter.post("/dbSaveTransaction", gameController.dbSaveTransaction);

export default gameRouter;
