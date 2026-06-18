import express from "express";
import { getPayment } from "./payment.controller.js";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { validatePaymentId } from "../../middleware/validatePaymentId.middleware.js";

const router = express.Router();

router.get("/:paymentId", verifyToken, validatePaymentId, getPayment);

export default router;