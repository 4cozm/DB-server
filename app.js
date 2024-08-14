import express from "express";
import dbRouter from "./router/dbRouter.js";
import userRouter from "./router/userRouter.js";
import gameRouter from "./router/gameRouter.js";
import { connectMainDb, makeDbConnect } from "./db/connect.js";

const app = express();
const PORT = 3000;
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

app.listen(PORT, async () => {
  await makeDbConnect();
  await connectMainDb();
  console.log("DB서버 시작됨 :", PORT);
});
