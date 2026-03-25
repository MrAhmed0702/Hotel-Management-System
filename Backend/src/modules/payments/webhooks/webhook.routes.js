import express from "express";
import { verifyWebhookSignature } from "./webhook.middleware.js";
import { handleWebhook } from "./webhook.controller.js";

const router = express.Router();

router.post("/payments", verifyWebhookSignature, handleWebhook);

export default router;