import express from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware.js";
import { getUserDetails, updateUserDetails, softDeleteUser } from "./user.controller.js";

const router = express.Router();

router.get("/me", verifyToken, getUserDetails);

router.patch("/me", verifyToken, updateUserDetails);

router.delete("/me", verifyToken, softDeleteUser);

export default router;