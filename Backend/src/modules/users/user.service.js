import * as userRepo from "./user.repository.js";
import User from "./user.model.js";
import { ApiError } from "../../utils/apiError.js";
import { deleteImage } from "../../utils/deleteImage.js";
import path from "path";

export const getUserById = async (id) => {
  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(404, "User does not exist");
  return user;
};

export const updateUserById = async (id, updateData) => {

  const allowedUpdates = [
    "firstName",
    "lastName",
    "gender",
    "dateOfBirth",
    "phoneNumber",
    "profilePicture",
    "profilePictureType"
  ];

  const filteredData = Object.fromEntries(
    Object.entries(updateData).filter(([key]) => allowedUpdates.includes(key)),
  );

  if (Object.keys(filteredData).length === 0) {
    throw new ApiError(400, "No valid fields provided");;
  }

  if (filteredData.phoneNumber) {
    const existingUser = await User.findOne({
      phoneNumber: filteredData.phoneNumber,
      _id: { $ne: id }
    });

    if (existingUser) {
      throw new ApiError(409, "Phone number already in use");
    }
  }

  const user = await userRepo.findUserById(id);

  if (!user) throw new ApiError(404, "User does not exist");

  const oldProfilePicture = user.profilePicture;
  const oldProfilePictureType = user.profilePictureType;

  const nameChanged = "firstName" in filteredData || "lastName" in filteredData;

  if (nameChanged && user.profilePictureType === "default") {
    const firstName = filteredData.firstName || user.firstName;
    const lastName = filteredData.lastName || user.lastName;

    const name = `${firstName || ""} ${lastName || ""}`.trim() || "User";

    filteredData.profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  }

  Object.assign(user, filteredData);
  await userRepo.updateUser(user);

  if (filteredData.profilePicture &&
    filteredData.profilePictureType === "uploaded" &&
    oldProfilePictureType === "uploaded" &&
    oldProfilePicture?.includes("/uploads/")
  ) {
    const oldFileName = path.basename(oldProfilePicture);
    const oldFilePath = oldProfilePicture.includes("/uploads/profiles/")
      ? path.join(process.cwd(), "uploads", "profiles", oldFileName)
      : path.join(process.cwd(), "uploads", oldFileName);

    await deleteImage(oldFilePath);
  }


  return user;
};

export const softDeleteUser = async (id) => {
  const user = await userRepo.findUserById(id);

  if (!user) throw new ApiError(404, "User does not exist");

  if (user.profilePictureType === "uploaded") {
    const fileName = path.basename(user.profilePicture);

    const filePath = path.join(
      process.cwd(),
      "uploads",
      fileName
    );

    await deleteImage(filePath);
  }

  await userRepo.softDeleteUser(user);

  return user;
}

export const restoreSoftDeletedUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: true });
  if (!user) throw new ApiError(404, "User does not exist");
  await userRepo.restoreUser(user);
  return user;
};

export const getMyBookingsService = async (userId, query) => {

  const { page = 1, limit = 10 } = query;

  const { bookings, totalCount } = await userRepo.findBookingsByUser(userId, page, limit );

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    bookings,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

export const cancelBookingService = async (booking, reason) => {
  if (booking.status !== "pending") {
    throw new ApiError(
      400,
      "Only pending bookings can be cancelled"
    );
  }

  const cancellablePaymentStatuses = ["none", "initiated"];

  if (!cancellablePaymentStatuses.includes(booking.paymentStatus)) {
    throw new ApiError(
      400,
      "Only unpaid bookings can be cancelled"
    );
  }

  booking.status = "cancelled";
  booking.cancelReason = reason;

  await booking.save();

  return booking;
}
