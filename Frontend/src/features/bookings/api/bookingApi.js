import apiClient from "../../../services/apiClient";
import { ENDPOINTS } from "../../../services/endpoints";

export const bookingApi = {
    // User APIs
    createBooking: async (hotelId, data) => {
        const res = await apiClient.post(ENDPOINTS.BOOKING.CREATE(hotelId), data);
        return res.data.data;
    },
    getMyBookings: async (params) => {
        const res = await apiClient.get(ENDPOINTS.USER.GET_BOOKINGS, { params });
        return res.data.data;
    },
    getMyBookingById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.USER.GET_BOOKING_BY_ID(id));
        return res.data.data;
    },
    cancelMyBooking: async (id, data) => {
        const res = await apiClient.patch(ENDPOINTS.USER.CANCEL_BOOKING(id), data);
        return res.data.data;
    },

    // Owner APIs
    getOwnerBookings: async (params) => {
        const res = await apiClient.get(ENDPOINTS.OWNER.BOOKING.GET_ALL, { params });
        return res.data.data;
    },
    getOwnerBookingById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.OWNER.BOOKING.GET_BY_ID(id));
        return res.data.data;
    }
}
