import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createRoom, getRooms, getRoomById, updateRoom, deleteRoom } from "./room.controller.js";
import { createRoomSchema, updateRoomSchema } from "./room.validation.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, authorize("admin"), validate(createRoomSchema), createRoom);

router.get("/", getRooms);

router.get("/:roomId", getRoomById);

router.patch("/:roomId", verifyToken, authorize("admin"), validate(updateRoomSchema), updateRoom);

router.delete("/:roomId", verifyToken, authorize("admin"), deleteRoom);

export default router;