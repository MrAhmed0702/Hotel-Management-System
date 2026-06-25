import apiClient from "../../../services/apiClient.js";
import { ENDPOINTS } from "../../../services/endpoints.js";

export const authApi = {
    login: async (data) => {
        const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
        return res.data;
    },

    register: async (data) => {
        const res = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
        return res.data;
    },

    getMe: async () => {
        const res = await apiClient.get(ENDPOINTS.USER.GET_USER);
        return res.data;
    },

    updateUser: async (data) => {
        const res = await apiClient.patch(ENDPOINTS.USER.UPDATE_USER, data);
        return res.data;
    },

    deleteUser: async () => {
        const res = await apiClient.delete(ENDPOINTS.USER.DELETE_USER);
        return res.data;
    }
}