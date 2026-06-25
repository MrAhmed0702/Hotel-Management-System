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

export const usePaymentById = (id) => {
    return useQuery({
        queryKey: ['payment', id],
        queryFn: () => paymentApi.getPaymentById(id),
        enabled: !!id,
    });
};
