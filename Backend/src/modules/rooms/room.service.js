import mongoose from "mongoose";
import * as roomRepo from "./room.repository.js";

export const createRoomService = async (hotelId, roomData) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new Error("Invalid hotel ID");
  }

  const hotel = await roomRepo.existsHotelById(hotelId);

  if (!hotel) throw new Error("Hotel Doesn't Exist");

  try {
    const room = await roomRepo.createRoom({
      ...roomData,
      hotelId,
    });

    return room;
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Room number already exists for this hotel");
    }
    throw err;
  }
};

export const getRoomService = async (filtered, hotelId) => {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new Error("Invalid hotel ID");
    }

    const hotel = await roomRepo.existsHotelById(hotelId);

    if (!hotel) throw new Error("Hotel Doesn't Exist");

    const { price, capacity, type, status } = filtered;

    const query = { hotelId };

    if (price) query.price = Number(price);
    if (capacity) query.capacity = Number(capacity);
    if (type) query.type = type;
    if (status) query.status = status;

    const rooms = await roomRepo.findRooms(query);

    return rooms;
}