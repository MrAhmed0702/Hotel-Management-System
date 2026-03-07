import User from "./user.model.js";

export const findUserById = (id) => User.findById(id);

export const updateUser = (user) => user.save();

export const softDeleteUser = (user) => {
  user.isDeleted = true;
  user.deletedAt = new Date();
  return user.save();
};

export const restoreUser = (user) => {
  user.isDeleted = false;
  user.deletedAt = null;
  return user.save();
};