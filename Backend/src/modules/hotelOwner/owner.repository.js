import Hotel from "../hotels/hotel.model.js";

export const findOwnerHotelByNameAndCity = async (
    hotelName,
    city
) => {

    const escapeRegex = (value) =>
        value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    return Hotel.exists({
        hotelName: {
            $regex: `^${escapeRegex(hotelName)}$`,
            $options: "i"
        },

        "address.city": {
            $regex: `^${escapeRegex(city)}$`,
            $options: "i"
        }
    });
};

export const createHotel = async (hotelData) => {
    return await Hotel.create(hotelData);
}

export const getOwnerHotels = async (userId, filter, skip, limit) => {
    const [allHotels, totalHotels] = await Promise.all([
        Hotel.find({ ...filter, owner: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

        Hotel.countDocuments({ ...filter, owner: userId })
    ])

    return {
        allHotels,
        totalHotels
    }
}

export const findOwnerHotelById = async (userId, hotelId) => {
    return Hotel.findOne({
        _id: hotelId,
        owner: userId
    });
}

export const deleteHotel = async (hotelId) => {
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
        return null;
    }

    hotel.isDeleted = true;
    hotel.deletedAt = new Date();
    hotel.status = "inactive";

    await hotel.save();

    return hotel;
}