import Hotel from "../hotels/hotel.model.js";
import Room from "../rooms/room.model.js";
import Booking from "../bookings/booking.model.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import { Types } from "mongoose";

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
    const hotel = await Hotel.create(hotelData);
    const plain = hotel.toObject();
    plain.totalRooms = 0; // No rooms yet on creation
    return plain;
}

export const getOwnerHotels = async (userId, filter, skip, limit) => {
    const match = {
        owner: new Types.ObjectId(userId),
        ...filter,
    };

    const [allHotels, totalHotels] = await Promise.all([
        Hotel.aggregate([
            {
                $match: match,
            },

            {
                $sort: {
                    createdAt: -1,
                },
            },

            {
                $skip: skip,
            },

            {
                $limit: limit,
            },

            {
                $lookup: {
                    from: "rooms",
                    let: {
                        hotelId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$hotelId", "$$hotelId"],
                                },
                                isDeleted: false,
                            },
                        },
                    ],
                    as: "rooms",
                },
            },
            {
                $addFields: {
                    totalRooms: {
                        $size: "$rooms",
                    },
                },
            },
            {
                $project: {
                    rooms: 0,
                },
            },
        ]),

        Hotel.countDocuments(match),
    ]);

    return {
        allHotels,
        totalHotels,
    };
};

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