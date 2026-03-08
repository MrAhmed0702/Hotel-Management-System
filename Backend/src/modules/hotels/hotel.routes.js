import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { createHotelSchema, updateHotelSchema } from "./hotel.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createHotel, getAllHotels, getHotelById, updateHotel, deleteHotel } from "./hotel.controller.js";

const router = express.Router();

router.post("/", verifyToken, authorize("admin"), validate(createHotelSchema), createHotel);

router.get("/", getAllHotels);

router.get("/:id", getHotelById);

router.patch("/:id", verifyToken, authorize("admin"), validate(updateHotelSchema), updateHotel);

router.delete("/:id", verifyToken, authorize("admin"), deleteHotel);

export default router;