import User from "../users/user.model.js";
import generateToken from "../../utils/generateToken.js";

export const registerUser = async(data) => {
    const {firstName, lastName, email, phoneNumber, password, dateOfBirth, gender, profilePicture} = data;

    const userExists = await User.findOne({email});
    if(userExists) {
        throw new Error("User already exists");
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
    });

    return user;
}

export const loginUser = async(data) => {
    const {email, password} = data;

    const user = await User.findOne({email}).select("+password");

    if(!user || !(await user.comparePassword(password)) || user.isDeleted) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    return {
        user,
        token
    }
}