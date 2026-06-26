import * as BookingRepo from "./booking.repository.js";
import { calculateNightsUTC } from "../../utils/nightsStayCalculationLogic.js";
import mongoose, { Types } from "mongoose";
import { ApiError } from "../../utils/apiError.js";
import { BOOKING_STATUS } from "../../constants/status.js";
import { TIMEOUTS } from "../../config/timeouts.js";

export const createBookingService = async (userId, hotel, data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const hotelObjectId = hotel._id;

    const now = new Date();

    const room = await BookingRepo.roomExists(
      hotelObjectId,
      data.roomType,
      session
    );

    if (!room) throw new ApiError(404, "Room not found");

    const nights = calculateNightsUTC(data.checkIn, data.checkOut);

    const bookedRooms = await BookingRepo.countOverlappingBookings(
      hotelObjectId,
      data.roomType,
      data.checkIn,
      data.checkOut,
      now,
      session
    );

    const totalRooms = await BookingRepo.countRoomsByType(
      hotelObjectId,
      data.roomType,
      session
    );

    if (bookedRooms + data.quantity > totalRooms) {
      throw new ApiError(409, "Not enough rooms available");
    }

    const maxGuests = room.capacity * data.quantity;

    if (data.numberOfGuests > maxGuests) {
      throw new ApiError(400, `Max guests allowed is ${maxGuests}`);
    }

    const totalPrice = room.price * nights * data.quantity;

    const booking = await BookingRepo.createBooking(
      {
        hotelId: hotelObjectId,
        userId,
        roomType: data.roomType,
        quantity: data.quantity,
        totalPrice,
        pricePerNight: room.price,
        numberOfGuests: data.numberOfGuests,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: BOOKING_STATUS.PENDING,
        paymentStatus: "none",
        expiresAt: new Date(now.getTime() + TIMEOUTS.BOOKING_HOLD_TIMEOUT_MS),
      },
      session
    );

    await session.commitTransaction();
    return booking;

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};