import express from "express";
import { register, login } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { loginLimiter } from "../../middleware/rateLimit.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import { validateFileContent } from "../../middleware/fileValidation.middleware.js";

const router = express.Router();

router.post(
  "/register",
  upload.single("photo"), // 🔥 THIS IS IMPORTANT
  validateFileContent, // 🔥 validate file content before processing
  validate(registerSchema),
  register
);

router.post("/login", loginLimiter, validate(loginSchema), login);

export default router;