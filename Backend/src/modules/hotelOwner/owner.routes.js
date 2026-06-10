import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import {
    createHotel,
    getMyHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
} from "./owner.controller.js";
import { validateFileContent } from "../../middleware/fileValidation.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import { hotelCreationSchema, hotelUpdateSchema } from "./owner.validation.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorize("owner"));

// router.get("/dashboard", dashboard);

//Hotel management routes by owner
router.post(
    "/hotels",
    upload.array("images", 10),
    validateFileContent,
    validate(hotelCreationSchema),
    createHotel
);

router.get("/hotels", getMyHotels);
router.get("/hotels/:id", getHotelById);

router.patch(
    "/hotels/:id",
    upload.array("images", 10),
    validateFileContent,
    validate(hotelUpdateSchema),
    updateHotel
);

router.delete(
    "/hotels/:id",
    deleteHotel
);

//Room management routes by owner
// router.post("hotels/:id/rooms", createRoom);

// router.get("hotels/:id/rooms", getRooms);
// router.get("hotels/:id/rooms/:id", getSingleRoom);

// router.patch("hotels/:id/rooms/:id", updateRoom);

// router.delete("hotels/:id/rooms/:id", deleteRoom);

//Booking management routes by owner
// router.get("bookings", getMyBookings);
// router.get("bookings/:id", getBookingDetails);

export default router;