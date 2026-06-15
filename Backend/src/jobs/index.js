import cron from "node-cron";
import { expireBookingsJob } from "./bookingExpiration.job.js";

let isRunning = false;

export const startJobs = () => {

  cron.schedule(
    "* * * * *",
    async () => {

      if (isRunning) {
        return;
      }

      isRunning = true;

      try {
        await expireBookingsJob();
      } finally {
        isRunning = false;
      }

    }
  );

};