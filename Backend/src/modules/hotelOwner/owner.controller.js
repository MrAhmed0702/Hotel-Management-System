import { deleteImage } from "../../utils/deleteImage.js";
import {
    createHotelService,
    getMyHotelsService,
    updateHotelService,
    deleteHotelService,
    createRoomService,
    updateRoomService,
    deleteRoomService,
    getOwnerBookingsService
} from "./owner.service.js";


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
        const { page, limit, search } = req.validatedData;

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
        res.status(200).json({
            success: true,
            message: "Hotel fetched successfully",
            data: req.targetHotel
        });
    } catch (error) {
        next(error);
    }
}

// Update hotel
export const updateHotel = async (req, res, next) => {
    try {
        const baseURL = `${req.protocol}://${req.get("host")}`;

        let deletedImages = [];

        try {
            deletedImages = JSON.parse(req.body.deletedImages || "[]");
        } catch {
            deletedImages = [];
        }

        const newImages = req.files?.map(file => `${baseURL}/uploads/hotels/${file.filename}`) || [];

        const result = await updateHotelService(req.targetHotel, req.validatedData, deletedImages, newImages);

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
        const deletedHotel = await deleteHotelService(req.targetHotel);

        res.status(200).json({
            success: true,
            message: "Hotel deleted successfully",
            data: deletedHotel
        });
    } catch (error) {
        next(error);
    }
}

// Create room
export const createRoom = async (req, res, next) => {
    try {
        const roomData = req.validatedData;
        const result = await createRoomService(req.targetHotel, roomData);
        res.status(201).json({
            success: true,
            message: "Room created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Update room
export const updateRoom = async (req, res, next) => {
    try {
        const roomData = req.validatedData;

        const result = await updateRoomService(req.targetRoom, roomData);
        res.status(200).json({
            success: true,
            message: "Room updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Delete room
export const deleteRoom = async (req, res, next) => {
    try {
        const deletedRoom = await deleteRoomService(req.targetRoom);
        res.status(200).json({
            success: true,
            message: "Room deleted successfully",
            data: deletedRoom
        });
    } catch (error) {
        next(error);
    }
}

export const getOwnerBookings = async (req, res, next) => {
    try {
        const result = await getOwnerBookingsService(req.user.id, req.validatedData)
        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getBookingDetailsForOwner = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Booking details fetched successfully",
            data: req.targetBooking
        });
    } catch (error) {
        next(error);
    }
}