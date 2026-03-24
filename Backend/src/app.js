import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import hotelRoutes from "./modules/hotels/hotel.routes.js";
import roomRoutes from "./modules/rooms/room.routes.js";
import hotelBookingRoutes from "./modules/bookings/hotelBooking.routes.js";
import bookingRoutes from "./modules/bookings/booking.routes.js";
import createPaymentRoutes from "./modules/payments/createPayment.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

app.use(express.json());

app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API is running"
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/hotels", hotelRoutes);
app.use("/hotels/:hotelId/rooms", roomRoutes);
app.use("/hotels/:hotelId/bookings", hotelBookingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/bookings/:bookingId/payments", createPaymentRoutes);
app.use("/payments", paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;