import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/apiError.js";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many requests. Try again after 15 minutes"));
  }
});