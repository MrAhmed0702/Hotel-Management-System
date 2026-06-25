import apiClient from "../../../services/apiClient";
import { ENDPOINTS } from "../../../services/endpoints";

export const hotelApi = {
    // Public APIs
    getAllHotels: async (params) => {
        const res = await apiClient.get(ENDPOINTS.PUBLIC_HOTEL.GET_ALL, { params });
        return res.data.data;
    },
    getHotelById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.PUBLIC_HOTEL.GET_BY_ID(id));
        return res.data.data;
    },
    getHotelRooms: async (id) => {
        const res = await apiClient.get(ENDPOINTS.PUBLIC_HOTEL.GET_ROOMS(id));
        return res.data.data;
    },
    getRoomById: async (hotelId, roomId) => {
        const res = await apiClient.get(ENDPOINTS.PUBLIC_HOTEL.GET_ROOM_BY_ID(hotelId, roomId));
        return res.data.data;
    },

    // Owner APIs
    ownerGetAllHotels: async (params) => {
        const res = await apiClient.get(ENDPOINTS.OWNER.HOTEL.GET_ALL, { params });
        return res.data.data;
    },
    ownerGetHotelById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.OWNER.HOTEL.GET_BY_ID(id));
        return res.data.data;
    },
    ownerCreateHotel: async (data) => {
        const res = await apiClient.post(ENDPOINTS.OWNER.HOTEL.CREATE, data);
        return res.data.data;
    },
    ownerUpdateHotel: async (id, data) => {
        const res = await apiClient.patch(ENDPOINTS.OWNER.HOTEL.UPDATE(id), data);
        return res.data.data;
    },
    ownerDeleteHotel: async (id) => {
        const res = await apiClient.delete(ENDPOINTS.OWNER.HOTEL.DELETE(id));
        return res.data.data;
    },
    ownerCreateRoom: async (hotelId, data) => {
        const res = await apiClient.post(ENDPOINTS.OWNER.ROOM.CREATE(hotelId), data);
        return res.data.data;
    },
    ownerUpdateRoom: async (hotelId, roomId, data) => {
        const res = await apiClient.patch(ENDPOINTS.OWNER.ROOM.UPDATE(hotelId, roomId), data);
        return res.data.data;
    },
    ownerDeleteRoom: async (hotelId, roomId) => {
        const res = await apiClient.delete(ENDPOINTS.OWNER.ROOM.DELETE(hotelId, roomId));
        return res.data.data;
    }
}