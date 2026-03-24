import { createBookingService, getMyBookingsService, getBookingByIdService, cancelBookingService } from "./booking.service.js";

export const createBooking = async (req, res) => {
    const { id } = req.user;
    const { hotelId } = req.params; 

    const booking = await createBookingService(id, hotelId, req.body);

    res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking
    });    
}

export const getMyBookings = async (req, res) => {
  const { id } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const myBookings = await getMyBookingsService(
    id,
    Number(page),
    Number(limit)
  );

  res.status(200).json({
    success: true,
    message: "My bookings fetched successfully",
    ...myBookings
  });
};

export const getBookingById = async (req, res) => {
    const { id } = req.user;
    const { bookingId } = req.params; 

    const booking = await getBookingByIdService(id, bookingId);

    res.status(200).json({
        success: true,
        message: `Booking fetched successfully`,
        data: booking
    }); 
}

export const cancelBooking = async (req, res) => {
    const { id } = req.user;
    const { bookingId } = req.params;

    const cancelledBooking = await cancelBookingService(id, bookingId);

    res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: cancelledBooking
    }); 
}