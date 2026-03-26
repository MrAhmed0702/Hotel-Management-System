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
    }
}