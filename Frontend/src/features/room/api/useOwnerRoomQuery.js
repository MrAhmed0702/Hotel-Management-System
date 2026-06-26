import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelApi } from '../../hotels/api/hotelApi';
import toast from 'react-hot-toast';

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
