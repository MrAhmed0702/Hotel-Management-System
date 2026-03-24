import * as BookingRepo from "./booking.repository.js";
import { calculateNightsUTC } from "../../utils/date.utils.js";
import mongoose, { Types } from "mongoose";
import { ApiError } from "../../utils/apiError.js";

export const createBookingService = async (userId, hotelId, bookingData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Validate + Convert ObjectId
    if (!Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, "Invalid Hotel ID");
    }

    const hotelObjectId = new Types.ObjectId(hotelId);

    // 2️⃣ Single time reference
    const now = new Date();

    // 3️⃣ Check hotel exists
    const hotel = await BookingRepo.hotelExists(hotelObjectId, session);
    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // 4️⃣ Check room exists
    const room = await BookingRepo.roomExists(
      hotelObjectId,
      bookingData.roomType,
      session,
    );

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    // 5️⃣ Calculate nights
    const nights = calculateNightsUTC(
      bookingData.checkIn,
      bookingData.checkOut,
    );

    const roomPrice = room.price;

    // 6️⃣ Count overlapping bookings
    const bookedRooms = await BookingRepo.countOverlappingBookings(
      hotelObjectId,
      bookingData.roomType,
      bookingData.checkIn,
      bookingData.checkOut,
      now,
      session,
    );

    // 7️⃣ Count total rooms
    const totalRooms = await BookingRepo.countRoomsByType(
      hotelObjectId,
      bookingData.roomType,
      session,
    );

    // 8️⃣ Validate availability
    if (bookedRooms + bookingData.quantity > totalRooms) {
      throw new ApiError(409, "Not enough rooms available");
    }

    // 9️⃣ Validate guest capacity
    const maxGuests = room.capacity * bookingData.quantity;

    if (bookingData.numberOfGuests > maxGuests) {
      throw new ApiError(
        400,
        `Maximum number of guests allowed is ${maxGuests}`,
      );
    }

    // 🔟 Calculate total price
    const totalPrice = roomPrice * nights * bookingData.quantity;

    // 11️⃣ Create booking
    const booking = await BookingRepo.createBooking(
      {
        hotelId: hotelObjectId,
        userId,
        roomType: bookingData.roomType,
        quantity: bookingData.quantity,
        totalPrice,
        pricePerNight: roomPrice,
        numberOfGuests: bookingData.numberOfGuests,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        status: "pending",
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      },
      session,
    );

    await session.commitTransaction();

    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getMyBookingsService = async (userId, page, limit) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const userObjectId = new Types.ObjectId(userId);

  const bookings = await BookingRepo.getBookings(userObjectId, page, limit);

  return bookings;
};

export const getBookingByIdService = async (userId, bookingId) => {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid ID");
  }

  const bookingObjectId = new Types.ObjectId(bookingId);
  const userObjectId = new Types.ObjectId(userId);

  const booking = await BookingRepo.getBookingById(
    userObjectId,
    bookingObjectId,
  );

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return booking;
};

export const cancelBookingService = async (userId, bookingId) => {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid ID");
  }

  const bookingObjectId = new Types.ObjectId(bookingId);
  const userObjectId = new Types.ObjectId(userId);

  const cancelledBooking = await BookingRepo.cancelBooking(
    bookingObjectId,
    userObjectId
  );

  if (!cancelledBooking) {
    throw new ApiError(404, "Booking not found or cannot be cancelled");
  }

  return cancelledBooking;
};
