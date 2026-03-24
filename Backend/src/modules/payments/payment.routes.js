import express from "express";
import { confirmPayment, failPayment, getPayment } from "./payment.controller.js";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/:paymentId/confirm", verifyToken, confirmPayment);

router.post("/:paymentId/fail", verifyToken, failPayment);

router.get("/:paymentId", verifyToken, getPayment);

export default router;