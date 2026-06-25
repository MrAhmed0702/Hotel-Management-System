export const ROUTES = {
  HOME: '/',
  HOTELS: '/hotels',
  HOTEL_DETAILS: (hotelId = ":hotelId") => `/hotels/${hotelId}`,
  LOGIN: '/login',
  REGISTER: '/register',
  
  // User Routes
  USER: {
    DASHBOARD: '/dashboard',
    PROFILE: '/dashboard/profile',
    BOOKINGS: '/dashboard/bookings',
    BOOKING_DETAILS: (bookingId = ":bookingId") => `/dashboard/bookings/${bookingId}`,
    PAYMENT_HISTORY: '/dashboard/payments',
  },
  
  // Owner Routes
  OWNER: {
    DASHBOARD: '/owner',
    OVERVIEW: '/owner/overview',
    MY_HOTELS: '/owner/hotels',
    ADD_HOTEL: '/owner/hotels/new',
    EDIT_HOTEL: (hotelId = ":hotelId") => `/owner/hotels/${hotelId}/edit`,
    ROOMS: (hotelId = ":hotelId") => `/owner/hotels/${hotelId}/rooms`,
    BOOKINGS: '/owner/bookings',
    PROFILE: '/owner/profile',
  },
  
  // Admin Routes
  ADMIN: {
    DASHBOARD: '/admin',
    ANALYTICS: '/admin/analytics',
    USERS: '/admin/users',
    HOTELS: '/admin/hotels',
    PENDING_APPROVALS: '/admin/approvals',
    BOOKINGS: '/admin/bookings',
    PROFILE: '/admin/profile',
  }
};
