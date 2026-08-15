import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import mobileStorageRouter from "./mobile-storage.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mobileStorageRouter);

export default router;
