import app from "./app.js";
import connectDatabase from "./config/db.js";
import dotenv from "dotenv";
import dns from "dns";
import { startJobs } from "./jobs/index.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const startServer = async () => {
    try {
        await connectDatabase();

        startJobs();

        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();