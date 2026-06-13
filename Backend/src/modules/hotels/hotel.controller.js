import { getAllHotelsService, getHotelByIdService } from "./hotel.service.js";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseAmenities = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return [...new Set(
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  )];
};

export const getAllHotels = async (req, res, next) => {
  try {
    const {
      city,
      country,
      amenities,
      search,
      category,
      page,
      limit,
      sort,
    } = req.query;

    const filters = {
      city: city?.trim(),
      country: country?.trim(),
      search: search?.trim(),
      category: category?.trim().toLowerCase(),
      amenities: parseAmenities(amenities),
    };

    const pagination = {
      page: parsePositiveInt(page, 1),
      limit: parsePositiveInt(limit, 10),
    };

    const result = await getAllHotelsService(filters, pagination, sort?.trim());

    res.status(200).json({
      success: true,
      message: "Hotels fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req, res, next) => {
  try {
    const hotel = await getHotelByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Hotel fetched successfully",
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};