import express from 'express';
import * as userController from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/findUserByPlayerId', userController.findUserByPlayerId);
userRouter.get('/findMoneyByPlayerId', userController.findMoneyByPlayerId);
userRouter.post('/createUser', userController.createUser);
userRouter.patch('/updateUserLogin', userController.updateUserLogin);
userRouter.patch('/updateMoney', userController.updateMoney);
userRouter.patch("/purchaseEquipment", userController.purchaseEquipment);
userRouter.get('/findUserInventory', userController.findUserInventory);
userRouter.get('/findEquippedItems', userController.findEquippedItems);
userRouter.get('/findItemIdInInventory', userController.findItemIdInInventory);
userRouter.patch('/equipItem', userController.equipItem);
userRouter.patch('/unequipItem', userController.unequipItem);
userRouter.get('/countOfUsers', userController.countOfUsers);

// userRouter.patch("/purchaseEquipment", userController.purchaseEquipment);

export default userRouter;
