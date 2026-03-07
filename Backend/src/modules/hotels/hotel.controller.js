import { createHotelService, getAllHotelsService } from "./hotel.service.js";

export const createHotel = async (req, res) => {
    const hotel = await createHotelService(req.user.id, req.body);

    res.status(201).json({
        success: true,
        message: "Hotel is created successfully",
        data: hotel,
    })
}

export const getAllHotels = async (req, res) => {
  const { city, country, amenities, search, page = 1, limit = 10, sort } = req.query;

  const filters = {
    city,
    country,
    search,
    amenities: amenities ? amenities.split(",") : []
  };

  const pagination = {
    page: Number(page),
    limit: Number(limit)
  };

  const result = await getAllHotelsService(filters, pagination, sort);

  res.status(200).json({
    success: true,
    message: "Hotels fetched successfully",
    ...result
  });
};