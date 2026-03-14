import { DateTime } from "luxon";

export function calculateNightsUTC(checkInISO, checkOutISO) {
  const checkIn = DateTime.fromISO(checkInISO, { zone: "UTC" }).startOf("day");
  const checkOut = DateTime.fromISO(checkOutISO, { zone: "UTC" }).startOf(
    "day",
  );

  if (!checkIn.isValid || !checkOut.isValid) {
    throw new Error("Invalid date format");
  }
  
  const nights = Math.floor(checkOut.diff(checkIn, "days").days);

  if (nights <= 0) {
    throw new Error("Check-out must be after check-in");
  }

  return nights;
}
