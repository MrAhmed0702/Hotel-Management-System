import { useState, useEffect } from 'react';
import { useAdminHotels, useUpdateHotelStatus } from '../api/useAdminQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import Pagination from '../../../components/ui/Pagination';
import Modal from '../../../components/ui/Modal';
import { ShieldAlert, CheckCircle, XCircle, MapPin, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setHotels, updateHotelStatus } from '../adminSlice';
import { STATUS } from '../../../constants/status';
import { ROUTES } from '../../../constants/routes';

export default function AdminHotelsPage() {
    const [page, setPage] = useState(1);
    const limit = 10;

    const dispatch = useDispatch();
    const { data, isLoading, error } = useAdminHotels({ page, limit });
    const updateStatusMutation = useUpdateHotelStatus();

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [statusPayload, setStatusPayload] = useState({ status: '', reason: '' });

    const hotels = useSelector((state) => state.admin.hotels) || [];
    const totalPages = data?.totalPages || 1;

    useEffect(() => {
        if (data?.hotels) {
            dispatch(setHotels(data.hotels));
        }
    }, [data, dispatch]);

    if (isLoading) return <FullScreenLoader />;
    if (error) return <div className="text-center text-red-500 py-10">Failed to load hotels.</div>;

    const openStatusModal = (hotel, newStatus) => {
        setSelectedHotel(hotel);
        setStatusPayload({ status: newStatus, reason: '' });
        setStatusModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await updateStatusMutation.mutateAsync({
                id: selectedHotel._id,
                status: statusPayload.status,
                reason: statusPayload.reason
            });
            // Update immediately in Redux store
            dispatch(updateHotelStatus({ id: selectedHotel._id, status: statusPayload.status }));
            setStatusModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case STATUS.HOTEL.ACTIVE: return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase">Active</span>;
            case STATUS.HOTEL.PENDING: return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>;
            case STATUS.HOTEL.SUSPENDED: return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold uppercase">Suspended</span>;
            case STATUS.HOTEL.REJECTED: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>;
            case STATUS.HOTEL.INACTIVE: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">Inactive</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">Hotel Moderation</h1>
                <p className="text-[#717378]">Review, approve, or suspend hotel listings submitted by owners.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FBF9FB] border-b border-[#EEEEEE] text-[#1A2B44] text-sm font-semibold uppercase tracking-wider">
                                <th className="p-4">Hotel</th>
                                <th className="p-4">Owner</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EEEEEE]">
                            {hotels.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-[#717378]">No hotels found in the system.</td>
                                </tr>
                            ) : (
                                hotels.map(hotel => (
                                    <tr key={hotel._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                {hotel.images && hotel.images.length > 0 ? (
                                                    <img src={hotel.images[0]} alt={hotel.hotelName} className="w-12 h-12 rounded object-cover border border-[#EEEEEE]" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-gray-100 border border-[#EEEEEE] flex items-center justify-center text-xs text-gray-400">None</div>
                                                )}
                                                <div className="ml-3">
                                                    <p className="font-bold text-[#04162E] capitalize">{hotel.hotelName}</p>
                                                    <p className="text-xs text-[#717378] capitalize">{hotel.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-[#1A2B44] font-medium capitalize">{hotel.ownerId?.firstName} {hotel.ownerId?.lastName}</p>
                                            <p className="text-xs text-[#717378]">{hotel.ownerId?.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-sm text-[#717378]">
                                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                                {hotel.address?.city}, {hotel.address?.country}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(hotel.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <a
                                                    href={ROUTES.HOTEL_DETAILS(hotel._id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-gray-500 hover:text-[#C5A059] hover:bg-[#F8F6F2] rounded transition-colors"
                                                    title="View Public Page"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>

                                                {hotel.status === STATUS.HOTEL.PENDING && (
                                                    <>
                                                        <button
                                                            onClick={() => openStatusModal(hotel, STATUS.HOTEL.ACTIVE)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                            title="Approve Hotel"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openStatusModal(hotel, STATUS.HOTEL.REJECTED)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Reject Hotel"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                {(hotel.status === STATUS.HOTEL.ACTIVE || hotel.status === STATUS.HOTEL.INACTIVE) && (
                                                    <button
                                                        onClick={() => openStatusModal(hotel, STATUS.HOTEL.SUSPENDED)}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                                        title="Suspend Hotel"
                                                    >
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {hotel.status === STATUS.HOTEL.SUSPENDED && (
                                                    <button
                                                        onClick={() => openStatusModal(hotel, STATUS.HOTEL.ACTIVE)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="Reinstate Hotel"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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

            {/* Status Update Modal */}
            <Modal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                title={`Confirm Status Change: ${statusPayload.status.toUpperCase()}`}
                actions={
                    <>
                        <button
                            onClick={() => setStatusModalOpen(false)}
                            className="px-4 py-2 text-[#717378] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateStatus}
                            disabled={updateStatusMutation.isPending}
                            className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ml-2 disabled:opacity-70 ${statusPayload.status === STATUS.HOTEL.ACTIVE ? 'bg-green-600 hover:bg-green-700' :
                                    statusPayload.status === STATUS.HOTEL.REJECTED ? 'bg-red-600 hover:bg-red-700' :
                                        'bg-orange-600 hover:bg-orange-700'
                                }`}
                        >
                            {updateStatusMutation.isPending ? 'Updating...' : `Confirm ${statusPayload.status}`}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-[#1A2B44]">
                        You are about to change the status of <span className="font-bold">"{selectedHotel?.hotelName}"</span> to <span className="font-bold capitalize">{statusPayload.status}</span>.
                    </p>

                    {(statusPayload.status === STATUS.HOTEL.REJECTED || statusPayload.status === STATUS.HOTEL.SUSPENDED) && (
                        <div>
                            <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Reason (Required for suspension/rejection)</label>
                            <textarea
                                value={statusPayload.reason}
                                onChange={(e) => setStatusPayload({ ...statusPayload, reason: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] h-24 resize-none"
                                placeholder="Explain why this hotel is being rejected/suspended..."
                            />
                        </div>
                    )}
                </div>
            </Modal>

        </div>
    );
}
