import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createBookingSchema } from "./booking.validation.js";
import { createBooking } from "./booking.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, validate(createBookingSchema), createBooking);

export default router;