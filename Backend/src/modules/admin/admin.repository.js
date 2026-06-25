import User from "../users/user.model.js";
import Hotel from "../hotels/hotel.model.js";

export const getAllUsers = async ({ query, skip, limit, sortBy }) => {

    const finalQuery = { ...query };

    const [users, totalUsers] = await Promise.all([
        User.find(finalQuery)
            .sort({
                ...sortBy,
                _id: 1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(finalQuery)
    ]);

    return {
        users: users.map(u => ({ ...u, id: u._id.toString() })),
        totalUsers
    };
};

export const getDeletedUsers = async ({
    query,
    skip,
    limit,
    sortBy
}) => {

    const finalQuery = {
        ...query,
        isDeleted: true
    };

    const [users, totalUsers] = await Promise.all([
        User.find(finalQuery)
            .setOptions({ includeDeleted: true })
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(finalQuery)
    ]);

    return {
        users: users.map(u => ({ ...u, id: u._id.toString() })),
        totalUsers
    };
};

export const checkEmailExists = async (email, userId) => {
    return !!(
        await User.exists({
            email,
            _id: { $ne: userId }
        })
    );
};

export const checkPhoneNumberExists = async (phoneNumber, userId) => {
    return !!(
        await User.exists({
            phoneNumber,
            _id: { $ne: userId }
        })
    );
};

export const countAdmins = async () => {
    return await User.countDocuments({ role: "admin", isDeleted: false });
}

export const countHotelsByOwner = async (ownerId) => {
    return await Hotel.countDocuments({ owner: ownerId, isDeleted: false });
}

export const getHotelsByStatus = async ({ query, skip, limit }) => {
    const [hotels, totalHotels] = await Promise.all([
        Hotel.find(query)
            .populate("owner", "firstName lastName email phoneNumber")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Hotel.countDocuments(query)
    ]);

    return {
        hotels,
        totalHotels
    };
}