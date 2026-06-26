import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../../bookings/api/bookingApi';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import Pagination from '../../../components/ui/Pagination';
import { format } from 'date-fns';
import { Calendar, CreditCard, User, Building } from 'lucide-react';
import { STATUS } from '../../../constants/status';

export default function OwnerBookingsPage() {
    const [page, setPage] = useState(1);
    const limit = 10;
    
    // We didn't create a specific hook for owner bookings in useBookingQuery, 
    // so we can just use useQuery directly here or create it. Let's use useQuery directly.
    const { data, isLoading, error } = useQuery({
        queryKey: ['ownerBookings', { page, limit }],
        queryFn: () => bookingApi.getOwnerBookings({ page, limit }),
    });

    if (isLoading) return <FullScreenLoader />;
    if (error) return <div className="text-center text-red-500 py-10">Failed to load bookings.</div>;

    const { allBookings: bookings = [], totalPages = 1 } = data || {};

    const getStatusColor = (status) => {
        switch (status) {
            case STATUS.BOOKING.CONFIRMED: return 'bg-green-100 text-green-800';
            case STATUS.BOOKING.PENDING: return 'bg-yellow-100 text-yellow-800';
            case STATUS.BOOKING.CANCELLED: return 'bg-red-100 text-red-800';
            case STATUS.BOOKING.EXPIRED: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">Bookings Overview</h1>
                <p className="text-[#717378]">View and track all reservations across your hotels.</p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-12 text-center">
                    <Calendar className="w-16 h-16 text-[#C5A059] mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-[#04162E] mb-2">No bookings yet</h3>
                    <p className="text-[#717378]">You don't have any reservations across your properties at the moment.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FBF9FB] border-b border-[#EEEEEE] text-[#1A2B44] text-sm font-semibold uppercase tracking-wider">
                                        <th className="p-4">ID / Date</th>
                                        <th className="p-4">Guest</th>
                                        <th className="p-4">Hotel & Room</th>
                                        <th className="p-4">Stay</th>
                                        <th className="p-4 text-center">Amount / Payment</th>
                                        <th className="p-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEEEEE]">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors text-sm">
                                            <td className="p-4">
                                                <div className="font-bold text-[#04162E]">#{booking.id.slice(-6).toUpperCase()}</div>
                                                <div className="text-xs text-[#717378] mt-1">{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 text-[#717378] mr-2" />
                                                    <span className="font-medium text-[#1A2B44] capitalize">
                                                        {booking.userId?.firstName} {booking.userId?.lastName}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-[#717378] mt-1 ml-6">{booking.userId?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-[#1A2B44] font-medium capitalize">
                                                    <Building className="w-4 h-4 text-[#C5A059] mr-2" />
                                                    {booking.hotelId?.hotelName || 'Unknown Hotel'}
                                                </div>
                                                <div className="text-xs text-[#717378] mt-1 ml-6 capitalize">
                                                    {booking.roomType} Room (x{booking.quantity})
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-[#1A2B44]">
                                                    <span className="font-medium">{format(new Date(booking.checkIn), 'MMM dd')}</span> 
                                                    <span className="text-[#717378] mx-1">to</span> 
                                                    <span className="font-medium">{format(new Date(booking.checkOut), 'MMM dd')}</span>
                                                </div>
                                                <div className="text-xs text-[#717378] mt-1">{booking.numberOfGuests} Guests</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="font-bold text-[#C5A059]">₹{booking.totalPrice}</div>
                                                <div className="flex items-center justify-center text-xs mt-1 text-[#717378] capitalize">
                                                    <CreditCard className="w-3 h-3 mr-1" />
                                                    {booking.paymentStatus}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination 
                                count={totalPages} 
                                page={page} 
                                onChange={(e, val) => setPage(val)} 
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
