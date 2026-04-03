import React from "react";
import { hotelApi } from "../api/hotelApi";
import { useQuery } from "@tanstack/react-query";
import FullScreenLoader from "../../../components/ui/FullScreenLoader";

const FeaturedHotels = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hotels"],
    queryFn: () => hotelApi.getAllHotels({ limit: 5 }),
  });

  const hotels = data?.data || [];

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <p>Error fetching hotels</p>;
  if (hotels.length === 0) return <p>No hotels found</p>;

  return (
    <>
      <ul>
        {hotels.map((hotel) => (
          <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
            <img src={hotel.images?.[0]} className="h-48 w-full object-cover" />

            <div className="p-4">
              <h3 className="font-semibold text-lg">{hotel.hotelName}</h3>
              <p className="text-sm text-gray-500">{hotel.address.city}</p>
              <p className="text-yellow-500">⭐ {hotel.averageRating}</p>
            </div>
          </div>
        ))}
      </ul>
    </>
  );
};

export default FeaturedHotels;
