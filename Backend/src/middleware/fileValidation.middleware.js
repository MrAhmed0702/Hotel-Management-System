import fs from "fs";
import { fileTypeFromBuffer } from "file-type";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export const validateFileContent = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const buffer = await fs.promises.readFile(req.file.path);

    const type = await fileTypeFromBuffer(buffer);

    if (!type || !allowedTypes.includes(type.mime)) {
      await fs.promises.unlink(req.file.path); // 🔥 delete invalid file

      return res.status(400).json({
        success: false,
        message: "Invalid file content",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};