import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import hotelRoutes from "./modules/hotels/hotel.routes.js";
import roomRoutes from "./modules/rooms/room.routes.js";
import hotelBookingRoutes from "./modules/bookings/hotelBooking.routes.js";
import bookingRoutes from "./modules/bookings/booking.routes.js";
import createPaymentRoutes from "./modules/payments/createPayment.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import webhookRoutes from "./modules/payments/webhooks/webhook.routes.js";

const app = express();

app.use("/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Performance
app.use(compression());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use("/uploads", express.static("uploads"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API is running",
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
  // 🔍 Logging (structured)
  console.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // 🧠 Known (operational) errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // 🔥 Mongoose duplicate key (VERY IMPORTANT)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // 🔥 Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // 🔥 Cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // ❌ Unknown error (fallback)
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

export default app;
