import * as BookingRepo from "./booking.repository.js";
import { calculateNightsUTC } from "../../utils/nightsStayCalculationLogic.js";
import mongoose, { Types } from "mongoose";
import { ApiError } from "../../utils/apiError.js";

export const createBookingService = async (userId, hotelId, data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, "Invalid hotelId");
    }

    const hotelObjectId = new Types.ObjectId(hotelId);
    const now = new Date();

    const hotel = await BookingRepo.hotelExists(hotelObjectId, session);
    if (!hotel) throw new ApiError(404, "Hotel not found");

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
        status: "pending",
        paymentStatus: "none",
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
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

export const getMyBookingsService = async (userId, page, limit) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  return BookingRepo.getBookings(new Types.ObjectId(userId), page, limit);
};

export const getBookingByIdService = async (userId, bookingId) => {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid IDs");
  }

  const booking = await BookingRepo.getBookingById(
    new Types.ObjectId(userId),
    new Types.ObjectId(bookingId)
  );

  if (!booking) throw new ApiError(404, "Booking not found");

  return booking;
};

export const cancelBookingService = async (userId, bookingId) => {
  const booking = await BookingRepo.cancelBooking(
    new Types.ObjectId(bookingId),
    new Types.ObjectId(userId)
  );

  if (!booking) {
    throw new ApiError(400, "Cannot cancel booking");
  }

  return booking;
};