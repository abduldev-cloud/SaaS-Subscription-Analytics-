import { Router } from "express";
import { getUserSubscriptionsController } from "../controllers/subscription.controller.js";

const router = Router();

router.get("/user/:userId", getUserSubscriptionsController);

export default router;