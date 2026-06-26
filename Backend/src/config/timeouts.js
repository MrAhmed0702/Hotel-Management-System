// All timeouts are in milliseconds
export const TIMEOUTS = {
  // Time user has to complete a payment before the checkout session expires
  PAYMENT_TIMEOUT_MS: parseInt(process.env.PAYMENT_TIMEOUT_MS) || 15 * 60 * 1000, // Default: 15 minutes

  // Time a booking is held in a "pending" state before auto-cancellation
  BOOKING_HOLD_TIMEOUT_MS: parseInt(process.env.BOOKING_HOLD_TIMEOUT_MS) || 10 * 60 * 1000, // Default: 10 minutes
  
  // Grace period to allow webhook processing when timeouts are evaluated
  GRACE_PERIOD_MS: parseInt(process.env.TIMEOUT_GRACE_PERIOD_MS) || 2 * 60 * 1000, // Default: 2 minutes
};
