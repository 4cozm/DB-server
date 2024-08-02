import express from "express";
import * as dbController from "../controllers/dbController.js"


const dbRouter = express.Router();

dbRouter.put('/migration',dbController.migration);

export default dbRouter;