import * as adminRepo from "./admin.repository.js";
import { ApiError } from "../../utils/apiError.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import * as bookingRepo from "../bookings/booking.repository.js";

export const getAllUsersService = async ({ page, limit, search, sortBy }) => {
    page = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));

    const skip = (page - 1) * limit;

    const query = {}

    if (search) {
        const safeSearch = escapeRegex(search);

        query.$or = [
            { firstName: { $regex: safeSearch, $options: "i" } },
            { lastName: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
            { phoneNumber: { $regex: safeSearch, $options: "i" } },
            { role: { $regex: safeSearch, $options: "i" } }
        ];
    }

    const { users, totalUsers } = await adminRepo.getAllUsers({
        query,
        skip,
        limit,
        sortBy
    })

    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

    return {
        users,
        totalUsers,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        hasData: totalUsers > 0
    }
}

export const getDeletedUsersService = async ({ page, limit, search, sortBy }) => {
    page = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));

    const skip = (page - 1) * limit;

    const query = {}

    if (search) {
        const safeSearch = escapeRegex(search);

        query.$or = [
            { firstName: { $regex: safeSearch, $options: "i" } },
            { lastName: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
            { phoneNumber: { $regex: safeSearch, $options: "i" } },
            { role: { $regex: safeSearch, $options: "i" } }
        ];
    }

    const { users, totalUsers } = await adminRepo.getDeletedUsers({
        query,
        skip,
        limit,
        sortBy
    })

    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

    return {
        users,
        totalUsers,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        hasData: totalUsers > 0
    }
}

export const updateUserService = async (user, updateData) => {
    const allowedFields = ["firstName", "lastName", "email", "phoneNumber", "password", "gender", "dateOfBirth", "isVerified"];

    const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    if ("email" in filteredData && filteredData.email !== user.email) {
        const existingEmail = await adminRepo.checkEmailExists(filteredData.email, user._id);

        if (existingEmail) {
            throw new ApiError(409, "Email already exists");
        }
    }

    if ("phoneNumber" in filteredData && filteredData.phoneNumber !== user.phoneNumber) {
        const existingPhoneNumber = await adminRepo.checkPhoneNumberExists(filteredData.phoneNumber, user._id);

        if (existingPhoneNumber) {
            throw new ApiError(409, "Phone number already exists");
        }
    }

    Object.assign(user, filteredData);

    await user.save();

    return user;
}

export const updateRoleService = async (currentAdmin, targetUser, { role }) => {
    const isSelf = String(currentAdmin.id) === String(targetUser._id);

    const activeAdminCount = await adminRepo.countAdmins();

    if (
        isSelf &&
        targetUser.role === "admin" &&
        role !== "admin" &&
        activeAdminCount === 1
    ) {
        throw new ApiError(400, "Cannot remove the last admin role");
    }

    targetUser.role = role;

    await targetUser.save();

    return targetUser;
}

export const deleteUserService = async (currentAdmin, targetUser) => {
    if (targetUser.isDeleted) {
        throw new ApiError(
            400,
            "User already deleted"
        );
    }
    const activeAdminCount = await adminRepo.countAdmins();

    const isSelf = String(currentAdmin.id) === String(targetUser._id);

    if (isSelf && currentAdmin.role === "admin" && activeAdminCount === 1) {
        throw new ApiError(400, "Cannot delete the last admin account");
    }

    if (targetUser.role === "owner") {
        const hotelsCount = await adminRepo.countHotelsByOwner(targetUser._id);

        if (hotelsCount > 0) {
            throw new ApiError(400, "Cannot delete owner who has hotels");
        }
    }

    if (targetUser.role === "user") {
        const activeBooking = await bookingRepo.checkActiveBooking(targetUser._id);

        if(activeBooking) {
            throw new ApiError(400, "Cannot delete user who has active bookings");
        }
    }

    targetUser.isDeleted = true;
    targetUser.deletedAt = new Date();

    await targetUser.save();

    return targetUser;
};

export const restoreUserService = async (targetUser) => {
    if (!targetUser.isDeleted) {
        throw new ApiError(
            400,
            "User is already active"
        );
    }

    targetUser.isDeleted = false;
    targetUser.deletedAt = null;

    await targetUser.save();

    return targetUser;
}

export const getHotelsByStatusService = async (status = "pending") => {
    return await adminRepo.getHotelsByStatus(status);
}

export const updateHotelStatusService = async (adminId, hotel, status) => {
    if (hotel.isDeleted) {
        throw new ApiError(400, "Deleted hotel cannot be activated");
    }

    if (hotel.status === status) {
        throw new ApiError(400, `Hotel is already ${status}`);
    }

    const allowedTransitions = {
        pending: ["active", "rejected"],
        active: ["suspended", "inactive"],
        suspended: ["active"],
        rejected: ["pending"],
        inactive: ["active"]
    };

    if (!allowedTransitions[hotel.status]?.includes(status)) {
        throw new ApiError(400, `Cannot change hotel status from ${hotel.status} to ${status}`);
    }

    hotel.status = status;

    switch (status) {
        case "active":
            hotel.approvedBy = adminId;
            break;

        case "pending":
        case "rejected":
            hotel.approvedBy = null;
            break;
    }

    await hotel.save();

    return hotel;
}

export const getAllBookingsService = async ( queryData ) => {
  const { page, limit, status, paymentStatus } = queryData;

  const pageNumber = Math.max(1, Number(page));

  const limitNumber = Math.min(100, Math.max(1, Number(limit)));

  const skip = (pageNumber - 1) * limitNumber;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  const { bookings, totalBookings } = await bookingRepo.getBookingsByAdmin(query, skip, limitNumber);

  const totalPages = Math.max(1, Math.ceil(totalBookings / limitNumber));

  return {
    bookings,
    totalBookings,
    page: pageNumber,
    limit: limitNumber,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPrevPage: pageNumber > 1,
    hasData: totalBookings > 0
  };
};