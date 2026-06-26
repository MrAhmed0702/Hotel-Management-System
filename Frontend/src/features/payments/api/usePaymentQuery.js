import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentApi } from './paymentApi';
import toast from 'react-hot-toast';

export const useCreatePayment = () => {
    return useMutation({
        mutationFn: ({ bookingId, config }) => paymentApi.createPayment(bookingId, config),
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        }
    });
};

export const useGetPayments = () => {
    return useQuery({
        queryKey: ["payments"],
        queryFn: paymentApi.getPayments,
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to fetch payments');
        }
    })
}

export const usePaymentById = (id) => {
    return useQuery({
        queryKey: ['payment', id],
        queryFn: () => paymentApi.getPaymentById(id),
        enabled: !!id,
    });
};

export const useVerifyPayment = () => {
    return useMutation({
        mutationFn: (verifyData) => paymentApi.verifyPayment(verifyData),
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Payment verification failed');
        }
    });
};
