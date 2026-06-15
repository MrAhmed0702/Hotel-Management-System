import Hotel from "../hotels/hotel.model.js";
import Room from "../rooms/room.model.js";
import Booking from "../bookings/booking.model.js";
import { escapeRegex } from "../../utils/escapeRegex.js";

export const findOwnerHotelByNameAndCity = async (hotelName, city) => {
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

export const createRoom = async (data) => {
    return await Room.create(data);
}

export const getBookings = async (ownerId, query, skip, limit) => {
    const hotelIds = await Hotel.distinct("_id", { owner: ownerId, isDeleted: false });
    
    const [allBookings, totalBookings] = await Promise.all([
        Booking.find({ ...query, hotelId: { $in: hotelIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "firstName lastName email")
            .populate("hotelId", "hotelName status")
            .lean(),

        Booking.countDocuments({ ...query, hotelId: { $in: hotelIds } })
    ]);
    
    return {
        allBookings,
        totalBookings
    };
};