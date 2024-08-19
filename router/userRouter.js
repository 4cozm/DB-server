import express from "express";
import * as userController from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/findUserByPlayerId", userController.findUserByPlayerId);
userRouter.get("/findMoneyByPlayerId", userController.findMoneyByPlayerId);
userRouter.post("/createUser", userController.createUser);
userRouter.patch("/updateUserLogin", userController.updateUserLogin);
userRouter.post("/createUserMoney", userController.createUserMoney);
userRouter.patch("/updateMoney", userController.updateMoney);

export default userRouter;
