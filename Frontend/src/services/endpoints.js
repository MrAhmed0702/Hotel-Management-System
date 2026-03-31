export const ENDPOINTS = {
    
    // Authentication router from backend (module/auth/routes/auth.routes.js)
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
    },

    USER: {
        GET_USER: "/users/me",
    },

    HOTEL: {
        GET_ALL_HOTELS: "/hotels",
        GET_HOTEL_BY_ID: (id) => `/hotels/${id}`,
        CREATE_HOTEL: "/hotels",
        UPDATE_HOTEL: (id) => `/hotels/${id}`,
        DELETE_HOTEL: (id) => `/hotels/${id}`,
    }
}