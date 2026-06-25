import { getAllUsersService, getDeletedUsersService, updateUserService, updateRoleService, deleteUserService, restoreUserService, getHotelsByStatusService, updateHotelStatusService, getAllBookingsService } from "./admin.service.js";

export const getAllUsers = async (req, res) => {
    const { page, limit, search, sort, order } = req.validatedData;

    const allowedSortFields = [
        "createdAt",
        "firstName",
        "lastName",
        "email"
    ];

    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

    const sortBy = {
        [sortField]: order === "asc" ? 1 : -1
    };

    const result = await getAllUsersService({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy
    });

    res.status(200).json({
        success: true,
        message: "All active users fetched successfully",
        data: result
    });
};

export const getDeletedUsers = async (req, res) => {
    const { page, limit, search, sort, order } = req.validatedData;

    const allowedSortFields = [
        "createdAt",
        "firstName",
        "lastName",
        "email"
    ];

    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

    const sortBy = {
        [sortField]: order === "asc" ? 1 : -1
    };

    const deletedUsers = await getDeletedUsersService({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy
    });

    res.status(200).json({
        success: true,
        message: "Deleted users fetched successfully",
        data: deletedUsers
    });
};

export const getUserDetails = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "User details fetched successfully",
        data: req.targetUserIncludingDeleted
    })
}

export const updateUser = async (req, res) => {
    const updatedUser = await updateUserService(req.targetUser, req.validatedData);

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
    })
};

export const updateRole = async (req, res) => {
    const updatedRole = await updateRoleService(req.user, req.targetUser, req.validatedData);

    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: updatedRole
    })
};

export const deleteUser = async (req, res) => {
    const deletedUser = await deleteUserService(req.user, req.targetUser);

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser
    })
}

export const restoreUser = async (req, res) => {
    const restoredUser = await restoreUserService(req.targetUserIncludingDeleted);

    res.status(200).json({
        success: true,
        message: "User restored successfully",
        data: restoredUser
    })
}

export const getHotelsByStatus = async (req, res) => {
    const { status, page, limit } = req.validatedData;

    const hotels = await getHotelsByStatusService({ status, page, limit });

    res.status(200).json({
        success: true,
        message: "Hotels fetched successfully",
        data: hotels
    })
}

export const getHotelDetails = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hotel fetched successfully",
        data: req.targetHotel
    })
}

export const updateHotelStatus = async (req, res) => {
    const {status, reason} = req.validatedData;
    
    const updatedHotelStatus = await updateHotelStatusService(req.user.id, req.targetHotel, status, reason);

    res.status(200).json({
        success: true,
        message: "Hotel status updated successfully",
        data: updatedHotelStatus
    })
}

export const getAllBookings = async (req, res) => {
  const result = await getAllBookingsService(
    req.validatedData
  );

  res.status(200).json({
    success: true,
    message: "Bookings fetched successfully",
    data: result
  });
};

export const getBookingDetails = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking fetched successfully",
    data: req.targetBooking
  });
};