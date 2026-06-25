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

// Middleware to parse JSON-stringified multipart fields (address, amenities)
const parseHotelFormData = (req, res, next) => {
    try {
        if (req.body.address && typeof req.body.address === 'string') {
            req.body.address = JSON.parse(req.body.address);
        }
        if (req.body.amenities && typeof req.body.amenities === 'string') {
            req.body.amenities = JSON.parse(req.body.amenities);
        }
    } catch (e) {
        // Leave as-is; let Joi report the validation error
    }
    next();
};

const parseRoomFormData = (req, res, next) => {
    try {
        if (req.body.amenities && typeof req.body.amenities === 'string') {
            req.body.amenities = JSON.parse(req.body.amenities);
        }
    } catch (e) {
        // Leave as-is; let Joi report the validation error
    }
    next();
};

router.use(verifyToken);
router.use(authorize("owner"));

// router.get("/dashboard", dashboard);

//Hotel management routes by owner
router.post(
    "/hotels",
    upload.array("images", 10),
    validateFileContent,
    parseHotelFormData,
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
    parseHotelFormData,
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
    upload.array("images", 10),
    validateFileContent,
    parseRoomFormData,
    validate(createRoomSchema),
    createRoom
);
router.patch(
    "/hotels/:hotelId/rooms/:roomId",
    validateHotelId,
    validateHotelOwnership,
    validateRoomId,
    upload.array("images", 10),
    validateFileContent,
    parseRoomFormData,
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