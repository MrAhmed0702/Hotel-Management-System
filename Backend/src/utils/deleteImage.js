import fs from "fs";
import logger from "./logger.js";

export const deleteImage = async (filePaths) => {
  try {

    const paths = Array.isArray(filePaths)
      ? filePaths
      : [filePaths];

    await Promise.all(
      paths.map(filePath =>
        fs.promises.unlink(filePath).catch(() => {})
      )
    );

  } catch (error) {
    logger.error("File deletion failed:", { error: error.message });
  }
};