import { getUserById, updateUserById, softDeleteUser as softDeleteUserService } from "./user.service.js";

export const getUserDetails = async (req, res) => {
        const user = await getUserById(req.user.id);

        res.status(200).json({
            success: true,
            message: "User Details Fetched Successfully",
            data: user
        });
}

export const updateUserDetails = async (req, res) => {
    const updatedUser = await updateUserById(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: "User Details Updated Successfully",
        data: updatedUser
    });
}

export const softDeleteUser = async (req, res) => {
    const deletedUser = await softDeleteUserService(req.user.id);

    res.status(200).json({
        success: true,
        message: "User Record Is Deleted Successfully",
        data: deletedUser
    });
}