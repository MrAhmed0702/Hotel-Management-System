import express from "express";
import { createPayment } from "./payment.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, createPayment);

export default router;