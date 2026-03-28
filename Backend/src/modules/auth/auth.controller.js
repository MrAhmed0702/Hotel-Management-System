import { registerUser, loginUser } from "./auth.service.js";

export const register = async (req, res) => {
  // 🔥 get file
  const profilePicture = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : undefined;

  const user = await registerUser({
    ...req.body,
    profilePicture,
  });

  const safeUser = user.toObject();

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: safeUser,
  });
};

export const login = async (req, res) => {
  const { user, token } = await loginUser(req.body);

  const { password, ...safeUser } = user.toObject();

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: safeUser,
    token: token,
  });
};
