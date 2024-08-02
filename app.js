import express from "express";
import dbRouter from "./router/dbRouter.js";
import { makeDbConnect } from "./utils/connect.js";


const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/db", dbRouter);

app.listen(PORT, () => {
  makeDbConnect();
  console.log("DB서버 시작됨 :", PORT);
});
