import * as adminRepo from "./admin.repository.js";
import { ApiError } from "../../utils/apiError.js";

export const getAllUsersService = async ({ page, limit, search, sortBy }) => {
    page = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));

    const skip = (page - 1) * limit;

    const query = {}

    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } }
        ];
    }

    const { allUsers, totalUsers } = await adminRepo.getAllUsers({
        query,
        skip,
        limit,
        sortBy
    })

    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

    return {
        allUsers,
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
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } }
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