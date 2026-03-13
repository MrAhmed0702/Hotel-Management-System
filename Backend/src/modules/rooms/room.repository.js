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

export const findRoomById = async (roomId, hotelId) => {
    return Room.findOne({
        _id: roomId,
        hotelId
    });
}

export const updateRoom = async (room) => {
    return room.save();
};

export const deleteRoom = async (room) => {
    room.isDeleted = true;
    room.deletedAt = new Date();
    return room.save();
}