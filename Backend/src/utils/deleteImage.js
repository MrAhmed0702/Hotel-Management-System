import fs from "fs";

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
    console.error(
      "File deletion failed:",
      error.message
    );
  }
};