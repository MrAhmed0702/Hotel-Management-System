import { useState } from 'react';
import { useOwnerHotels, useDeleteHotel } from '../api/useOwnerHotelQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../../../components/ui/Pagination';
import { Plus, Edit, Trash2, MapPin, Eye } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { ROUTES } from '../../../constants/routes';

export default function OwnerHotelsPage() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, isLoading, error } = useOwnerHotels({ page, limit });
    const deleteMutation = useDeleteHotel();
    const navigate = useNavigate();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);

    if (isLoading) return <FullScreenLoader />;

    if (error) {
        return <div className="text-center text-red-500 py-10">Failed to load your hotels.</div>;
    }

    const { allHotels: hotels = [], totalPages = 1 } = data || {};

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">Active</span>;
            case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase">Pending</span>;
            case 'suspended': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase">Suspended</span>;
            case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase">Rejected</span>;
            case 'inactive': return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full uppercase">Inactive</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full uppercase">{status}</span>;
        }
    };

    const handleDelete = async () => {
        if (!selectedHotel) return;
        try {
            await deleteMutation.mutateAsync(selectedHotel._id);
            setDeleteModalOpen(false);
            setSelectedHotel(null);
            if (hotels.length === 1 && page > 1) {
                setPage(page - 1);
            }
        } catch (err) {
            // Handled in mutation
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">My Hotels</h1>
                    <p className="text-[#717378]">Manage your hotel listings and their details.</p>
                </div>
                <Link 
                    to={ROUTES.OWNER.ADD_HOTEL}
                    className="px-5 py-2.5 bg-[#C5A059] text-white rounded-lg font-medium hover:bg-[#B38D4A] transition-colors flex items-center shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Hotel
                </Link>
            </div>

            {hotels.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-12 text-center">
                    <div className="w-16 h-16 bg-[#F8F6F2] text-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#04162E] mb-2">No Hotels Found</h3>
                    <p className="text-[#717378] mb-6">You haven't added any hotels to your portfolio yet.</p>
                    <Link 
                        to={ROUTES.OWNER.ADD_HOTEL}
                        className="px-6 py-2 border border-[#C5A059] text-[#C5A059] rounded-lg font-medium hover:bg-[#F8F6F2] transition-colors inline-block"
                    >
                        Create your first hotel
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FBF9FB] border-b border-[#EEEEEE] text-[#1A2B44] text-sm font-semibold uppercase tracking-wider">
                                        <th className="p-4 w-16">Image</th>
                                        <th className="p-4">Hotel Name</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Rooms</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEEEEE]">
                                    {hotels.map((hotel) => (
                                        <tr key={hotel._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                {hotel.images && hotel.images.length > 0 ? (
                                                    <img src={hotel.images[0]} alt={hotel.hotelName} className="w-12 h-12 rounded object-cover border border-[#EEEEEE]" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-gray-100 border border-[#EEEEEE] flex items-center justify-center text-xs text-gray-400">None</div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-[#04162E] capitalize">{hotel.hotelName}</div>
                                                <div className="text-xs text-[#717378] mt-0.5">{hotel.category}</div>
                                            </td>
                                            <td className="p-4 text-[#717378] text-sm">
                                                {hotel.address?.city}, {hotel.address?.country}
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(hotel.status)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => navigate(ROUTES.OWNER.ROOMS(hotel._id))}
                                                    className="text-sm font-medium text-[#C5A059] hover:underline"
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        onClick={() => navigate(`/hotels/${hotel._id}`)}
                                                        className="p-1.5 text-gray-500 hover:text-[#C5A059] hover:bg-[#F8F6F2] rounded transition-colors"
                                                        title="View Public Page"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate(ROUTES.OWNER.EDIT_HOTEL(hotel._id))}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit Hotel"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedHotel(hotel);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete Hotel"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
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

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Hotel"
                actions={
                    <>
                        <button 
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 text-[#717378] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-70 ml-2"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    </>
                }
            >
                <div className="text-[#1A2B44]">
                    <p>Are you sure you want to delete <span className="font-bold">"{selectedHotel?.hotelName}"</span>?</p>
                    <p className="text-sm text-red-600 mt-2">This is a soft delete, but the hotel will immediately be hidden from the public and you won't be able to undo this action directly.</p>
                </div>
            </Modal>
        </div>
    );
}
