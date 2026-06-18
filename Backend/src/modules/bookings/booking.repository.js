import Booking from "./booking.model.js";
import Room from "../rooms/room.model.js";

const GRACE_MS = 2 * 60 * 1000;

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
            status: "confirmed"
          },
          {
            status: "pending",
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
      status: "pending",
      paymentStatus: "none",
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    { paymentStatus: "initiated" },
    { new: true, session },
  ).lean();
};

export const updateBooking = async (bookingId, userId, session, paymentId) => {
  const now = new Date();

  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: "initiated",
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    {
      status: "confirmed",
      paymentStatus: "paid",
      paymentId,
    },
    { new: true, session },
  ).lean();
};

export const resetBookingAfterFailedPayment = async (bookingId, userId, session) => {
  const now = new Date();

  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: "initiated",
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    {
      paymentStatus: "none",
    },
    { new: true, session },
  ).lean();
};

export const checkActiveBooking = async (userId) => {
  return Booking.exists({
    userId,
    status: "confirmed"
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
    bookings,
    totalBookings
  };
};

export const resetPaymentStatus = async (bookingId) => {
  await Booking.updateOne(
    {
      _id: bookingId,
      status: "pending",
    },
    {
      paymentStatus: "none",
    }
  );
};