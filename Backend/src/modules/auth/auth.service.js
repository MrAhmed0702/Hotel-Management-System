import User from "../users/user.model.js";
import generateToken from "../../utils/generateToken.js";
import { ApiError } from "../../utils/apiError.js";

export const registerUser = async (data) => {
    const { firstName, lastName, email, phoneNumber, password, dateOfBirth, gender, profilePicture, profilePictureType } = data;

    const emailExists = await User.findOne({ email });

    if (emailExists) {
        throw new ApiError(409, "Email already exists");
    }

    const phoneExists = await User.findOne({ phoneNumber });

    if (phoneExists) {
        throw new ApiError(409, "Phone number already exists");
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        dateOfBirth,
        gender,
        profilePicture,
        profilePictureType
    });

    return user;
}

export const loginUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password)) || user.isDeleted) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user);

    return {
        user,
        token
    }
}