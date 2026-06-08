import { registerUser, loginUser } from "./auth.service.js";
import fs from "fs";

export const register = async (req, res, next) => {
  try {
    let profilePicture;
    let profilePictureType;

    if (req.file && req.file.filename) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      profilePicture = `${baseUrl}/uploads/${req.file.filename}`;
      profilePictureType = "uploaded";
    } else {
      const { firstName, lastName } = req.validatedData;
      const name = `${firstName || ""} ${lastName || ""}`.trim() || "User";
      
      profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
      profilePictureType = "default";
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Uploaded file:", req.file?.filename);
    }

    const user = await registerUser({
      ...req.validatedData,
      profilePicture,
      profilePictureType
    });

    const { password, ...safeUser } = user.toObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: safeUser,
    });

  } catch (error) {
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch(err => console.error("Failed to delete uploaded file:", err));
    }

    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.validatedData);

    const { password, ...safeUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: safeUser,
      token: token,
    });

  } catch (error) {
    next(error);
  }
};
