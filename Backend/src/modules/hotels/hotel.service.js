import mongoose from "mongoose";
import * as hotelRepo from "./hotel.repository.js";
import { ApiError } from "../../utils/apiError.js";

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
  const { city, country, amenities, search, category } = filters;
  const { page, limit } = pagination;

  const query = { status: "active" };

  // ✅ BASIC FILTERS (AND)
  if (city) query["address.city"] = city.toLowerCase();
  if (country) query["address.country"] = country.toLowerCase();

  if (amenities?.length) {
    query.amenities = {
      $all: amenities.map((a) => a.toLowerCase()),
    };
  }

  // 🧠 CATEGORY INTELLIGENCE MAP
  const categoryMap = {
    luxury: {
      keywords: ["luxury", "premium", "5-star", "high-end"],
      minRating: 4.5,
    },
    budget: {
      keywords: ["budget", "cheap", "affordable"],
      maxRating: 3.5,
    },
    business: {
      keywords: ["business", "corporate", "conference"],
    },
    family: {
      keywords: ["family", "kids", "spacious"],
    },
  };

  // ================================
  // ✅ STEP 1: TEXT SEARCH (TOP LEVEL ONLY 🚨)
  // ================================
  let textParts = [];

  if (search) textParts.push(search);

  if (category && categoryMap[category]?.keywords) {
    textParts.push(...categoryMap[category].keywords);
  }

  if (textParts.length) {
    query.$text = { $search: textParts.join(" ") };
  }

  // ================================
  // ✅ STEP 2: CATEGORY SMART LOGIC (NO $text here 🚨)
  // ================================
  const orConditions = [];

  if (category) {
    // exact match
    orConditions.push({ category });
  }

  if (category && categoryMap[category]) {
    const config = categoryMap[category];

    if (config.minRating) {
      orConditions.push({
        averageRating: { $gte: config.minRating },
      });
    }

    if (config.maxRating) {
      orConditions.push({
        averageRating: { $lte: config.maxRating },
      });
    }
  }

  if (orConditions.length) {
    query.$or = orConditions;
  }

  // ================================
  // 📄 PAGINATION
  // ================================
  const skip = (page - 1) * limit;

  // ================================
  // 📊 SORTING
  // ================================
  const allowedSortFields = {
    rating: { averageRating: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };

  let sortOptions = allowedSortFields[sort] || { averageRating: -1 };

  // 🔥 if text search → sort by relevance
  if (query.$text) {
    sortOptions = { score: { $meta: "textScore" } };
  }

  // ================================
  // 📦 PROJECTION
  // ================================
  const projection = query.$text
    ? {
        score: { $meta: "textScore" },
        hotelName: 1,
        description: 1,
        address: 1,
        averageRating: 1,
        amenities: 1,
        images: 1,
      }
    : {};

  // ================================
  // 🚀 DB CALL
  // ================================
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
    throw new ApiError(404, "Hotel not found");
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
