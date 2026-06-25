import { useState } from 'react';
import { useMyBookings } from '../api/useBookingQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import { Link } from 'react-router-dom';
import Pagination from '../../../components/ui/Pagination';
import { Calendar, MapPin, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '../../../constants/routes';

export default function UserBookingsPage() {
    const [page, setPage] = useState(1);
    const limit = 10;
    
    const { data, isLoading, error } = useMyBookings({ page, limit });

    if (isLoading) return <FullScreenLoader />;
    
    if (error) {
        return <div className="text-center text-red-500 py-10">Failed to load bookings</div>;
    }

    const bookings = data?.bookings ?? [];
    const totalPages = data?.pagination?.totalPages ?? 1;

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">My Bookings</h1>
                <p className="text-[#717378]">Manage and view your upcoming and past reservations.</p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-12 text-center">
                    <Calendar className="w-16 h-16 text-[#C5A059] mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-[#04162E] mb-2">No bookings found</h3>
                    <p className="text-[#717378] mb-6">You haven't made any reservations yet.</p>
                    <Link to="/hotels" className="px-6 py-2.5 bg-[#C5A059] text-white rounded-lg font-medium hover:bg-[#B38D4A] transition-colors inline-block">
                        Explore Hotels
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md">
                            <div className="md:w-1/4 bg-gray-100 h-48 md:h-auto">
                                {booking.hotelId?.images?.[0] ? (
                                    <img src={booking.hotelId.images[0]} alt={booking.hotelId.hotelName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#717378]">No Image</div>
                                )}
                            </div>
                            
                            <div className="p-6 md:w-3/4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-[#04162E] capitalize">
                                            {booking.hotelId?.hotelName || 'Unknown Hotel'}
                                        </h3>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-lg font-bold text-[#C5A059]">₹{booking.totalPrice}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-[#717378] flex items-center mb-4">
                                        <MapPin className="w-4 h-4 mr-1.5" />
                                        {booking.hotelId?.address?.city}, {booking.hotelId?.address?.country}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1">Check-in</p>
                                            <p className="font-medium text-[#1A2B44]">{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1">Check-out</p>
                                            <p className="font-medium text-[#1A2B44]">{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1">Room</p>
                                            <p className="font-medium text-[#1A2B44] capitalize">{booking.roomType} (x{booking.quantity})</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1">Payment</p>
                                            <p className="font-medium text-[#1A2B44] capitalize flex items-center">
                                                <CreditCard className="w-4 h-4 mr-1.5 opacity-70" />
                                                {booking.paymentStatus}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end border-t border-[#EEEEEE] pt-4 mt-2">
                                    <Link 
                                        to={ROUTES.USER.BOOKING_DETAILS(booking._id)}
                                        className="px-5 py-2 border border-[#C5A059] text-[#C5A059] rounded-lg font-medium hover:bg-[#F8F6F2] transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <Pagination 
                                count={totalPages} 
                                page={page} 
                                onChange={(e, val) => setPage(val)} 
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
