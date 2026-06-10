import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import { deleteImage } from "../utils/deleteImage.js";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

export const validateFileContent = async (req, res, next) => {
  try {

    // SINGLE FILE
    if (req.file) {
      const buffer = await fs.promises.readFile(req.file.path);

      const type = await fileTypeFromBuffer(buffer);

      if (!type || !allowedTypes.includes(type.mime)) {
        // delete file using deleteImage utility
        await deleteImage(req.file.path);

        return res.status(400).json({
          success: false,
          message: "Invalid file content"
        });
      }
    }

    // MULTIPLE FILES
    if (req.files?.length) {

      for (const file of req.files) {

        const buffer = await fs.promises.readFile(file.path);

        const type = await fileTypeFromBuffer(buffer);

        if (!type || !allowedTypes.includes(type.mime)) {

          // cleanup all uploaded files
          await deleteImage(req.files.map(file => file.path));

          return res.status(400).json({
            success: false,
            message: "One or more files contain invalid content"
          });
        }
      }
    }

    next();

  } catch (error) {
    const files = [
      ...(req.file ? [req.file] : []),
      ...(req.files || [])
    ];

    await deleteImage(files.map(file => file.path));

    next(error);
  }
};