import { getUserById, updateUserById, softDeleteUser as softDeleteUserService, getMyBookingsService, cancelBookingService } from "./user.service.js";
import fs from "fs";
import logger from "../../utils/logger.js";

export const getUserDetails = async (req, res) => {
    const user = await getUserById(req.user.id);

    res.status(200).json({
        success: true,
        message: "User Details Fetched Successfully",
        data: user
    });
}

export const updateUserDetails = async (req, res, next) => {
    try {
        const updateData = { ...req.validatedData };

        if (req.file?.filename) {
            const baseURL = `${req.protocol}://${req.get("host")}`;
            updateData.profilePicture = `${baseURL}/uploads/profiles/${req.file.filename}`;
            updateData.profilePictureType = "uploaded"; 
        }

        const updatedUser = await updateUserById(req.user.id, updateData);

        res.status(200).json({
            success: true,
            message: "User Details Updated Successfully",
            data: updatedUser
        });
    } catch (error) {
        if (req.file?.path) {
            await fs.promises.unlink(req.file.path).catch(err => logger.error("Failed to delete uploaded file:", { error: err.message }));
        }
        next(error);
    }
}

export const softDeleteUser = async (req, res, next) => {
    try {
        const deletedUser = await softDeleteUserService(req.user.id);

        res.status(200).json({
            success: true,
            message: "User Record Is Deleted Successfully",
            data: deletedUser
        });
    } catch (error) {
        next(error);
    }
};

export const getMyBookings = async (req, res, next) => {
    try {
        const result = await getMyBookingsService(req.user.id, req.validatedData);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getBookingById = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: req.targetBooking
        });
    } catch (error) {
        next(error)
    }
}

export const cancelBooking = async (req, res, next) => {
    try {
        const { reason } = req.validatedData;
        const cancelledBooking = await cancelBookingService(req.targetBooking, reason);

        res.status(200).json({
            success: true,
            message: "Booking Cancelled Successfully",
            data: cancelledBooking
        });
    } catch (error) {
        next(error)
    }
}