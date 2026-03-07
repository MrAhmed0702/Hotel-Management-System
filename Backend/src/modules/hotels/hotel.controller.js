import { createHotel as createHotelService } from "./hotel.service.js";

export const createHotel = async (req, res) => {
    const hotel = await createHotelService(req.user.id, req.body);

    res.status(201).json({
        success: true,
        message: "Hotel is created successfully",
        data: hotel,
    })
}