import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from './bookingApi';
import toast from 'react-hot-toast';

export const useCreateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ hotelId, data }) => bookingApi.createBooking(hotelId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        }
    });
};

export const useMyBookings = (params) => {
    return useQuery({
        queryKey: ['myBookings', params],
        queryFn: () => bookingApi.getMyBookings(params),
    });
};

export const useMyBookingById = (id) => {
    return useQuery({
        queryKey: ['myBooking', id],
        queryFn: () => bookingApi.getMyBookingById(id),
        enabled: !!id,
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => bookingApi.cancelMyBooking(id, data),
        onSuccess: (data, variables) => {
            toast.success('Booking cancelled successfully');
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
            queryClient.invalidateQueries({ queryKey: ['myBooking', variables.id] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    });
};
