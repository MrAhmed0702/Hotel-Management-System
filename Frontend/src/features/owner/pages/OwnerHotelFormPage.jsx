import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateHotel, useUpdateHotel, useOwnerHotelById } from '../api/useOwnerHotelQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import FormInput from '../../../components/ui/FormInput';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';

export default function OwnerHotelFormPage() {
    const { hotelId } = useParams();
    const isEditMode = !!hotelId;
    const navigate = useNavigate();

    const { data: hotel, isLoading: isHotelLoading } = useOwnerHotelById(hotelId);
    const createMutation = useCreateHotel();
    const updateMutation = useUpdateHotel();

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            hotelName: '',
            description: '',
            category: 'luxury',
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            amenities: '',
        }
    });

    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);   // File[]
    const [previewUrls, setPreviewUrls] = useState([]);       // object URLs

    useEffect(() => {
        if (isEditMode && hotel) {
            reset({
                hotelName: hotel.hotelName,
                description: hotel.description,
                category: hotel.category,
                street: hotel.address?.street,
                city: hotel.address?.city,
                state: hotel.address?.state,
                country: hotel.address?.country,
                zipCode: hotel.address?.zipCode,
                amenities: hotel.amenities ? hotel.amenities.join(', ') : '',
            });
            if (hotel.images) {
                setExistingImages(hotel.images);
            }
        }
    }, [isEditMode, hotel, reset]);

    // Cleanup preview object URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isEditMode && isHotelLoading) return <FullScreenLoader />;

    const handleRemoveExistingImage = (imgUrl) => {
        setExistingImages(prev => prev.filter(url => url !== imgUrl));
        setImagesToDelete(prev => [...prev, imgUrl]);
    };

    const handleRemoveNewImage = (index) => {
        URL.revokeObjectURL(previewUrls[index]);
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviews);
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

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            formData.append('hotelName', data.hotelName);
            formData.append('description', data.description);
            formData.append('category', data.category);

            // Address as JSON string — backend parseHotelFormData middleware parses it
            formData.append('address', JSON.stringify({
                street: data.street,
                city: data.city,
                state: data.state,
                country: data.country,
                zipCode: data.zipCode,
            }));

            // Amenities as JSON array string
            const amenitiesArr = data.amenities
                ? data.amenities.split(',').map(a => a.trim()).filter(a => a)
                : [];
            formData.append('amenities', JSON.stringify(amenitiesArr));

            // Append each selected file
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            if (isEditMode) {
                if (imagesToDelete.length > 0) {
                    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
                }
                await updateMutation.mutateAsync({ id: hotelId, data: formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            navigate(ROUTES.OWNER.MY_HOTELS);
        } catch (err) {
            // Errors handled in mutation (toast etc.)
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <button
                onClick={() => navigate(ROUTES.OWNER.MY_HOTELS)}
                className="text-[#717378] hover:text-[#C5A059] flex items-center mb-6 transition-colors"
            >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Hotels
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-[#EEEEEE] bg-[#FBF9FB]">
                    <h1 className="text-2xl font-serif font-bold text-[#04162E]">
                        {isEditMode ? 'Edit Hotel Details' : 'Add New Hotel'}
                    </h1>
                    <p className="text-[#717378] mt-1">Provide comprehensive information to attract more guests.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">

                    {/* Basic Info */}
                    <section>
                        <h3 className="text-lg font-bold text-[#04162E] mb-4 border-b border-[#EEEEEE] pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Hotel Name"
                                {...register('hotelName', { required: 'Hotel name is required' })}
                                error={errors.hotelName}
                            />
                            <div>
                                <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Category</label>
                                <select
                                    {...register('category', { required: 'Required' })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                                >
                                    <option value="luxury">Luxury</option>
                                    <option value="budget">Budget</option>
                                    <option value="business">Business</option>
                                    <option value="family">Family</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Description</label>
                                <textarea
                                    {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters required' } })}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-500' : 'border-[#E5E5E5]'} bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] h-32 resize-none`}
                                    placeholder="Tell guests what makes your hotel unique..."
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Location */}
                    <section>
                        <h3 className="text-lg font-bold text-[#04162E] mb-4 border-b border-[#EEEEEE] pb-2">Location Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Street Address"
                                    {...register('street', { required: 'Street is required' })}
                                    error={errors.street}
                                />
                            </div>
                            <FormInput
                                label="City"
                                {...register('city', { required: 'City is required' })}
                                error={errors.city}
                            />
                            <FormInput
                                label="State/Province"
                                {...register('state', { required: 'State is required' })}
                                error={errors.state}
                            />
                            <FormInput
                                label="Country"
                                {...register('country', { required: 'Country is required' })}
                                error={errors.country}
                            />
                            <FormInput
                                label="Zip/Postal Code"
                                {...register('zipCode', { required: 'Zip code is required' })}
                                error={errors.zipCode}
                            />
                        </div>
                    </section>

                    {/* Amenities */}
                    <section>
                        <h3 className="text-lg font-bold text-[#04162E] mb-4 border-b border-[#EEEEEE] pb-2">Features &amp; Amenities</h3>
                        <FormInput
                            label="Amenities (comma separated)"
                            placeholder="e.g. Free WiFi, Swimming Pool, Gym, Spa"
                            {...register('amenities')}
                        />
                        <p className="text-xs text-[#717378] mt-2">Separate each amenity with a comma. It will be displayed as a list to guests.</p>
                    </section>

                    {/* Images */}
                    <section>
                        <h3 className="text-lg font-bold text-[#04162E] mb-4 border-b border-[#EEEEEE] pb-2">Photos</h3>

                        {/* Existing images (edit mode) */}
                        {isEditMode && existingImages.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-[#1A2B44] mb-3">Current Images</p>
                                <div className="flex flex-wrap gap-4">
                                    {existingImages.map((imgUrl, idx) => (
                                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#E5E5E5] group">
                                            <img src={imgUrl} alt="Hotel" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(imgUrl)}
                                                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload zone */}
                        <div>
                            <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Upload New Images</label>
                            <label
                                htmlFor="file-upload"
                                className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-[#E5E5E5] border-dashed rounded-xl bg-[#F8F6F2] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                            >
                                <Upload className="h-12 w-12 text-[#C5A059] mb-2" />
                                <p className="text-sm text-[#717378]">
                                    <span className="font-medium text-[#C5A059] hover:text-[#B38D4A]">Upload files</span>
                                    {' '}or drag and drop
                                </p>
                                <p className="text-xs text-[#717378] mt-1">PNG, JPG, WEBP up to 10MB each</p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* New image previews */}
                        {previewUrls.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-[#1A2B44] mb-3">
                                    Selected Images ({previewUrls.length})
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {previewUrls.map((url, idx) => (
                                        <div
                                            key={idx}
                                            className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-[#C5A059] group"
                                        >
                                            <img
                                                src={url}
                                                alt={`Preview ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Submit */}
                    <div className="pt-6 border-t border-[#EEEEEE] flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.OWNER.MY_HOTELS)}
                            className="px-6 py-2.5 text-[#717378] border border-[#E5E5E5] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-8 py-2.5 bg-[#04162E] text-white rounded-lg font-medium hover:bg-[#0B2545] transition-colors disabled:opacity-70 flex items-center shadow-sm"
                        >
                            {isPending ? 'Saving...' : (isEditMode ? 'Update Hotel' : 'Create Hotel')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
