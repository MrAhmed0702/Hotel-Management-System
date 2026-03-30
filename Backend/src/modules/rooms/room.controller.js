import {
  createRoomService,
  getRoomService,
  getRoomByIdService,
  updateRoomService,
  deleteRoomService,
} from "./room.service.js";

export const createRoom = async (req, res) => {
  const room = await createRoomService(req.params.hotelId, req.validatedData || req.body);

  res.status(201).json({
    success: true,
    message: "Room Created Successfully",
    data: room,
  });
};

export const getRooms = async (req, res) => {
  const { price, capacity, type, status } = req.query;
  const { hotelId } = req.params;

  const filters = {
    price,
    capacity,
    type,
    status,
  };

  const rooms = await getRoomService(filters, hotelId);

  res.status(200).json({
    success: true,
    message: "Room fetched Successfully",
    data: rooms,
  });
};

export const getRoomById = async (req, res) => {
  const { roomId, hotelId } = req.params;

  const room = await getRoomByIdService(roomId, hotelId);

  res.status(200).json({
    success: true,
    message: "Room fetched Successfully",
    data: room,
  });
};

export const updateRoom = async (req, res) => {
  const { roomId, hotelId } = req.params;
  const room = await updateRoomService(roomId, hotelId, req.validatedData || req.body);

  res.status(200).json({
    success: true,
    message: "Room updated Successfully",
    data: room,
  });
};

export const deleteRoom = async (req, res) => {
  const { roomId, hotelId } = req.params;
  const room = await deleteRoomService(roomId, hotelId);

  res.status(200).json({
    success: true,
    message: "Room Record Deleted Successfully",
    data: room,
  });
};
