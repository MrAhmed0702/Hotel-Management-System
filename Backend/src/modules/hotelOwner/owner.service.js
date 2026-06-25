import path from "path";
import * as ownerRepo from "./owner.repository.js";
import { ApiError } from "../../utils/apiError.js";
import { deleteImage } from "../../utils/deleteImage.js";
import { escapeRegex } from "../../utils/escapeRegex.js";

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
        const safeSearch = escapeRegex(search);

        filtered.$or = [
            { hotelName: { $regex: safeSearch, $options: "i" } },
            { "address.street": { $regex: safeSearch, $options: "i" } },
            { "address.city": { $regex: safeSearch, $options: "i" } },
            { "address.state": { $regex: safeSearch, $options: "i" } },
            { "address.zipCode": { $regex: safeSearch, $options: "i" } },
            { "address.country": { $regex: safeSearch, $options: "i" } },
            { category: search.toLowerCase() }
        ];
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

export const updateHotelService = async (
    hotel,
    hotelData,
    deletedImages = [],
    newImages = []
) => {

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
        "category"
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

export const deleteHotelService = async (hotel) => {

    if (!hotel) {
        throw new ApiError(404, "Hotel Not found");
    }

    hotel.isDeleted = true;
    hotel.deletedAt = new Date();
    hotel.status = "inactive";

    await hotel.save();

    return hotel;
}

export const createRoomService = async (hotel, roomData) => {

    if (!hotel) {
        throw new ApiError(404, "Hotel not found or you do not have permission");
    }

    try {
        const room = await ownerRepo.createRoom({
            ...roomData,
            hotelId: hotel._id,
        });

        return room;
    } catch (err) {
        if (err.code === 11000) {
            throw new ApiError(400, "Room number already exists for this hotel");
        }
        throw err;
    }
};

export const updateRoomService = async (room, roomUpdatedData, imagesToDelete = [], newImages = []) => {

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const allowedUpdates = ["type", "price", "capacity", "description", "amenities", "operationalStatus"];

    const filteredData = Object.fromEntries(
        Object.entries(roomUpdatedData).filter(([key]) => allowedUpdates.includes(key))
    );

    const currentImages = room.images || [];
    const updatedImages = currentImages
        .filter(img => !imagesToDelete.includes(img))
        .concat(newImages);

    filteredData.images = updatedImages;

    Object.assign(room, filteredData);

    await room.save();

    const deletedFilePaths = imagesToDelete.map(
        imageUrl => {
            const fileName = path.basename(imageUrl);
            return path.join(
                process.cwd(),
                "uploads",
                "hotels",
                fileName
            );
        }
    );

    await deleteImage(deletedFilePaths);

    return room;
};

export const deleteRoomService = async (room) => {

    if (!room) {
        throw new ApiError(404, "Room not found or you do not have permission");
    }

    room.isDeleted = true;
    room.deletedAt = new Date();
    room.operationalStatus = "inactive";

    await room.save();

    return room;
};

export const getOwnerBookingsService = async (ownerId, querys) => {
    const { status, page, limit } = querys;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const query = {}

    if(status) query.status = status;

    const { allBookings, totalBookings } = await ownerRepo.getBookings(ownerId, query, skip, limitNumber);

    const totalPages = Math.max(1, Math.ceil(totalBookings / limitNumber));

    return {
        allBookings,
        totalBookings,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
        hasData: totalBookings > 0
    }
}