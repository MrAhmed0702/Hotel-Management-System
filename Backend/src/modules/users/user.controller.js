import { getUserById, updateUserById, softDeleteUser as softDeleteUserService } from "./user.service.js";
import fs from "fs";

export const getUserDetails = async (req, res) => {
        const user = await getUserById(req.user.id);

        res.status(200).json({
            success: true,
            message: "User Details Fetched Successfully",
            data: user
        });
}

export const updateUserDetails = async (req, res, next) => {
    try {
        const updateData = { ...req.validatedData };

        if(req.file?.filename){
            const baseURL =  `${req.protocol}://${req.get("host")}`;
            updateData.profilePicture = `${baseURL}/uploads/${req.file.filename}`;
            updateData.profilePictureType = "uploaded";
        }

        const updatedUser = await updateUserById(req.user.id, updateData);

        res.status(200).json({
            success: true,
            message: "User Details Updated Successfully",
            data: updatedUser
        });
    } catch (error) {
        if(req.file?.path){
            await fs.promises.unlink(req.file.path).catch(err => console.error("Failed to delete uploaded file:", err));
        }
        next(error);
    }
}

export const softDeleteUser = async (req, res) => {
    const deletedUser = await softDeleteUserService(req.user.id);

    res.status(200).json({
        success: true,
        message: "User Record Is Deleted Successfully",
        data: deletedUser
    });
}