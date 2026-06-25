import { useParams, useNavigate } from 'react-router-dom';
import { useMyBookingById, useCancelBooking } from '../api/useBookingQuery';
import { useCreatePayment } from '../../payments/api/usePaymentQuery';
import { loadRazorpay } from '../../../utils/razorpay';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import { ChevronLeft, MapPin, CreditCard, Calendar, Users, Building, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSelectors';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { ROUTES } from '../../../constants/routes';

export default function UserBookingDetailsPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { data: booking, isLoading, error } = useMyBookingById(bookingId);
    const cancelMutation = useCancelBooking();
    const createPaymentMutation = useCreatePayment();
    const user = useSelector(selectCurrentUser);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    if (isLoading) return <FullScreenLoader />;

    if (error || !booking) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-2xl font-bold text-[#04162E] mb-4">Booking not found</h2>
                <button onClick={() => navigate('/bookings')} className="text-[#C5A059] hover:underline flex items-center">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Bookings
                </button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync({ id: bookingId, data: { reason: cancelReason } });
            setShowCancelModal(false);
        } catch (err) {
            // Error handled by mutation
            console.error(err);
        }
    };

    const handlePayNow = async () => {
        setIsProcessingPayment(true);
        try {
            const idempotencyKey = `booking-${bookingId}-${Date.now()}`;
            const paymentResponse = await createPaymentMutation.mutateAsync({
                bookingId,
                config: { headers: { 'Idempotency-Key': idempotencyKey } }
            });

            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error('Failed to load Razorpay SDK');
                setIsProcessingPayment(false);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: paymentResponse.order.amount,
                currency: paymentResponse.order.currency,
                name: "Hotel Management System",
                description: `Payment for Booking ${booking.id}`,
                order_id: paymentResponse.order.id,
                handler: function () {
                    toast.success('Payment successful! Your booking is now confirmed.');
                    navigate(0); // Refresh the page
                },
                prefill: {
                    name: `${user?.firstName} ${user?.lastName}`,
                    email: user?.email,
                    contact: user?.phoneNumber
                },
                theme: {
                    color: "#04162E"
                }
            };

            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function () {
                toast.error('Payment failed. You can try again.');
                setIsProcessingPayment(false);
            });

            rzp.open();
        } catch (err) {
            setIsProcessingPayment(false);
            console.error(err);
        }
    };

    const canCancel = booking.status === 'pending' && booking.paymentStatus === 'none';
    const canPay = booking.status === 'pending' && booking.paymentStatus === 'none';

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <button onClick={() => navigate(ROUTES.USER.BOOKINGS)} className="text-[#717378] hover:text-[#C5A059] flex items-center mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Bookings
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-[#EEEEEE] flex flex-col md:flex-row justify-between items-start md:items-center bg-[#FBF9FB]">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-serif font-bold text-[#04162E]">Booking #{booking.id.slice(-8).toUpperCase()}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div>
                        <p className="text-sm text-[#717378]">Placed on {format(new Date(booking.createdAt), 'MMMM dd, yyyy h:mm a')}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right">
                        <p className="text-sm text-[#717378] mb-1">Total Amount</p>
                        <p className="text-3xl font-bold text-[#C5A059]">₹{booking.totalPrice}</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#04162E] mb-4 flex items-center border-b border-[#EEEEEE] pb-2">
                                <Building className="w-5 h-5 mr-2 text-[#C5A059]" /> Hotel Details
                            </h3>
                            <div className="flex items-start">
                                {booking.hotelId?.images?.[0] && (
                                    <img src={booking.hotelId.images[0]} alt="Hotel" className="w-16 h-16 rounded-lg object-cover mr-4" />
                                )}
                                <div>
                                    <p className="font-bold text-[#1A2B44] text-lg capitalize">{booking.hotelId?.hotelName}</p>
                                    <p className="text-[#717378] text-sm flex items-start mt-1">
                                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                                        <span>{booking.hotelId?.address?.street}, {booking.hotelId?.address?.city}, {booking.hotelId?.address?.state}, {booking.hotelId?.address?.country}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#04162E] mb-4 flex items-center border-b border-[#EEEEEE] pb-2">
                                <Calendar className="w-5 h-5 mr-2 text-[#C5A059]" /> Stay Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-[#F8F6F2] p-4 rounded-xl">
                                <div>
                                    <p className="text-xs text-[#717378] uppercase font-semibold mb-1">Check-in</p>
                                    <p className="font-medium text-[#1A2B44]">{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                                    <p className="text-xs text-[#717378] mt-1">From 2:00 PM</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#717378] uppercase font-semibold mb-1">Check-out</p>
                                    <p className="font-medium text-[#1A2B44]">{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                                    <p className="text-xs text-[#717378] mt-1">Until 11:00 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#04162E] mb-4 flex items-center border-b border-[#EEEEEE] pb-2">
                                <Users className="w-5 h-5 mr-2 text-[#C5A059]" /> Room & Guests
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex justify-between items-center">
                                    <span className="text-[#717378]">Room Type</span>
                                    <span className="font-medium text-[#1A2B44] capitalize">{booking.roomType}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-[#717378]">Number of Rooms</span>
                                    <span className="font-medium text-[#1A2B44]">{booking.quantity}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-[#717378]">Guests</span>
                                    <span className="font-medium text-[#1A2B44]">{booking.numberOfGuests} Guests</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#04162E] mb-4 flex items-center border-b border-[#EEEEEE] pb-2">
                                <CreditCard className="w-5 h-5 mr-2 text-[#C5A059]" /> Payment Details
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex justify-between items-center">
                                    <span className="text-[#717378]">Price per night</span>
                                    <span className="font-medium text-[#1A2B44]">₹{booking.pricePerNight}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-[#717378]">Payment Status</span>
                                    <span className="font-medium text-[#1A2B44] capitalize">{booking.paymentStatus}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                {(canCancel || canPay) && (
                    <div className="p-6 md:p-8 bg-[#FBF9FB] border-t border-[#EEEEEE] flex flex-col sm:flex-row justify-end gap-4">
                        {canCancel && (
                            <button 
                                onClick={() => setShowCancelModal(true)}
                                className="px-6 py-2.5 text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded-lg font-medium transition-colors"
                            >
                                Cancel Booking
                            </button>
                        )}
                        {canPay && (
                            <button 
                                onClick={handlePayNow}
                                disabled={isProcessingPayment}
                                className="px-8 py-2.5 bg-[#C5A059] text-white rounded-lg font-medium hover:bg-[#B38D4A] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
                            >
                                {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Cancel Booking"
                actions={
                    <>
                        <button 
                            onClick={() => setShowCancelModal(false)}
                            className="px-4 py-2 text-[#717378] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={handleCancel}
                            disabled={cancelMutation.isPending}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-70 ml-2"
                        >
                            {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-start text-yellow-800 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">Are you sure you want to cancel this booking? This action cannot be undone.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Reason for cancellation (optional)</label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 h-24 resize-none"
                            placeholder="Tell us why you're cancelling..."
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
