import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { hotelSchema } from "./hotel.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createHotel } from "./hotel.controller.js";

const router = express.Router();

router.post("/", verifyToken, authorize("admin"), validate(hotelSchema), createHotel);

export default router;