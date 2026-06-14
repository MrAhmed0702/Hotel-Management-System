import Room from "./room.model.js";

export const findRooms = async (query, page, limit) => {
    const skip = (page - 1) * limit;

    const [rooms, totalRooms] =
        await Promise.all([
            Room.find(query)
                .skip(skip)
                .limit(limit)
                .lean(),

            Room.countDocuments(query)
        ]);

    return { rooms, totalRooms };
}