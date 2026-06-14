import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { getRoomsSchema } from "./room.validation.js";
import { validateHotelId } from "../../middleware/validateHotelId.middleware.js";
import { validateRoomId } from "../../middleware/validateRoomId.middleware.js";
import { getRoomById, getRooms } from "./room.controller.js";

const router = express.Router({ mergeParams: true });

router.use(validateHotelId);

router.get(
    "/",
    validate(getRoomsSchema, "query"),
    getRooms
);

router.get("/:roomId", validateRoomId, getRoomById);

export default router;