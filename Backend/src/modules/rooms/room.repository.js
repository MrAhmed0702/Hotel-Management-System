import Room from "./room.model.js";
import Hotel from "../hotels/hotel.model.js";

export const findHotelById = async (id) => {
    return Hotel.findById(id);
}

export const createRoom = async (data) => {
    return Room.create(data);
}

export const existsHotelById = async (id) => {
    const exists = await Hotel.exists({
        _id: id,
        isDeleted: false
    });
    
    return !!exists;
}

export const findRooms = async (query) => {
    return Room.find(query).lean();
}