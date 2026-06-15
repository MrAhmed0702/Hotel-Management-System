import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { getUserDetails, updateUserDetails, softDeleteUser, getMyBookings, getBookingById, cancelBooking } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateUserSchema } from "./user.validation.js";
import { upload } from "../../middleware/upload.middleware.js"
import { validateFileContent } from "../../middleware/fileValidation.middleware.js";
import { cancelBookingSchema, getBookingsSchema } from "../bookings/booking.validation.js";
import { validateBookingId } from "../../middleware/validateBookingId.middleware.js";
import { validateBookingOwnership } from "../../middleware/validateBookingOwnership.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/me", getUserDetails);

router.patch("/me", upload.single("profilePicture"), validateFileContent, validate(updateUserSchema), updateUserDetails);

router.delete("/me", softDeleteUser);

router.get("/bookings", validate(getBookingsSchema, "query"), getMyBookings);

router.get("/bookings/:bookingId", validateBookingId, validateBookingOwnership, getBookingById);

router.patch("/bookings/:bookingId/cancel", validateBookingId, validateBookingOwnership, validate(cancelBookingSchema), cancelBooking);

export default router;