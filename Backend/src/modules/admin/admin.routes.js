import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validateUserId } from "../../middleware/validateUserId.middleware.js";
import { validateUserIdIncludingDeleted } from "../../middleware/validateUserIdIncludingDeleted.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateUserSchema, updateRoleSchema, hotelStatusSchema, updateHotelStatusSchema, getUsersSchema, getAdminBookingsSchema } from "./admin.validation.js";
import { validateHotelId } from "../../middleware/validateHotelId.middleware.js";
import { validateBookingId } from "../../middleware/validateBookingId.middleware.js";

import {
  getUserDetails,
  getDeletedUsers,
  getAllUsers,
  updateUser,
  updateRole,
  restoreUser,
  deleteUser,
  getHotelsByStatus,
  getHotelDetails,
  updateHotelStatus,
  getAllBookings,
  getBookingDetails
} from "./admin.controller.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorize("admin"));

router.get("/users", validate(getUsersSchema, "query"), getAllUsers);
router.get("/users/deleted", validate(getUsersSchema, "query"), getDeletedUsers);
router.get("/users/:userId", validateUserIdIncludingDeleted, getUserDetails);

router.patch("/users/:userId", validateUserId, validate(updateUserSchema), updateUser);
router.patch("/users/:userId/role", validateUserId, validate(updateRoleSchema), updateRole);
router.patch("/users/:userId/restore", validateUserIdIncludingDeleted, restoreUser);

router.delete("/users/:userId", validateUserId, deleteUser);

// Hotel Supervision
router.get("/hotels", validate(hotelStatusSchema, "query"), getHotelsByStatus);
router.get("/hotels/:hotelId", validateHotelId, getHotelDetails);

router.patch("/hotels/:hotelId/status", validateHotelId, validate(updateHotelStatusSchema), updateHotelStatus);

// Booking Management
router.get(
  "/bookings",
  validate(getAdminBookingsSchema, "query"),
  getAllBookings
);

router.get(
  "/bookings/:bookingId",
  validateBookingId,
  getBookingDetails
);

export default router;