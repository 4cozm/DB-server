import express from "express";
import dbRouter from "./router/dbRouter.js";
import dbConnection from "./utils/connect.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/db", dbRouter);

app.listen(PORT, () => {
  console.log(dbConnection[1]);
  console.log(dbConnection[2]);
  console.log(dbConnection[3]);
  console.log("DB서버 시작됨 :", PORT);
});
