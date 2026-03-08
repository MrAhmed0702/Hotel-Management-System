import { Schema, model, Types } from "mongoose";

const roomSchema = new Schema({
    hotelId: {
        type: Types.ObjectId,
        ref: "Hotel",
        required: true,
        index: true
    },

    roomNumber: {
        type: Number,
        min: [1, "Room Number must be greater than 0"],
        required: true
    },

    type: {
        type: String,
        enum: ["single", "double", "suite", "deluxe", "family"],
        required: true
    },

    description: {
         type: String,
         minlength: 20,
         maxlength: 450,
         trim: true,
         default: ""
    },

    price: {
        type: Number,
        min: [1, "Price must be greater than 0"],
        required: true
    },

    capacity: {
        type: Number,
        min: [1, "Capacity must be greater than 0"],
        required: true
    },

    amenities: {
        type: [String],
        default: []
    },

    status: {
        type: String,
        enum: ["available", "maintenance", "inactive"],
        default: "available"
    }

}, { timestamps: true });

roomSchema.index(
    { hotelId: 1, roomNumber: 1 },
    { unique: true }
);

export default model("Room", roomSchema);