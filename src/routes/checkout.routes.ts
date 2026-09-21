import { Router } from "express";
import { createCheckoutController } from "../controllers/checkout.controller.js";

const router = Router();

router.post("/", createCheckoutController);

export default router;