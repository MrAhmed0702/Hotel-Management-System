import crypto from "crypto";
import { ApiError } from "../../../utils/apiError.js";

export const verifyWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      throw new ApiError(400, "Missing signature");
    }

    // 🔥 MUST be raw body buffer
    const rawBody = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET) // ⚠️ different secret
      .update(rawBody)
      .digest("hex");

    // Prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      throw new ApiError(401, "Invalid signature");
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      throw new ApiError(401, "Invalid webhook signature");
    }

    next();
  } catch (error) {
    next(error);
  }
};