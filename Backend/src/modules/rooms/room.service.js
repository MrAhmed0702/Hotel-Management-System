import * as roomRepo from "./room.repository.js";

export const getRoomService = async (filtered, hotel, page, limit) => {
  const { minPrice, maxPrice, capacity, type, operationalStatus } = filtered;

  const query = { hotelId: hotel._id };

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};

    if (minPrice !== undefined) {
      query.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      query.price.$lte = maxPrice;
    }
  }

  if (capacity) {
    query.capacity = capacity;
  }

  if (type) {
    query.type = type;
  }

  if (operationalStatus) {
    query.operationalStatus = operationalStatus;
  }

  const { rooms, totalRooms } = await roomRepo.findRooms(query, page, limit);

  const totalPages = Math.max(1, Math.ceil(totalRooms / limit));

  return {
    rooms,
    page,
    limit,
    totalRooms,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};