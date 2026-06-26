import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Drops any TTL index on the `expiresAt` field of the payments collection.
 *
 * MongoDB TTL indexes automatically delete documents after the `expiresAt` date.
 * Since `expiresAt` in payments is copied from the booking (10 min window), paid
 * payments were being silently deleted by MongoDB's background TTL thread.
 *
 * This migration runs once on startup to remove the problematic index.
 */
export const dropPaymentTTLIndex = async () => {
  try {
    const collection = mongoose.connection.db.collection("payments");
    const indexes = await collection.indexes();

    for (const index of indexes) {
      // TTL indexes have an `expireAfterSeconds` property
      if (index.expireAfterSeconds !== undefined) {
        logger.info(
          `🔧 Dropping TTL index "${index.name}" on payments collection (expireAfterSeconds: ${index.expireAfterSeconds})`
        );
        await collection.dropIndex(index.name);
        logger.info(`✅ TTL index "${index.name}" dropped successfully.`);
      }
      // Drop unique bookingId index if it exists
      if (index.name === "bookingId_1" && index.unique) {
        logger.info(
          `🔧 Dropping unique index "${index.name}" on payments collection`
        );
        await collection.dropIndex(index.name);
        logger.info(`✅ Unique index "${index.name}" dropped successfully.`);
      }
    }
  } catch (error) {
    // If the collection doesn't exist yet, or index was already dropped, ignore
    if (error.codeName === "NamespaceNotFound" || error.code === 27) {
      return;
    }
    logger.error("⚠️ Failed to drop payment TTL index:", error.message);
  }
};
