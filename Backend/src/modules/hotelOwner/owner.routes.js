import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import {
    createHotel,
    getMyHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
    createRoom,
    updateRoom,
    deleteRoom,
    getOwnerBookings,
    getBookingDetailsForOwner
} from "./owner.controller.js";
import { validateFileContent } from "../../middleware/fileValidation.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import { getOwnerHotelsSchema, hotelCreationSchema, hotelUpdateSchema } from "./owner.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { validateRoomId } from "../../middleware/validateRoomId.middleware.js";
import { validateHotelOwnership } from "../../middleware/validateHotelOwnership.middleware.js";
import { validateHotelId } from "../../middleware/validateHotelId.middleware.js";
import { createRoomSchema, updateRoomSchema } from "../rooms/room.validation.js";
import { validateOwnerBookingAccess } from "../../middleware/validateOwnerBookingAccess.middleware.js";
import { validateBookingId } from "../../middleware/validateBookingId.middleware.js";
import { getOwnerBookingsSchema } from "../bookings/booking.validation.js";

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

router.get("/hotels", validate(getOwnerHotelsSchema, "query"), getMyHotels);
router.get("/hotels/:hotelId", validateHotelId, validateHotelOwnership, getHotelById);

router.patch(
    "/hotels/:hotelId",
    validateHotelId,
    validateHotelOwnership,
    upload.array("images", 10),
    validateFileContent,
    validate(hotelUpdateSchema),
    updateHotel
);

router.delete(
    "/hotels/:hotelId",
    validateHotelId,
    validateHotelOwnership,
    deleteHotel
);

//Room management routes by owner
router.post(
    "/hotels/:hotelId/rooms",
    validateHotelId,
    validateHotelOwnership,
    validate(createRoomSchema),
    createRoom
);
router.patch(
    "/hotels/:hotelId/rooms/:roomId",
    validateHotelId,
    validateHotelOwnership,
    validateRoomId,
    validate(updateRoomSchema),
    updateRoom
);
router.delete(
    "/hotels/:hotelId/rooms/:roomId",
    validateHotelId,
    validateHotelOwnership,
    validateRoomId,
    deleteRoom
);

//Booking management routes by owner
router.get(
  "/bookings",
  validate(getOwnerBookingsSchema, "query"),
  getOwnerBookings
);

router.get(
  "/bookings/:bookingId",
  validateBookingId,
  validateOwnerBookingAccess,
  getBookingDetailsForOwner
);

export default router;