import { DateTime } from "luxon";

export function calculateNightsUTC(checkIn, checkOut) {
  const checkInDate =
    checkIn instanceof Date
      ? DateTime.fromJSDate(checkIn, { zone: "UTC" }).startOf("day")
      : DateTime.fromISO(checkIn, { zone: "UTC" }).startOf("day");

  const checkOutDate =
    checkOut instanceof Date
      ? DateTime.fromJSDate(checkOut, { zone: "UTC" }).startOf("day")
      : DateTime.fromISO(checkOut, { zone: "UTC" }).startOf("day");

  if (!checkInDate.isValid || !checkOutDate.isValid) {
    throw new Error("Invalid date format");
  }

  const nights = Math.floor(checkOutDate.diff(checkInDate, "days").days);

  if (nights <= 0) {
    throw new Error("Check-out must be after check-in");
  }

  return nights;
}