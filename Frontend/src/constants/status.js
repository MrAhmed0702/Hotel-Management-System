export const STATUS = {
  HOTEL: {
    PENDING: 'pending',
    ACTIVE: 'active',
    REJECTED: 'rejected',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },
  ROOM: {
    AVAILABLE: 'available',
    MAINTENANCE: 'maintenance',
    INACTIVE: 'inactive'
  },
  BOOKING: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
  },
  PAYMENT: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    INITIATED: 'initiated', // Booking payment status
    NONE: 'none' // Booking payment status
  }
};
