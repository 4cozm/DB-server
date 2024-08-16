import express from "express";
import * as webHookController from "../controllers/webHookController.js";

const webHookRouter = express.Router();

webHookRouter.post("/", webHookController.webHook);

export default webHookRouter;
