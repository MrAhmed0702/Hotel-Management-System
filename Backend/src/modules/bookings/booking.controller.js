import {
  createBookingService,
  getMyBookingsService,
  getBookingByIdService,
  cancelBookingService,
} from "./booking.service.js";

export const createBooking = async (req, res) => {
  const { id } = req.user;
  const { hotelId } = req.params;

  const booking = await createBookingService(id, hotelId, req.validatedData || req.body);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
};

export const getMyBookings = async (req, res) => {
  const { id } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const result = await getMyBookingsService(
    id,
    Number(page),
    Number(limit)
  );

  res.status(200).json({
    success: true,
    message: "Bookings fetched",
    ...result,
  });
};

export const getBookingById = async (req, res) => {
  const { id } = req.user;
  const { bookingId } = req.params;

  const booking = await getBookingByIdService(id, bookingId);

  res.status(200).json({
    success: true,
    data: booking,
  });
};

export const cancelBooking = async (req, res) => {
  const { id } = req.user;
  const { bookingId } = req.params;

  const booking = await cancelBookingService(id, bookingId);

  res.status(200).json({
    success: true,
    message: "Booking cancelled",
    data: booking,
  });
};