import apiClient from "../../../services/apiClient";
import { ENDPOINTS } from "../../../services/endpoints";

export const adminApi = {
    // Users
    getAllUsers: async (params) => {
        const res = await apiClient.get(ENDPOINTS.ADMIN.USER.GET_ALL, { params });
        return res.data.data;
    },
    getDeletedUsers: async (params) => {
        const res = await apiClient.get(ENDPOINTS.ADMIN.USER.GET_DELETED, { params });
        return res.data.data;
    },
    getUserById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.ADMIN.USER.GET_BY_ID(id));
        return res.data.data;
    },
    updateUser: async (id, data) => {
        const res = await apiClient.patch(ENDPOINTS.ADMIN.USER.UPDATE(id), data);
        return res.data.data;
    },
    updateUserRole: async (id, data) => {
        const res = await apiClient.patch(ENDPOINTS.ADMIN.USER.UPDATE_ROLE(id), data);
        return res.data.data;
    },
    restoreUser: async (id) => {
        const res = await apiClient.patch(ENDPOINTS.ADMIN.USER.RESTORE(id));
        return res.data.data;
    },
    deleteUser: async (id) => {
        const res = await apiClient.delete(ENDPOINTS.ADMIN.USER.DELETE(id));
        return res.data.data;
    },

    // Hotels
    getAllHotels: async (params) => {
        const res = await apiClient.get(ENDPOINTS.ADMIN.HOTEL.GET_ALL, { params });
        return res.data.data;
    },
    getHotelById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.ADMIN.HOTEL.GET_BY_ID(id));
        return res.data.data;
    },
    updateHotelStatus: async (id, data) => {
        const res = await apiClient.patch(ENDPOINTS.ADMIN.HOTEL.UPDATE_STATUS(id), data);
        return res.data.data;
    },

    // Bookings
    getAllBookings: async (params) => {
        const res = await apiClient.get(ENDPOINTS.ADMIN.BOOKING.GET_ALL, { params });
        return res.data.data;
    },
    getBookingById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.ADMIN.BOOKING.GET_BY_ID(id));
        return res.data.data;
    }
}
