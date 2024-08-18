import express from "express";
import dbRouter from "./router/dbRouter.js";
import userRouter from "./router/userRouter.js";
import gameRouter from "./router/gameRouter.js";
import { connectMainDb, makeDbConnect } from "./db/connect.js";
import webHookRouter from "./router/webHook.js";
import { verifySignature } from "./utils/verifySignature.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  console.log("hello");
  res.send("Hello World!");
});

app.use(express.json());
app.use("/", router);
app.use("/api/db", dbRouter);
app.use("/api/user", userRouter);
app.use("/api/game", gameRouter);
app.use("/api/webhook", bodyParser.json({ verify: verifySignature }), webHookRouter);

app.listen(process.env.PORT, process.env.HOST, async () => {
  await makeDbConnect();
  await connectMainDb();
  console.log(`서버가 ${process.env.HOST}:${process.env.PORT}에서 시작됨`);
});
