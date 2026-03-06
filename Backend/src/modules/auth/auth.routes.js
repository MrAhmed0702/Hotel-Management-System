import express from "express";
import { register, login } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { loginLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", loginLimiter, validate(loginSchema), login);

export default router;