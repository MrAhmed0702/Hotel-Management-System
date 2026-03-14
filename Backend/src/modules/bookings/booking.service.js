import mongoose, { Types } from "mongoose";
import { calculateNightsUTC } from "../../utils/nightsStayCalculationLogic.js";
import * as BookingRepo from "./booking.repository.js";

export const createBookingService = async (userId, hotelId, bookingData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Validate hotelId
    if (!Types.ObjectId.isValid(hotelId)) {
      throw new Error("Invalid Hotel ID");
    }

    // 2️⃣ Check hotel exists
    const hotel = await BookingRepo.hotelExists(hotelId, session);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    // 3️⃣ Check room type exists
    const room = await BookingRepo.roomExists(hotelId, bookingData.roomType, session);
    if (!room) {
      throw new Error("Room not found");
    }

    // 4️⃣ Calculate nights
    const nights = calculateNightsUTC(
      bookingData.checkIn,
      bookingData.checkOut
    );

    const roomPrice = room.price;

    // 5️⃣ Count overlapping bookings
    const bookedRooms = await BookingRepo.countOverlappingBookings(
      hotelId,
      bookingData.roomType,
      bookingData.checkIn,
      bookingData.checkOut,
      session
    );

    // 6️⃣ Count total rooms
    const totalRooms = await BookingRepo.countRoomsByType(
      hotelId,
      bookingData.roomType,
      session
    );

    // 7️⃣ Validate availability
    if (bookedRooms + bookingData.quantity > totalRooms) {
      throw new Error("Not enough rooms available");
    }

    // 8️⃣ Validate guest capacity
    const maxGuests = room.capacity * bookingData.quantity;

    if (bookingData.numberOfGuests > maxGuests) {
      throw new Error(`Maximum number of guests allowed is ${maxGuests}`);
    }

    // 9️⃣ Calculate total price
    const totalPrice = roomPrice * nights * bookingData.quantity;

    // 🔟 Create booking
    const booking = await BookingRepo.createBooking(
      {
        hotelId,
        userId,
        roomType: bookingData.roomType,
        quantity: bookingData.quantity,
        totalPrice,
        pricePerNight: roomPrice,
        numberOfGuests: bookingData.numberOfGuests,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        status: "pending",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    return booking;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};