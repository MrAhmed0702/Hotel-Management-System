import apiClient from "../../../services/apiClient";
import { ENDPOINTS } from "../../../services/endpoints";

export const paymentApi = {
    createPayment: async (bookingId, config) => {
        const res = await apiClient.post(ENDPOINTS.PAYMENT.CREATE(bookingId), {}, config);
        return res.data.data;
    },
    getPayments: async () => {
        const res = await apiClient.get(ENDPOINTS.PAYMENT.GET_PAYMENTS);
        return res.data.data;
    },
    getPaymentById: async (id) => {
        const res = await apiClient.get(ENDPOINTS.PAYMENT.GET_BY_ID(id));
        return res.data.data;
    },
    verifyPayment: async (verifyData) => {
        const res = await apiClient.post(ENDPOINTS.PAYMENT.VERIFY, verifyData);
        return res.data.data;
    }
}
