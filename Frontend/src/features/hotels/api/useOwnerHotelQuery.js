import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hotelApi } from './hotelApi';
import toast from 'react-hot-toast';

// --- Hotels ---

export const useOwnerHotels = (params) => {
    return useQuery({
        queryKey: ['ownerHotels', params],
        queryFn: () => hotelApi.ownerGetAllHotels(params),
    });
};

export const useOwnerHotelById = (id) => {
    return useQuery({
        queryKey: ['ownerHotel', id],
        queryFn: () => hotelApi.ownerGetHotelById(id),
        enabled: !!id,
    });
};

export const useCreateHotel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => hotelApi.ownerCreateHotel(data),
        onSuccess: () => {
            toast.success('Hotel created successfully!');
            queryClient.invalidateQueries({ queryKey: ['ownerHotels'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create hotel');
        }
    });
};

export const useUpdateHotel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => hotelApi.ownerUpdateHotel(id, data),
        onSuccess: (data, variables) => {
            toast.success('Hotel updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['ownerHotels'] });
            queryClient.invalidateQueries({ queryKey: ['ownerHotel', variables.id] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update hotel');
        }
    });
};

export const useDeleteHotel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => hotelApi.ownerDeleteHotel(id),
        onSuccess: () => {
            toast.success('Hotel deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['ownerHotels'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete hotel');
        }
    });
};

// --- Rooms ---

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ hotelId, data }) => hotelApi.ownerCreateRoom(hotelId, data),
        onSuccess: (data, variables) => {
            toast.success('Room added successfully!');
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId, 'rooms'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to add room');
        }
    });
};

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ hotelId, roomId, data }) => hotelApi.ownerUpdateRoom(hotelId, roomId, data),
        onSuccess: (data, variables) => {
            toast.success('Room updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId, 'rooms'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update room');
        }
    });
};

export const useDeleteRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ hotelId, roomId }) => hotelApi.ownerDeleteRoom(hotelId, roomId),
        onSuccess: (data, variables) => {
            toast.success('Room deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId, 'rooms'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete room');
        }
    });
};
