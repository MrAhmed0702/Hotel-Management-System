import { ApiError } from "../utils/apiError.js";

export const validateBookingOwnership = async (req, res, next) => {
  try {
    const booking = req.targetBooking;

    if (!booking.hotelId || booking.userId._id.toString() !== req.user.id) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();

  } catch (error) {
    next(error);
  }
};