import Hotel from "./hotel.model.js";

export const findHotelById = (id) => Hotel.findById(id);

export const findHotelByNameAndCity = (hotelName, city) => {
  return Hotel.findOne({
    hotelName,
    "address.city": city,
    isDeleted: false,
  });
};

export const createHotel = (hotelData) => {
  return Hotel.create(hotelData);
};

export const findHotels = (query, projection, skip, limit, sortOptions) => {
  let queryBuilder = Hotel.find(query)
    .skip(skip)
    .limit(limit)
    .sort(sortOptions);

  if (Object.keys(projection).length > 0) {
    queryBuilder = queryBuilder.select(projection);
  }

  return queryBuilder.lean();
};

export const countHotels = (query) => {
  return Hotel.countDocuments(query);
};

export const updateHotel = (hotel) => {
  return hotel.save();
};
