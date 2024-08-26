import express from 'express';
import * as dbController from '../controllers/dbController.js';

const dbRouter = express.Router();

dbRouter.put('/resetAllSchema', dbController.resetAllSchema);
dbRouter.put('/flushAllData', dbController.flushAllData);
export default dbRouter;
