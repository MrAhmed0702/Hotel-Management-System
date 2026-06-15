import { createBookingService } from "./booking.service.js";

export const createBooking = async (req, res) => {
  const booking = await createBookingService(req.user.id, req.targetHotel, req.validatedData);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
};