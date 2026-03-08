import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createRoom, getRoom, getRoomById, updateRoom, deleteRoom } from "./room.controller.js";
import { createRoomSchema } from "./room.validation.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, authorize("admin"), validate(createRoomSchema), createRoom);

router.get("/", getRoom);

router.get("/:roomId", getRoomById);

router.patch("/:roomId", verifyToken, authorize("admin"), updateRoom);

router.delete("/:roomId", verifyToken, authorize("admin"), deleteRoom);

export default router;