import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from './adminApi';
import toast from 'react-hot-toast';

// --- Users ---
export const useAdminUsers = (params) => {
    return useQuery({
        queryKey: ['adminUsers', params],
        queryFn: () => adminApi.getAllUsers(params),
    });
};

export const useAdminDeletedUsers = (params) => {
    return useQuery({
        queryKey: ['adminDeletedUsers', params],
        queryFn: () => adminApi.getDeletedUsers(params),
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, role }) => adminApi.updateUserRole(id, { role }),
        onSuccess: () => {
            toast.success('User role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update user role');
        }
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminApi.deleteUser(id),
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminDeletedUsers'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    });
};

export const useRestoreUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminApi.restoreUser(id),
        onSuccess: () => {
            toast.success('User restored successfully');
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminDeletedUsers'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to restore user');
        }
    });
};

// --- Hotels ---
export const useAdminHotels = (params) => {
    return useQuery({
        queryKey: ['adminHotels', params],
        queryFn: () => adminApi.getAllHotels(params),
    });
};

export const useUpdateHotelStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, reason }) => adminApi.updateHotelStatus(id, { status, reason }),
        onSuccess: () => {
            toast.success('Hotel status updated');
            queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update hotel status');
        }
    });
};

// --- Bookings ---
export const useAdminBookings = (params) => {
    return useQuery({
        queryKey: ['adminBookings', params],
        queryFn: () => adminApi.getAllBookings(params),
    });
};
