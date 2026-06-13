import mongoose from "mongoose";
import * as hotelRepo from "./hotel.repository.js";
import { ApiError } from "../../utils/apiError.js";

const MAX_LIMIT = 100;

const CATEGORY_SEARCH_TERMS = {
  luxury: [ "luxury", "premium", "high-end", "5-star"],
  budget: ["budget", "cheap", "affordable"],
  business: ["business", "corporate", "conference"],
  family: [ "family", "kids", "spacious"],
};

const SORT_OPTIONS = {
  rating: { averageRating: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

const DEFAULT_PROJECTION = {
  hotelName: 1,
  description: 1,
  address: 1,
  averageRating: 1,
  amenities: 1,
  images: 1,
  category: 1,
};

const HOTEL_DETAILS_PROJECTION =
  "hotelName description address images amenities averageRating category";

const buildHotelQuery = (filters) => {
  const { city, country, amenities, search, category } = filters;

  const query = {status: "active",};

  // Location filters
  if (city) {
    query["address.city"] = city.toLowerCase();
  }

  if (country) {
    query["address.country"] = country.toLowerCase();
  }

  // Amenities filter
  if (amenities?.length) {
    query.amenities = {
      $all: amenities.map((item) =>
        item.toLowerCase()
      ),
    };
  }

  // Exact category filter
  if (category) {
    query.category = category;
  }

  // Text search
  const textParts = [];

  if (search?.trim()) {
    textParts.push(search.trim());

    // Semantic expansion only when user performs search
    if (category && CATEGORY_SEARCH_TERMS[category]) {
      textParts.push(...CATEGORY_SEARCH_TERMS[category]);
    }
  }

  if (textParts.length > 0) {
    query.$text = { $search: textParts.join(" ") };
  }

  return query;
};

const buildProjection = (hasTextSearch) => {
  const projection = { ...DEFAULT_PROJECTION };

  if (hasTextSearch) {
    projection.score = { $meta: "textScore" };
  }

  return projection;
};

const buildSortOptions = (sort, hasTextSearch) => {
  if (hasTextSearch) {
    return {
      score: {
        $meta: "textScore",
      },
    };
  }

  return SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
};

export const getAllHotelsService = async ( filters, pagination, sort) => {
  let { page = 1, limit = 10 } = pagination;

  page = Math.max(1, page);
  limit = Math.min(MAX_LIMIT, Math.max(1, limit));

  if ( sort && !Object.hasOwn(SORT_OPTIONS, sort)) {
    throw new ApiError(
      400,
      `Invalid sort option. Allowed values: ${Object.keys(SORT_OPTIONS).join(", ")}`
    );
  }

  const query = buildHotelQuery(filters);

  const hasTextSearch = Boolean(query.$text);

  const projection = buildProjection(hasTextSearch);

  const sortOptions = buildSortOptions(sort, hasTextSearch);

  const skip = (page - 1) * limit;

  const [hotels, total] =
    await Promise.all([
      hotelRepo.findHotels(
        query,
        projection,
        skip,
        limit,
        sortOptions
      ),

      hotelRepo.countHotels(query),
    ]);

  return {
    data: hotels,

    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};

export const getHotelByIdService = async ( id ) => {
  if ( !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await hotelRepo.findHotelById(id)
    .select(HOTEL_DETAILS_PROJECTION)
    .lean();

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  return hotel;
};