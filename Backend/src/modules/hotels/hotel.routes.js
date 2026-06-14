import express from "express";
import { getAllHotels, getHotelById } from "./hotel.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { getHotelsSchema } from "./hotel.validation.js";
import { validateHotelId } from "../../middleware/validateHotelId.middleware.js"

const router = express.Router();

router.get("/", validate(getHotelsSchema, "query"), getAllHotels);

router.get("/:hotelId", validateHotelId, getHotelById);

export default router;