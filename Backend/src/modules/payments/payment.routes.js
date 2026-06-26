import express from "express";
import { getPayments, getPaymentById, verifyPayment } from "./payment.controller.js";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { validatePaymentId } from "../../middleware/validatePaymentId.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getPayments);

router.post("/verify", verifyToken, verifyPayment);

router.get("/:paymentId", verifyToken, validatePaymentId, getPaymentById);

export default router;