import Hotel from "./hotel.model.js";

export const createHotelService = async (id, hotelData) => {
    const { hotelName, address } = hotelData;
    
    const hotelExists = await Hotel.findOne({
        hotelName,
        "address.city": address.city,
        isDeleted: false
     });

    if(hotelExists){
        throw new Error("Hotel Already Exists");
    }
    
    const hotel = await Hotel.create({
        ...hotelData,
        createdBy: id
    });

    return hotel;
}

export const getAllHotelsService = async (filters, pagination, sort) => {
    const { city, country, amenities, search } = filters;
    const { page, limit } = pagination;

    const query = { status: "active", };

    if(city) query["address.city"] = city.toLowerCase();
    if(country) query["address.country"] = country.toLowerCase();
    if(amenities?.length) query.amenities = { $all: amenities };

    if(search){
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
    ? { score: { $meta: "textScore" }, hotelName: 1, description: 1, address: 1, averageRating: 1, amenities: 1 }
    : {};

    const [hotels, total] = await Promise.all([
        Hotel.find(query)
            .select(projection)
            .skip(skip)
            .limit(limit)
            .sort(sortOptions)
            .lean(),

        Hotel.countDocuments(query)
    ])

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: hotels
    };
}