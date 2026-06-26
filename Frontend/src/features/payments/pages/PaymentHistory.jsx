import { useState } from 'react';
import { useGetPayments } from '../api/usePaymentQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import { Link } from 'react-router-dom';
import { CreditCard, IndianRupee, Calendar, Hash, ArrowRight, AlertCircle, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '../../../constants/routes';
import { STATUS } from '../../../constants/status';

const getStatusConfig = (status) => {
    switch (status) {
        case STATUS.PAYMENT.PAID:
            return { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Paid' };
        case STATUS.PAYMENT.PENDING:
            return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
        case STATUS.PAYMENT.FAILED:
            return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' };
        case STATUS.PAYMENT.CANCELLED:
            return { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' };
        case STATUS.PAYMENT.REFUNDED:
            return { color: 'bg-blue-100 text-blue-800', icon: RotateCcw, label: 'Refunded' };
        default:
            return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: status };
    }
};

export default function PaymentHistory() {
    const { data: payments, isLoading, isError, error } = useGetPayments();

    if (isLoading) return <FullScreenLoader />;

    if (isError) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4 opacity-70" />
                    <h3 className="text-xl font-bold text-[#04162E] mb-2">Something went wrong</h3>
                    <p className="text-[#717378]">{error?.message || 'Failed to load payment history.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">Payment History</h1>
                <p className="text-[#717378]">Track all your transactions and payment statuses.</p>
            </div>

            {(!payments || payments.length === 0) ? (
                /* Empty State */
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-12 text-center">
                    <CreditCard className="w-16 h-16 text-[#C5A059] mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-[#04162E] mb-2">No payments yet</h3>
                    <p className="text-[#717378] mb-6">You haven't made any payments. Book a hotel to get started.</p>
                    <Link
                        to={ROUTES.HOTELS}
                        className="px-6 py-2.5 bg-[#C5A059] text-white rounded-lg font-medium hover:bg-[#B38D4A] transition-colors inline-block"
                    >
                        Explore Hotels
                    </Link>
                </div>
            ) : (
                /* Payment Cards */
                <div className="space-y-4">
                    {payments.map((payment) => {
                        const statusConfig = getStatusConfig(payment.status);
                        const StatusIcon = statusConfig.icon;
                        const paymentDate = payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy • hh:mm a') : '—';

                        return (
                            <div
                                key={payment._id || payment.id}
                                className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden transition-shadow hover:shadow-md"
                            >
                                <div className="p-5 md:p-6">
                                    {/* Top row: Amount + Status */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                        <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                            <div className="w-10 h-10 rounded-lg bg-[#F8F6F2] flex items-center justify-center flex-shrink-0">
                                                <IndianRupee className="w-5 h-5 text-[#C5A059]" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-[#04162E]">
                                                    ₹{payment.amount?.toLocaleString('en-IN') || '0'}
                                                </p>
                                                <p className="text-xs text-[#717378] uppercase tracking-wide">{payment.currency || 'INR'}</p>
                                            </div>
                                        </div>

                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${statusConfig.color}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* Detail grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#EEEEEE]">
                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Date
                                            </p>
                                            <p className="font-medium text-[#1A2B44] text-sm">{paymentDate}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1 flex items-center gap-1">
                                                <Hash className="w-3.5 h-3.5" />
                                                Payment ID
                                            </p>
                                            <p className="font-medium text-[#1A2B44] text-sm font-mono truncate" title={payment._id || payment.id}>
                                                {(payment._id || payment.id)?.slice(-10) || '—'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1 flex items-center gap-1">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                Razorpay ID
                                            </p>
                                            <p className="font-medium text-[#1A2B44] text-sm font-mono truncate" title={payment.razorpayPaymentId}>
                                                {payment.razorpayPaymentId?.slice(-12) || '—'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-[#717378] uppercase font-semibold mb-1 flex items-center gap-1">
                                                <Hash className="w-3.5 h-3.5" />
                                                Order ID
                                            </p>
                                            <p className="font-medium text-[#1A2B44] text-sm font-mono truncate" title={payment.razorpayOrderId}>
                                                {payment.razorpayOrderId?.slice(-12) || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer: Booking link */}
                                    {payment.bookingId && (
                                        <div className="flex justify-end border-t border-[#EEEEEE] pt-4 mt-4">
                                            <Link
                                                to={ROUTES.USER.BOOKING_DETAILS(typeof payment.bookingId === 'object' ? payment.bookingId._id : payment.bookingId)}
                                                className="inline-flex items-center gap-1.5 px-5 py-2 border border-[#C5A059] text-[#C5A059] rounded-lg font-medium hover:bg-[#F8F6F2] transition-colors text-sm"
                                            >
                                                View Booking
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}