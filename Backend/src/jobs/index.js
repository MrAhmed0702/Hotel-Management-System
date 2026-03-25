import cron from "node-cron";
import { expireBookingsJob } from "./bookingExpiration.job.js";

export const startJobs = () => {
  // every 1 minute
  cron.schedule("* * * * *", async () => {
    console.log("⏳ Running expiration job...");
    await expireBookingsJob();
  });
};