import { createBookingService } from "./booking.service.js";

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