import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHotelRooms } from '../../hotels/api/useHotelQuery';
import { useOwnerHotelById } from '../../owner/api/useOwnerHotelQuery';
import { useCreateRoom, useUpdateRoom, useDeleteRoom } from '../api/useOwnerRoomQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import Modal from '../../../components/ui/Modal';
import FormInput from '../../../components/ui/FormInput';
import { useForm } from 'react-hook-form';
import { ChevronLeft, Plus, Edit, Trash2, Users, Upload, X } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { STATUS } from '../../../constants/status';

export default function OwnerRoomsPage() {
    const { hotelId } = useParams();
    const navigate = useNavigate();

    const { data: hotel, isLoading: isHotelLoading } = useOwnerHotelById(hotelId);
    const { data: rooms, isLoading: isRoomsLoading } = useHotelRooms(hotelId);
    const roomsList = Array.isArray(rooms) ? rooms : (rooms?.rooms || []);
    
    const createMutation = useCreateRoom();
    const updateMutation = useUpdateRoom();
    const deleteMutation = useDeleteRoom();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Image upload states
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            roomNumber: '',
            type: 'single',
            description: '',
            price: '',
            capacity: '',
            amenities: '',
            operationalStatus: STATUS.ROOM.AVAILABLE
        }
    });

    // Cleanup preview object URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isHotelLoading || isRoomsLoading) return <FullScreenLoader />;

    if (!hotel) {
        return <div className="text-center text-red-500 py-10">Hotel not found.</div>;
    }

    const handleOpenCreate = () => {
        setSelectedRoom(null);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setExistingImages([]);
        setImagesToDelete([]);
        reset({
            roomNumber: '',
            type: 'single',
            description: '',
            price: '',
            capacity: '',
            amenities: '',
            operationalStatus: STATUS.ROOM.AVAILABLE
        });
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (room) => {
        setSelectedRoom(room);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setExistingImages(room.images || []);
        setImagesToDelete([]);
        reset({
            roomNumber: room.roomNumber,
            type: room.type,
            description: room.description || '',
            price: room.price,
            capacity: room.capacity,
            amenities: room.amenities ? room.amenities.join(', ') : '',
            operationalStatus: room.operationalStatus
        });
        setIsFormModalOpen(true);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Revoke old previews to avoid memory leaks
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        const newPreviews = files.map(f => URL.createObjectURL(f));
        setSelectedFiles(files);
        setPreviewUrls(newPreviews);
    };

    const handleRemoveExistingImage = (imgUrl) => {
        setExistingImages(prev => prev.filter(url => url !== imgUrl));
        setImagesToDelete(prev => [...prev, imgUrl]);
    };

    const handleRemoveNewImage = (index) => {
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };


    const handleOpenDelete = (room) => {
        setSelectedRoom(room);
        setIsDeleteModalOpen(true);
    };

    const onSubmit = async (formDataValues) => {
        try {
            const formData = new FormData();
            formData.append('roomNumber', formDataValues.roomNumber);
            formData.append('type', formDataValues.type);
            formData.append('price', Number(formDataValues.price));
            formData.append('capacity', Number(formDataValues.capacity));
            formData.append('description', formDataValues.description || '');
            if (formDataValues.operationalStatus) {
                formData.append('operationalStatus', formDataValues.operationalStatus);
            }

            const amenitiesArr = formDataValues.amenities
                ? formDataValues.amenities.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            formData.append('amenities', JSON.stringify(amenitiesArr));

            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            if (selectedRoom) {
                if (imagesToDelete.length > 0) {
                    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
                }
                await updateMutation.mutateAsync({ hotelId, roomId: selectedRoom._id, data: formData });
            } else {
                await createMutation.mutateAsync({ hotelId, data: formData });
            }
            setIsFormModalOpen(false);

            setSelectedFiles([]);
            setPreviewUrls([]);
            setExistingImages([]);
            setImagesToDelete([]);
        } catch (err) {
            // Error handled by mutation
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync({ hotelId, roomId: selectedRoom._id });
            setIsDeleteModalOpen(false);
        } catch (err) {
            // Error handled by mutation
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case STATUS.ROOM.AVAILABLE: return <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold uppercase">Available</span>;
            case STATUS.ROOM.MAINTENANCE: return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold uppercase">Maintenance</span>;
            case STATUS.ROOM.INACTIVE: return <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold uppercase">Inactive</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <button onClick={() => navigate(ROUTES.OWNER.MY_HOTELS)} className="text-[#717378] hover:text-[#C5A059] flex items-center mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Hotels
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[#EEEEEE] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2 capitalize">Manage Rooms</h1>
                    <p className="text-[#717378] text-sm">Hotel: <span className="font-bold text-[#1A2B44] capitalize">{hotel.hotelName}</span></p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="px-5 py-2.5 bg-[#C5A059] text-white rounded-lg font-medium hover:bg-[#B38D4A] transition-colors flex items-center shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Room
                </button>
            </div>

            {!roomsList || roomsList.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-12 text-center">
                    <div className="w-16 h-16 bg-[#F8F6F2] text-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#04162E] mb-2">No Rooms Added</h3>
                    <p className="text-[#717378] mb-6">You haven't added any rooms to this hotel yet.</p>
                    <button 
                        onClick={handleOpenCreate}
                        className="px-6 py-2 border border-[#C5A059] text-[#C5A059] rounded-lg font-medium hover:bg-[#F8F6F2] transition-colors inline-block"
                    >
                        Add your first room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {roomsList.map(room => (
                        <div key={room._id} className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden flex flex-col sm:flex-row">
                            <div className="sm:w-1/3 bg-gray-100 h-40 sm:h-auto border-r border-[#EEEEEE]">
                                {room.images && room.images.length > 0 ? (
                                    <img src={room.images[0]} alt={room.type} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#717378] text-sm bg-[#FBF9FB]">
                                        <span className="text-xs">No Image</span>
                                        <span className="font-bold text-gray-300 text-3xl mt-2">{room.roomNumber}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-[#04162E] capitalize">{room.type}</h3>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold border border-gray-200">#{room.roomNumber}</span>
                                        </div>
                                        <span className="text-lg font-bold text-[#C5A059]">₹{room.price}</span>
                                    </div>
                                    <p className="text-sm text-[#717378] mb-3 line-clamp-2">{room.description}</p>
                                    
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center text-xs text-[#717378]">
                                            <Users className="w-3.5 h-3.5 mr-1" /> {room.capacity} Guests
                                        </div>
                                        <div>
                                            {getStatusBadge(room.operationalStatus)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-[#EEEEEE] pt-3">
                                    <button 
                                        onClick={() => handleOpenEdit(room)}
                                        className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center"
                                    >
                                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleOpenDelete(room)}
                                        className="px-3 py-1.5 text-sm text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded transition-colors flex items-center"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Room Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={selectedRoom ? 'Edit Room' : 'Add New Room'}
            >
                <form id="room-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput 
                            label="Room Number" 
                            {...register('roomNumber', { required: 'Required' })} 
                            error={errors.roomNumber}
                            disabled={!!selectedRoom} // Room number can't be edited
                        />
                        <div>
                            <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Type</label>
                            <select 
                                {...register('type')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                            >
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="suite">Suite</option>
                                <option value="deluxe">Deluxe</option>
                                <option value="family">Family</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput 
                            label="Price per Night (₹)" 
                            type="number"
                            min="0"
                            {...register('price', { required: 'Required', min: 0 })} 
                            error={errors.price}
                        />
                        <FormInput 
                            label="Capacity (Guests)" 
                            type="number"
                            min="1"
                            {...register('capacity', { required: 'Required', min: 1 })} 
                            error={errors.capacity}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Description</label>
                        <textarea
                            {...register('description', {
                                validate: (value) => {
                                    if (!value) return true; // optional
                                    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
                                    return wordCount >= 10 || 'Description must be at least 10 words';
                                }
                            })}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] h-20 resize-none"
                            placeholder="Describe the room..."
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <FormInput 
                        label="Amenities (comma separated)" 
                        {...register('amenities')} 
                    />

                    {/* Image uploads */}
                    <div className="border-t border-[#EEEEEE] pt-4">
                        <label className="block text-sm font-medium text-[#1A2B44] mb-2 font-semibold">Room Photos</label>

                        {/* Existing images */}
                        {selectedRoom && existingImages.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-[#717378] mb-2">Current Images</p>
                                <div className="flex flex-wrap gap-2">
                                    {existingImages.map((imgUrl, idx) => (
                                        <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-[#E5E5E5] group">
                                            <img src={imgUrl} alt="Room" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(imgUrl)}
                                                    className="p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload input zone */}
                        <div>
                            <label
                                htmlFor="room-file-upload"
                                className="flex flex-col items-center justify-center p-4 border border-[#E5E5E5] border-dashed rounded bg-[#F8F6F2] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                            >
                                <Upload className="h-6 w-6 text-[#C5A059] mb-1" />
                                <p className="text-xs text-[#717378]">
                                    <span className="font-semibold text-[#C5A059]">Upload files</span> or drag and drop
                                </p>
                                <input
                                    id="room-file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* Previews for newly selected files */}
                        {previewUrls.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs font-semibold text-[#717378] mb-2">Selected Images ({previewUrls.length})</p>
                                <div className="flex flex-wrap gap-2">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-[#C5A059] group">
                                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    className="p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedRoom && (
                        <div>
                            <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Operational Status</label>
                            <select 
                                {...register('operationalStatus')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                            >
                                <option value={STATUS.ROOM.AVAILABLE}>Available</option>
                                <option value={STATUS.ROOM.MAINTENANCE}>Maintenance</option>
                                <option value={STATUS.ROOM.INACTIVE}>Inactive</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4 border-t border-[#EEEEEE] flex justify-end gap-3 mt-6">
                        <button 
                            type="button"
                            onClick={() => setIsFormModalOpen(false)}
                            className="px-4 py-2 text-[#717378] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="px-6 py-2 bg-[#04162E] text-white rounded-lg font-medium hover:bg-[#0B2545] transition-colors disabled:opacity-70"
                        >
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Room'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Room"
                actions={
                    <>
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
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
                    <p>Are you sure you want to delete Room <span className="font-bold">#{selectedRoom?.roomNumber}</span>?</p>
                    <p className="text-sm text-red-600 mt-2">This action will soft-delete the room. Existing bookings will not be affected, but it will be hidden from new searches.</p>
                </div>
            </Modal>

        </div>
    );
}
