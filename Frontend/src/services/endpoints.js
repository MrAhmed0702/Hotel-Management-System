export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
    },
    USER: {
        GET_USER: "/users/me",
        UPDATE_USER: "/users/me",
        DELETE_USER: "/users/me",
        GET_BOOKINGS: "/users/bookings",
        GET_BOOKING_BY_ID: (id) => `/users/bookings/${id}`,
        CANCEL_BOOKING: (id) => `/users/bookings/${id}/cancel`,
    },
    PUBLIC_HOTEL: {
        GET_ALL: "/hotels",
        GET_BY_ID: (id) => `/hotels/${id}`,
        GET_ROOMS: (id) => `/hotels/${id}/rooms`,
        GET_ROOM_BY_ID: (hotelId, roomId) => `/hotels/${hotelId}/rooms/${roomId}`,
    },
    BOOKING: {
        CREATE: (hotelId) => `/hotels/${hotelId}/bookings`,
    },
    PAYMENT: {
        CREATE: (bookingId) => `/bookings/${bookingId}/payments`,
        GET_PAYMENTS: "/payments",
        VERIFY: "/payments/verify",
        GET_BY_ID: (id) => `/payments/${id}`,
    },
    OWNER: {
        HOTEL: {
            CREATE: "/owner/hotels",
            GET_ALL: "/owner/hotels",
            GET_BY_ID: (id) => `/owner/hotels/${id}`,
            UPDATE: (id) => `/owner/hotels/${id}`,
            DELETE: (id) => `/owner/hotels/${id}`,
        },
        ROOM: {
            CREATE: (hotelId) => `/owner/hotels/${hotelId}/rooms`,
            UPDATE: (hotelId, roomId) => `/owner/hotels/${hotelId}/rooms/${roomId}`,
            DELETE: (hotelId, roomId) => `/owner/hotels/${hotelId}/rooms/${roomId}`,
        },
        BOOKING: {
            GET_ALL: "/owner/bookings",
            GET_BY_ID: (id) => `/owner/bookings/${id}`,
        }
    },
    ADMIN: {
        USER: {
            GET_ALL: "/admin/users",
            GET_DELETED: "/admin/users/deleted",
            GET_BY_ID: (id) => `/admin/users/${id}`,
            UPDATE: (id) => `/admin/users/${id}`,
            UPDATE_ROLE: (id) => `/admin/users/${id}/role`,
            RESTORE: (id) => `/admin/users/${id}/restore`,
            DELETE: (id) => `/admin/users/${id}`,
        },
        HOTEL: {
            GET_ALL: "/admin/hotels",
            GET_BY_ID: (id) => `/admin/hotels/${id}`,
            UPDATE_STATUS: (id) => `/admin/hotels/${id}/status`,
        },
        BOOKING: {
            GET_ALL: "/admin/bookings",
            GET_BY_ID: (id) => `/admin/bookings/${id}`,
        }
    }
};