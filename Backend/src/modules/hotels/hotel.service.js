import mongoose from "mongoose";
import * as hotelRepo from "./hotel.repository.js";
import { ApiError } from "../../utils/apiError.js"

export const createHotelService = async (id, hotelData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const { hotelName, address } = hotelData;

  const hotelExists = await hotelRepo.findHotelByNameAndCity(
    hotelName,
    address.city,
  );

  if (hotelExists) {
    throw new ApiError(400, "Hotel Already Exists");
  }

  const hotel = await hotelRepo.createHotel({
    ...hotelData,
    createdBy: id,
  });

  return hotel;
};

export const getAllHotelsService = async (filters, pagination, sort) => {
  const { city, country, amenities, search } = filters;
  const { page, limit } = pagination;

  const query = { status: "active" };

  if (city) query["address.city"] = city.toLowerCase();
  if (country) query["address.country"] = country.toLowerCase();
  if (amenities?.length) query.amenities = { $all: amenities };

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const allowedSortFields = {
    rating: { averageRating: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };

  let sortOptions = allowedSortFields[sort] || { averageRating: -1 };

  if (search) {
    sortOptions = { score: { $meta: "textScore" } };
  }

  const projection = search
    ? {
        score: { $meta: "textScore" },
        hotelName: 1,
        description: 1,
        address: 1,
        averageRating: 1,
        amenities: 1,
      }
    : {};

  const [hotels, total] = await Promise.all([
    hotelRepo.findHotels(query, projection, skip, limit, sortOptions),
    hotelRepo.countHotels(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: hotels,
  };
};

export const getHotelByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await hotelRepo
    .findHotelById(id)
    .select("hotelName description address images amenities averageRating")
    .lean();

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");;
  }

  return hotel;
};

export const updateHotelService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Hotel ID");
  }

  const hotel = await hotelRepo.findHotelById(id);

  if (!hotel) throw new ApiError(404, "Hotel not found");

  const allowedUpdate = [
    "hotelName",
    "description",
    "address",
    "images",
    "amenities",
    "totalRooms",
    "status",
  ];

  const filteredData = Object.fromEntries(
    Object.entries(updateData).filter(([key]) => allowedUpdate.includes(key)),
  );

  if (Object.keys(filteredData).length === 0)
    throw new ApiError(400, "No valid fields provided for update");

  Object.assign(hotel, filteredData);

  await hotelRepo.updateHotel(hotel);

  return hotel;
};

export const deleteHotelService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Hotel ID");
  }

  const hotel = await hotelRepo.findHotelById(id);

  if (!hotel) throw new ApiError(404, "Hotel not found");

  if (hotel.isDeleted) {
    throw new ApiError(400, "Hotel already deleted");
  }

  hotel.isDeleted = true;
  hotel.deletedAt = new Date();
  hotel.status = "inactive";

  await hotelRepo.updateHotel(hotel);

  return hotel;
};
