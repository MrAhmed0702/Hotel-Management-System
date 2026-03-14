import { Schema, model, Types} from "mongoose";

const bookingSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        },

        hotelId: {
            type: Types.ObjectId,
            ref: "Hotel",
            required: true
        },

        roomType: {
            type: String,
            enum: ["single", "double", "suite", "deluxe", "family"],
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        pricePerNight: {
            type: Number,
            required: true,
            min: 0
        },

        numberOfGuests: {
            type: Number,
            required: true,
        },
        
        checkIn: {
            type: Date,
            required: true
        },

        checkOut: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "expired"],
            default: "pending"
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },

    {
        timestamps: true,

        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;

                delete ret._id;
                delete ret.__v;

                return ret;
            }
        }
    }
)

bookingSchema.index({
    hotelId: 1,
    roomType: 1,
    status: 1,
    checkIn: 1,
    checkOut: 1
});

export default model("Booking", bookingSchema);