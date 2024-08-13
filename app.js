import express from "express";
import dbRouter from "./router/dbRouter.js";
import userRouter from "./router/userRouter.js";
import { makeDbConnect } from "./utils/connect.js";
import { getShard } from "./utils/shardUtils.js";

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

app.listen(PORT, async () => {
  await makeDbConnect();
  console.log("DB서버 시작됨 :", PORT);
  console.log(getShard());
});
