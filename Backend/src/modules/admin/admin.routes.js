import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validateUserId } from "../../middleware/validateUserId.middleware.js";
import { validateUserIdIncludingDeleted } from "../../middleware/validateUserIdIncludingDeleted.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateUserSchema, updateRoleSchema } from "./admin.validation.js";

import {
  getUserDetails,
  getDeletedUsers,
  getAllUsers,
  updateUser,
  updateRole,
  restoreUser,
  deleteUser
} from "./admin.controller.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorize("admin"));

router.get("/users", getAllUsers);
router.get("/users/deleted", getDeletedUsers);
router.get("/users/:userId", validateUserIdIncludingDeleted, getUserDetails);

router.patch("/users/:userId", validateUserId, validate(updateUserSchema), updateUser);
router.patch("/users/:userId/role", validateUserId, validate(updateRoleSchema), updateRole);
router.patch("/users/:userId/restore", validateUserIdIncludingDeleted, restoreUser);

router.delete("/users/:userId", validateUserId, deleteUser);

export default router;