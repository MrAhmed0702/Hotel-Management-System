import { deleteImage } from "../../utils/deleteImage.js";
import {
    createHotelService,
    getMyHotelsService,
    getHotelByIdService,
    updateHotelService,
    deleteHotelService
} from "./owner.service.js";

import path from "path";

// Create hotel
export const createHotel = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const hotelData = req.validatedData;

        const baseURL = `${req.protocol}://${req.get("host")}`;
        const images = req.files?.map(file => `${baseURL}/uploads/hotels/${file.filename}`) || [];

        const result = await createHotelService(userId, { ...hotelData, images });
        res.status(201).json({
            success: true,
            message: "Hotel created successfully",
            data: result
        });
    } catch (error) {
        await deleteImage(req.files?.map(file => file.path));
        next(error);
    }
}

// Get all hotels of a owner
export const getMyHotels = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, search } = req.query;

        const result = await getMyHotelsService(userId, { page, limit, search });

        res.status(200).json({
            success: true,
            message: "Hotels fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Get hotel by ID
export const getHotelById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const hotelId = req.params.id;
        const result = await getHotelByIdService(userId, hotelId);
        res.status(200).json({
            success: true,
            message: "Hotel fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Update hotel
export const updateHotel = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const hotelId = req.params.id;

        const baseURL = `${req.protocol}://${req.get("host")}`;

        let deletedImages = [];

        try {
            deletedImages = JSON.parse(req.body.deletedImages || "[]");
        } catch {
            deletedImages = [];
        }

        const newImages = req.files?.map(file => `${baseURL}/uploads/hotels/${file.filename}`) || [];

        const result = await updateHotelService(userId, hotelId, req.validatedData, deletedImages, newImages);

        res.status(200).json({
            success: true,
            message: "Hotel updated successfully",
            data: result
        });

    } catch (error) {
        await deleteImage(req.files?.map(file => file.path));
        next(error);
    }
}

// Delete hotel
export const deleteHotel = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const hotelId = req.params.id;
        const deletedHotel = await deleteHotelService(userId, hotelId);

        res.status(200).json({
            success: true,
            message: "Hotel deleted successfully",
            data: deletedHotel
        });
    } catch (error) {
        next(error);
    }
}