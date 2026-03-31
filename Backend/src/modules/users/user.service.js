import * as userRepo from "./user.repository.js";
import User from "./user.model.js";
import { ApiError } from "../../utils/apiError.js";

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
  ];

  const filteredData = Object.fromEntries(
    Object.entries(updateData).filter(([key]) => allowedUpdates.includes(key)),
  );

  if(Object.keys(filteredData).length === 0){
    throw new ApiError(400, "No valid fields provided");;
  }

  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(404, "User does not exist");

  Object.assign(user, filteredData);
  await userRepo.updateUser(user);

  return user;
};

export const softDeleteUser = async (id) => {
    const user = await userRepo.findUserById(id);
    if(!user) throw new ApiError(404, "User does not exist");
    await userRepo.softDeleteUser(user);
    return user;
}

export const restoreSoftDeletedUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: true });
  if (!user) throw new ApiError(404, "User does not exist");
  await userRepo.restoreUser(user);
  return user;
};
