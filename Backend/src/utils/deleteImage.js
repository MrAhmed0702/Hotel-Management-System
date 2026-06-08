import fs from "fs";

export const deleteImage = async (filePath) => {
    try {
        await fs.promises.unlink(filePath)
    } catch (error) {
        console.error("File deletion failed:", error.message);
    }
}