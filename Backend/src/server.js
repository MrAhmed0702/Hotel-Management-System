import "dotenv/config.js";
import app from "./app.js";
import connectDatabase from "./config/db.js";
import dns from "dns";
import { startJobs } from "./jobs/index.js";
import logger from "./utils/logger.js";
import { dropPaymentTTLIndex } from "./migrations/dropPaymentTTL.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const startServer = async () => {
    try {
        await connectDatabase();

        // 🔧 One-time migration: remove TTL index that deletes paid payments, and drop unique booking index
        await dropPaymentTTLIndex();

        startJobs();

        app.listen(process.env.PORT, () => {
            logger.info(`🚀 Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        logger.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();