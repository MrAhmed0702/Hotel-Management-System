import { getAllHotelsService} from "./hotel.service.js";
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
    } = req.validatedData;

    const filters = {
      city,
      country,
      search,
      category,
      amenities,
    };

    const pagination = {
      page,
      limit,
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
    res.status(200).json({
      success: true,
      message: "Hotel fetched successfully",
      data: req.targetHotel,
    });
  } catch (error) {
    next(error);
  }
};