import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { useCreateBooking } from '../api/useBookingQuery';
import { useCreatePayment, useVerifyPayment } from '../../payments/api/usePaymentQuery';
import { loadRazorpay } from '../../../utils/razorpay';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSelectors';
import FormInput from '../../../components/ui/FormInput';
import { getIdempotencyKey, clearIdempotencyKey } from '../../../utils/idempotencyKey';
import { ROUTES } from "../../../constants/routes"

export default function BookingModal({ isOpen, onClose, room, hotelId }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            quantity: 1,
            numberOfGuests: 1,
        }
    });

    const createBookingMutation = useCreateBooking();
    const createPaymentMutation = useCreatePayment();
    const verifyPaymentMutation = useVerifyPayment();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);

    const [isProcessing, setIsProcessing] = useState(false);

    const checkInDate = watch('checkIn');
    const checkOutDate = watch('checkOut');
    const quantity = watch('quantity');

    // Calculate total price preview
    const getDaysDifference = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const nights = getDaysDifference(checkInDate, checkOutDate);
    const totalPricePreview = room ? nights * room.price * (quantity || 1) : 0;

    const onSubmit = async (data) => {
        if (nights <= 0) {
            toast.error('Check-out date must be after check-in date');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Booking
            const bookingPayload = {
                roomType: room.type,
                quantity: Number(data.quantity),
                checkIn: new Date(data.checkIn).toISOString(),
                checkOut: new Date(data.checkOut).toISOString(),
                numberOfGuests: Number(data.numberOfGuests),
            };

            const bookingResponse = await createBookingMutation.mutateAsync({ hotelId, data: bookingPayload });
            const bookingId = bookingResponse.id;

            // 2. Create Payment & Razorpay Order
            const idempotencyKey = getIdempotencyKey("payment", bookingId);
            const paymentResponse = await createPaymentMutation.mutateAsync({
                bookingId,
                config: { headers: { 'Idempotency-Key': idempotencyKey } }
            });

            // 3. Load Razorpay
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                clearIdempotencyKey("payment", bookingId);
                toast.error('Failed to load Razorpay SDK');
                setIsProcessing(false);
                return;
            }

            // 4. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: paymentResponse.order.amount,
                currency: paymentResponse.order.currency,
                name: "Hotel Management System",
                description: `Booking for ${room.type} room`,
                order_id: paymentResponse.order.id,
                handler: async function (response) {
                    try {
                        await verifyPaymentMutation.mutateAsync({
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        setIsProcessing(false);
                        clearIdempotencyKey("payment", bookingId);
                        toast.success('Payment successful! Booking confirmed.');
                        onClose();
                        navigate(ROUTES.USER.BOOKINGS);
                    } catch (err) {
                        toast.error('Payment verification failed. Please try verifying on your bookings page.');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: `${user?.firstName} ${user?.lastName}`,
                    email: user?.email,
                    contact: user?.phoneNumber
                },
                theme: {
                    color: "#04162E"
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        toast.error("Payment Cancelled");
                        onClose();
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function () {
                setIsProcessing(false);
                toast.error('Payment failed. Please try again from your bookings page.');
                onClose();
                navigate(ROUTES.USER.BOOKINGS);
            });

            rzp.open();

        } catch (error) {
            clearIdempotencyKey("payment", bookingId);
            setIsProcessing(false);
            console.error('Booking flow error:', error);
            // toast error is handled in mutations
        } 
    };

    if (!room) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={!isProcessing ? onClose : undefined} 
            title={`Book ${room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room`}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 min-w-[300px] md:min-w-[400px]">
                
                <div className="bg-[#F8F6F2] p-4 rounded-xl border border-[#E5E5E5] mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[#1A2B44] font-medium">Price per night</span>
                        <span className="text-[#C5A059] font-bold text-lg">₹{room.price}</span>
                    </div>
                    {nights > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-[#E5E5E5]">
                            <span className="text-[#1A2B44] font-medium">Total Price ({nights} nights x {quantity} rooms)</span>
                            <span className="text-[#04162E] font-bold text-xl">₹{totalPricePreview}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormInput 
                        label="Check-in Date" 
                        type="date"
                        {...register('checkIn', { required: 'Required' })} 
                        error={errors.checkIn}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    <FormInput 
                        label="Check-out Date" 
                        type="date"
                        {...register('checkOut', { required: 'Required' })} 
                        error={errors.checkOut}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormInput 
                        label="Number of Guests" 
                        type="number"
                        min="1"
                        max={room.capacity * (quantity || 1)}
                        {...register('numberOfGuests', { 
                            required: 'Required',
                            min: 1,
                            max: room.capacity * (quantity || 1)
                        })} 
                        error={errors.numberOfGuests}
                    />
                    <FormInput 
                        label="Number of Rooms" 
                        type="number"
                        min="1"
                        max="20"
                        {...register('quantity', { 
                            required: 'Required',
                            min: 1,
                            max: 20
                        })} 
                        error={errors.quantity}
                    />
                </div>

                <div className="pt-4 border-t border-[#EEEEEE] flex justify-end space-x-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2 text-[#717378] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isProcessing || nights <= 0}
                        className="px-6 py-2 bg-[#04162E] text-white rounded-lg font-medium hover:bg-[#0B2545] transition-colors disabled:opacity-70 flex items-center"
                    >
                        {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
