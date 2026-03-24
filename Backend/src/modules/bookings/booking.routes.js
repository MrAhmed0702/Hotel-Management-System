import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import {
  getMyBookings,
  getBookingById,
  cancelBooking
} from "./booking.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/my", verifyToken, getMyBookings);

router.get("/:bookingId", verifyToken, getBookingById);

router.patch("/:bookingId/cancel", verifyToken, cancelBooking);

export default router;