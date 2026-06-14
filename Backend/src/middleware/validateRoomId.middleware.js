import { Types } from "mongoose";
import Room from "../modules/rooms/room.model.js";
import { ApiError } from "../utils/apiError.js";

export const validateRoomId = async (req, res, next) => {
    try {
        if (!req.targetHotel) {
            throw new ApiError(500, "Hotel resource not loaded");
        }
        
        const { roomId } = req.params;

        if (!Types.ObjectId.isValid(roomId)) {
            throw new ApiError(400, "Invalid Room ID");
        }

        const room = await Room.findOne({
            _id: roomId,
            hotelId: req.targetHotel._id,
            isDeleted: false
        });

        if (!room) {
            throw new ApiError(404, "Room not found");
        }

        req.targetRoom = room;

        next();
    } catch (error) {
        next(error);
    }
};