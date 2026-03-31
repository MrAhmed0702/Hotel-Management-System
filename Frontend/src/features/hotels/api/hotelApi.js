import apiClient from "../../../services/apiClient";
import { ENDPOINTS } from "../../../services/endpoints";

export const hotelApi = {
    getAllHotels: async (params) => {
        const res = await apiClient.get(ENDPOINTS.HOTEL.GET_ALL_HOTELS, { params });
        return res.data.data.data;
    },

    get_hotel_by_id: async (id) => {
        const res = await apiClient.get(ENDPOINTS.HOTEL.GET_HOTEL_BY_ID(id));
        return res.data;
    },

    create_hotel: async (data) => {
        const res = await apiClient.post(ENDPOINTS.HOTEL.CREATE_HOTEL, data);
        return res.data;
    },

    update_hotel: async (id, data) => {
        const res = await apiClient.put(ENDPOINTS.HOTEL.UPDATE_HOTEL(id), data);
        return res.data;
    },

    delete_hotel: async (id) => {
        const res = await apiClient.delete(ENDPOINTS.HOTEL.DELETE_HOTEL(id));
        return res.data;
    }
}