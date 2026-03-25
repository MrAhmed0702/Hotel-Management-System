import express from "express";
import { getPayment } from "./payment.controller.js";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/:paymentId", verifyToken, getPayment);

export default router;