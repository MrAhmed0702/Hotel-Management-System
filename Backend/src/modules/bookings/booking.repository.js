import Booking from "./booking.model.js";
import Room from "../rooms/room.model.js";
import { BOOKING_STATUS } from "../../constants/status.js";
import { TIMEOUTS } from "../../config/timeouts.js";

const GRACE_MS = TIMEOUTS.GRACE_PERIOD_MS;

export const roomExists = async (hotelId, roomType, session) => {
  return await Room.findOne({
    hotelId,
    type: roomType,
    isDeleted: false,
    operationalStatus: "available",
  })
    .select("price capacity")
    .session(session)
    .lean();
};

export const countOverlappingBookings = async (
  hotelId,
  roomType,
  checkIn,
  checkOut,
  now,
  session,
) => {
  const result = await Booking.aggregate([
    {
      $match: {
        hotelId,
        roomType,
        isDeleted: false,
        $or: [
          {
            status: BOOKING_STATUS.CONFIRMED
          },
          {
            status: BOOKING_STATUS.PENDING,
            expiresAt: { $gt: now }
          }
        ],
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      },
    },
    {
      $group: {
        _id: null,
        totalBooked: { $sum: "$quantity" },
      },
    },
  ]).session(session);

  return result.length ? result[0].totalBooked : 0;
};

export const countRoomsByType = async (hotelId, roomType, session) => {
  return Room.countDocuments({
    hotelId,
    type: roomType,
    isDeleted: false,
  }).session(session);
};

export const createBooking = async (data, session) => {
  const [booking] = await Booking.create([data], { session });
  return booking;
};

export const lockBookingForPayment = async (bookingId, userId, session) => {
  const now = new Date();

  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: BOOKING_STATUS.PENDING,
      paymentStatus: { $in: ["none", "initiated"] },
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    { paymentStatus: "initiated" },
    { returnDocument: "after", session },
  );
};

export const updateBooking = async (bookingId, userId, session, paymentId) => {
  // When payment is verified, confirm the booking regardless of expiresAt.
  // The payment was already validated by Razorpay — the booking MUST be confirmed.
  // Also accept "expired" status in case the cron job raced ahead.
  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.EXPIRED] },
      paymentStatus: "initiated",
    },
    {
      status: BOOKING_STATUS.CONFIRMED,
      paymentStatus: "paid",
      paymentId,
    },
    { returnDocument: "after", session },
  );
};

export const resetBookingAfterFailedPayment = async (bookingId, userId, session) => {
  const now = new Date();

  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: BOOKING_STATUS.PENDING,
      paymentStatus: "initiated",
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    {
      paymentStatus: "none",
    },
    { returnDocument: "after", session },
  );
};

export const checkActiveBooking = async (userId) => {
  return Booking.exists({
    userId,
    status: BOOKING_STATUS.CONFIRMED
  });
};

export const getBookingsByAdmin = async (query, skip, limit) => {

  const [bookings, totalBookings] = await Promise.all([

    Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("hotelId", "hotelName owner")
      .lean(),

    Booking.countDocuments(query)
  ]);

  return {
    bookings: bookings.map(b => ({ ...b, id: b._id.toString() })),
    totalBookings
  };
};

export const resetPaymentStatus = async (bookingId) => {
  await Booking.updateOne(
    {
      _id: bookingId,
      status: BOOKING_STATUS.PENDING,
    },
    {
      paymentStatus: "none",
    }
  );
};

export const getBookingById = async (userId, bookingId, session) => {
  return Booking.findOne({
    _id: bookingId,
    userId,
    isDeleted: false
  }).session(session).lean();
}