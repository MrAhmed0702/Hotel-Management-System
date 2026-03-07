import Hotel from "./hotel.model.js";

export const createHotel = async (id, hotelData) => {
    const { hotelName, address } = hotelData;
    
    const hotelExists = await Hotel.findOne({
        hotelName,
        "address.city": address.city,
        isDeleted: false
     });

    if(hotelExists){
        throw new Error("Hotel Already Exists");
    }
    
    const hotel = await Hotel.create({
        ...hotelData,
        createdBy: id
    });

    return hotel;
}