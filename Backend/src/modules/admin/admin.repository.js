import User from "../users/user.model.js";

export const getAllUsers = async ({ query, skip, limit, sortBy }) => {

    const finalQuery = { ...query };

    const [allUsers, totalUsers] = await Promise.all([
        User.find(finalQuery)
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(finalQuery)
    ]);

    return {
        allUsers,
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
        users,
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