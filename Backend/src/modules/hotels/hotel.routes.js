import express from "express";
import { getAllHotels, getHotelById } from "./hotel.controller.js";

const router = express.Router();

router.get("/", getAllHotels);

router.get("/:id", getHotelById);

export default router;