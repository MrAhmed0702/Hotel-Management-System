import { getRoomService } from "./room.service.js";

export const getRooms = async (req, res) => {
  const {minPrice, maxPrice, capacity, type, operationalStatus, page, limit} = req.validatedData;

  const filters = {
    minPrice,
    maxPrice,
    capacity,
    type,
    operationalStatus,
  };

  const rooms = await getRoomService(filters, req.targetHotel, page, limit);

  res.status(200).json({
    success: true,
    message: "Room fetched Successfully",
    data: rooms,
  });
};

export const getRoomById = async (req, res) => {

  res.status(200).json({
    success: true,
    message: "Room fetched Successfully",
    data: req.targetRoom,
  });
};
