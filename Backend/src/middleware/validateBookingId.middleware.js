import Booking from "../modules/bookings/booking.model.js"
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";

export const validateBookingId = async (
  req,
  res,
  next
) => {
  try {
    const { bookingId } = req.params;

    if (!Types.ObjectId.isValid(bookingId)) {
      throw new ApiError(
        400,
        "Invalid Booking ID"
      );
    }

    const booking =
      await Booking.findOne({ _id: bookingId, isDeleted: false })
        .populate("hotelId", "owner hotelName address images")
        .populate("userId", "firstName lastName email");

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found"
      );
    }

    req.targetBooking = booking;

    next();
  } catch (error) {
    next(error);
  }
};