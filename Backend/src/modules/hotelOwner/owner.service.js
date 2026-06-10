import mongoose from "mongoose";
import path from "path";
import * as ownerRepo from "./owner.repository.js";
import { ApiError } from "../../utils/apiError.js";
import { deleteImage } from "../../utils/deleteImage.js";

export const createHotelService = async (userId, hotelData) => {
    const hotelName = hotelData.hotelName.trim().toLowerCase();
    const city = hotelData.address.city.trim().toLowerCase();

    const existingHotel = await ownerRepo.findOwnerHotelByNameAndCity(hotelName, city);

    if (existingHotel) {
        throw new ApiError(409, "Hotel already exists");
    }

    const hotel = await ownerRepo.createHotel({ ...hotelData, owner: userId, status: "pending" });
    return hotel;
}

export const getMyHotelsService = async (userId, query) => {
    const { page = 1, limit = 10, search } = query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));

    const skip = (pageNumber - 1) * limitNumber;

    const filtered = {};

    if (search) {
        filtered.$or = [
            { hotelName: { $regex: search, $options: "i" } },
            { "address.street": { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.state": { $regex: search, $options: "i" } },
            { "address.zipCode": { $regex: search, $options: "i" } },
            { "address.country": { $regex: search, $options: "i" } },
            { category: search.toLowerCase() }
        ]
    }

    const { allHotels, totalHotels } = await ownerRepo.getOwnerHotels(userId, filtered, skip, limitNumber);

    const totalPages = Math.max(1, Math.ceil(totalHotels / limitNumber));

    return {
        allHotels,
        totalHotels,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
        hasData: totalHotels > 0
    }
}

export const getHotelByIdService = async (userId, hotelId) => {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError(400, "Invalid Hotel Id")
    }

    const hotel = await ownerRepo.findOwnerHotelById(userId, hotelId);

    if (!hotel) {
        throw new ApiError(404, "Hotel Not found")
    }

    return hotel
}

export const updateHotelService = async (
    userId,
    hotelId,
    hotelData,
    deletedImages = [],
    newImages = []
) => {

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError(400, "Invalid hotel ID");
    }

    const hotel = await ownerRepo.findOwnerHotelById(
        userId,
        hotelId
    );

    if (!hotel) {
        throw new ApiError(
            404,
            "Hotel not found"
        );
    }

    const uploadedFilePaths = newImages.map(imageUrl => {
        const fileName = path.basename(imageUrl);

        return path.join(
            process.cwd(),
            "uploads",
            "hotels",
            fileName
        );
    });

    const hotelName =
        hotelData.hotelName?.trim() ??
        hotel.hotelName;

    const city =
        hotelData.address?.city?.trim().toLowerCase() ??
        hotel.address.city;

    if (
        hotelName !== hotel.hotelName ||
        city !== hotel.address.city
    ) {

        const existingHotel =
            await ownerRepo.findOwnerHotelByNameAndCity(
                hotelName,
                city
            );

        if (
            existingHotel &&
            String(existingHotel._id) !== String(hotel._id)
        ) {

            await deleteImage(
                uploadedFilePaths
            );

            throw new ApiError(
                409,
                "Hotel already exists"
            );
        }
    }

    const imagesToDelete = hotel.images.filter(
        image => deletedImages.includes(image)
    );

    const remainingImages = hotel.images.filter(
        image => !deletedImages.includes(image)
    );

    if (
        remainingImages.length +
        newImages.length >
        10
    ) {

        await deleteImage(
            uploadedFilePaths
        );

        throw new ApiError(
            400,
            "Maximum 10 images allowed"
        );
    }

    hotel.images = [
        ...remainingImages,
        ...newImages
    ];

    const allowedFields = [
        "hotelName",
        "description",
        "address",
        "amenities",
        "category",
        "totalRooms"
    ];

    const filteredData = Object.fromEntries(
        Object.entries(hotelData).filter(
            ([key]) =>
                allowedFields.includes(key)
        )
    );

    if (filteredData.address) {

        hotel.address = {
            ...hotel.address.toObject(),
            ...filteredData.address
        };

        delete filteredData.address;
    }

    Object.assign(
        hotel,
        filteredData
    );

    hotel.status = "pending";
    hotel.approvedBy = null;

    await hotel.save();

    const deletedFilePaths = imagesToDelete.map(
        imageUrl => {

            const fileName =
                path.basename(imageUrl);

            return path.join(
                process.cwd(),
                "uploads",
                "hotels",
                fileName
            );
        }
    );

    await deleteImage(
        deletedFilePaths
    );

    return hotel.toObject();
};

export const deleteHotelService = async (userId, hotelId) => {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError(400, "Invalid Hotel Id")
    }

    const hotel = await ownerRepo.findOwnerHotelById(userId, hotelId);

    if (!hotel) {
        throw new ApiError(404, "Hotel Not found");
    }

    const deletedHotel = await ownerRepo.deleteHotel(hotelId);

    return deletedHotel;
}