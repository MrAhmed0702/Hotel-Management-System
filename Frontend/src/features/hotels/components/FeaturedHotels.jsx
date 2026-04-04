import React from "react";
import { hotelApi } from "../api/hotelApi";
import { useQuery } from "@tanstack/react-query";
import FullScreenLoader from "../../../components/ui/FullScreenLoader";
import { useNavigate } from "react-router-dom";

const FeaturedHotels = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-hotels"],
    queryFn: () => hotelApi.getAllHotels({ limit: 4 }),
  });

  const hotels = data?.data || [];

  const handleSearch = () => {
    navigate(`/hotels`);
  }

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <p>Error fetching hotels</p>;

  return (
    <section className="px-10 py-20 bg-[#f8f6f2]">
      {/* HEADER */}
      <div className="text-center mb-12">
        <p className="text-xs tracking-widest text-[#C5A059] uppercase mb-2">
          Editor’s Picks
        </p>

        <h2 className="text-3xl font-serif text-[#04162e]">
          Featured Stays
        </h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
          >
            {/* IMAGE */}
            <div className="h-52 overflow-hidden">
              <img
                src={hotel.images?.[0]}
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>

            {/* CONTENT */}
            <div className="p-5">
              {/* TITLE */}
              <h3 className="text-lg font-serif text-[#04162e]">
                {hotel.hotelName}
              </h3>

              {/* LOCATION */}
              <p className="text-sm text-gray-500 mb-2 capitalize">
                {hotel.address.city}, {hotel.address.country}
              </p>

              {/* RATING */}
              <div className="text-yellow-500 text-sm mb-3">
                {"★".repeat(Math.round(hotel.averageRating))}
                <span className="text-gray-400 ml-2">
                  ({hotel.averageRating})
                </span>
              </div>

              {/* AMENITIES (SIMPLIFIED) */}
              <div className="flex gap-3 text-gray-400 text-sm mb-4">
                {hotel.amenities?.slice(0, 3).map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-lg font-semibold text-[#04162e]">
                    ${Math.floor(Math.random() * 500 + 500)}
                  </p>
                  <span className="text-xs text-gray-400">/ night</span>
                </div>

                <button className="text-xs tracking-wide text-[#04162e] hover:underline">
                  DETAILS
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <button
          className="border px-6 py-2 text-sm tracking-wide hover:bg-[#04162e] hover:text-white transition"
          onClick={() => handleSearch()}  
        >
          EXPLORE MORE
        </button>
      </div>
    </section>
  );
};

export default FeaturedHotels;