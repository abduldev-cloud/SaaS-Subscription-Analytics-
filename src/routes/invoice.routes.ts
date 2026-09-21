import { Router } from "express";
import { getInvoice } from "../controllers/invoice.controller.js";

const router = Router();

router.get("/:invoiceNumber", getInvoice);

export default router;