import mongoose from "mongoose";
import * as roomRepo from "./room.repository.js";
import { ApiError } from "../../utils/apiError.js"

export const createRoomService = async (hotelId, roomData) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await roomRepo.existsHotelById(hotelId);

  if (!hotel) throw new ApiError(404, "Hotel not found");;

  try {
    const room = await roomRepo.createRoom({
      ...roomData,
      hotelId,
    });

    return room;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(400, "Room number already exists for this hotel");
    }
    throw err;
  }
};

export const getRoomService = async (filtered, hotelId) => {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError(400, "Invalid hotel ID");
    }

    const hotel = await roomRepo.existsHotelById(hotelId);

    if (!hotel) throw new ApiError(404, "Hotel not found");;

    const { price, capacity, type, status } = filtered;

    const query = { hotelId };

    if (price) query.price = Number(price);
    if (capacity) query.capacity = Number(capacity);
    if (type) query.type = type;
    if (status) query.status = status;

    const rooms = await roomRepo.findRooms(query);

    return rooms;
}

export const getRoomByIdService = async (roomId, hotelId) => {
  if(!mongoose.Types.ObjectId.isValid(hotelId) || !mongoose.Types.ObjectId.isValid(roomId)){
    throw new ApiError(400, "Invalid ID");
  }

  const hotel = await roomRepo.existsHotelById(hotelId);

  if(!hotel) throw new ApiError(404, "Hotel not found");;

  const room = await roomRepo.findRoomById(roomId, hotelId);

  if(!room) throw new ApiError(404, "Room not found");

  return room;
}

export const updateRoomService = async (roomId, hotelId, roomUpdatedData) => {
  if(!mongoose.Types.ObjectId.isValid(hotelId) || !mongoose.Types.ObjectId.isValid(roomId)){
    throw new ApiError(400, "Invalid ID");
  }

  const hotel = await roomRepo.existsHotelById(hotelId);

  if(!hotel) throw new ApiError(404, "Hotel not found");

  const room = await roomRepo.findRoomById(roomId, hotelId);

  if(!room) throw new ApiError(404, "Room not found");

  const allowedUpdates = ["type", "price", "capacity", "description", "amenities", "status"];

  const filteredData = Object.fromEntries(
    Object.entries(roomUpdatedData).filter(([key]) => allowedUpdates.includes(key))
  )

  if(Object.keys(filteredData).length === 0){
    throw new ApiError(400, `No valid fields provided for update`);
  }

  Object.assign(room, filteredData);

  await roomRepo.updateRoom(room);

  return room;
}

export const deleteRoomService = async (roomId, hotelId) => {
  if(!mongoose.Types.ObjectId.isValid(hotelId) || !mongoose.Types.ObjectId.isValid(roomId)){
    throw new ApiError(400, "Invalid ID");
  }

  const hotel = await roomRepo.existsHotelById(hotelId);

  if(!hotel) throw new ApiError(404, "Hotel not found");

  const room = await roomRepo.findRoomById(roomId, hotelId);

  if(!room) throw new ApiError(404, "Room not found");

  await roomRepo.deleteRoom(room);

  return room;
}