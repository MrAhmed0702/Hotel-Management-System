import { useQuery } from '@tanstack/react-query';
import { hotelApi } from './hotelApi';

export const useHotelDetails = (hotelId) => {
    return useQuery({
        queryKey: ['hotel', hotelId],
        queryFn: () => hotelApi.getHotelById(hotelId),
        enabled: !!hotelId,
    });
};

export const useHotelRooms = (hotelId) => {
    return useQuery({
        queryKey: ['hotel', hotelId, 'rooms'],
        queryFn: () => hotelApi.getHotelRooms(hotelId),
        enabled: !!hotelId,
    });
};
