import express from "express";
import { createPayment } from "./payment.controller.js";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { validateBookingId } from "../../middleware/validateBookingId.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, validateBookingId, createPayment);

export default router;