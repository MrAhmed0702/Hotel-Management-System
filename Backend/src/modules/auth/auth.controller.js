import { registerUser, loginUser } from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    let profilePicture;

    if (req.file && req.file.filename) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      profilePicture = `${baseUrl}/uploads/${req.file.filename}`;
    } else {
      const { firstName, lastName } = req.validatedBody;
      const name = `${firstName || ""} ${lastName || ""}`.trim() || "User";

      profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    }

    console.log("Uploaded file:", req.file?.filename);

    const user = await registerUser({
      ...req.validatedBody,
      profilePicture,
    });

    const { password, ...safeUser } = user.toObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: safeUser,
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res) => {
  const { user, token } = await loginUser(req.validatedData);

  const { password, ...safeUser } = user.toObject();

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: safeUser,
    token: token,
  });
};
