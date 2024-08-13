import express from "express";
import * as userController from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/findUserDataByPlayerId", userController.findUserDataByPlayerId);
userRouter.get("/findMoneyByPlayerId", userController.findMoneyByPlayerId);
userRouter.post("/createUser", userController.createUser);
userRouter.post("/updateUserLogin", userController.updateUserLogin);
export default userRouter;
