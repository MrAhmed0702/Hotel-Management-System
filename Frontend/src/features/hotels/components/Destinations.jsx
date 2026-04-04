import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { hotelApi } from "../api/hotelApi";
import FullScreenLoader from "../../../components/ui/FullScreenLoader";
import { useNavigate } from "react-router-dom";

const Destinations = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => hotelApi.getAllHotels({ limit: 50 }),
  });

  const hotels = data?.data || [];

  const destinations = useMemo(() => {
    const map = new Map();

    hotels.forEach((hotel) => {
      const city = hotel.address.city;

      if (!map.has(city)) {
        map.set(city, {
          city,
          image: hotel.images?.[0],
          count: 0,
        });
      }

      map.get(city).count++;
    });

    return Array.from(map.values()).slice(0, 4);
  }, [hotels]);

  const handleSearch = (city) => {
    navigate(`/hotels?city=${city}`);
  };

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <p>Error Loading Destinations</p>;

  return (
    <div className="px-10 py-16 bg-[#ffffff]">
      <p className="text-xs tracking-widest text-[#C5A059] uppercase mb-2">
        Curated Escapes
      </p>
      <h2 className="text-3xl font-serif text-[#04162e] mb-10">
        Popular Destinations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((dest) => (
          <div
            key={dest.city}
            onClick={() => handleSearch(dest.city)}
            className="relative h-[320px] rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition duration-300"
          >
            {/* IMAGE */}
            <img
              src={
                dest.image ||
                `https://source.unsplash.com/600x400/?${dest.city}`
              }
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
              alt={dest.city}
              loading="lazy"
            />

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* CONTENT */}
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-serif capitalize leading-tight">
                {dest.city}
              </h3>

              <p className="text-sm opacity-80 mt-1">{dest.count} properties</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
