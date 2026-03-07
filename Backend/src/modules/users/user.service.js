import * as userRepo from "./user.repository.js";
import User from "./user.model.js";

export const getUserById = async (id) => {
  const user = await userRepo.findUserById(id);
  if (!user) throw new Error("User Doesn't Exists");
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
    throw new Error(`No valid fields provided for update`);
  }

  const user = await userRepo.findUserById(id);
  if (!user) throw new Error("User Doesn't Exists");

  Object.assign(user, filteredData);
  await userRepo.updateUser(user);

  return user;
};

export const softDeleteUser = async (id) => {
    const user = await userRepo.findUserById(id);
    if(!user) throw new Error("User Doesn't Exists");
    await userRepo.softDeleteUser(user);
    return user;
}

export const restoreSoftDeletedUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: true });
  if (!user) throw new Error("User doesn't exist or is not deleted");
  await userRepo.restoreUser(user);
  return user;
};
