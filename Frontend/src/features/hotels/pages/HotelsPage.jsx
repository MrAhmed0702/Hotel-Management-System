import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hotelApi } from "../api/hotelApi";
import FullScreenLoader from "../../../components/ui/FullScreenLoader";

const HotelsPage = () => {
  const [searchParams] = useSearchParams();
  const filters = Object.fromEntries([...searchParams]);
  const page = filters.page || 1;

  const {
    data: hotels = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hotels", JSON.stringify(filters)],
    queryFn: () => hotelApi.getAllHotels({ ...filters, page, limit: 6 }),
  });

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <p>Error loading hotels</p>;

  if (!hotels.length) {
    return (
      <div className="text-center py-20">
        <h2>No hotels found</h2>
        <p>Try different filters</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-8">
      <h1 className="text-2xl font-semibold mb-6">Search Results</h1>

      <div className="grid grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
          >
            <img src={hotel.images?.[0]} className="h-48 w-full object-cover" />

            <div className="p-4">
              <h3 className="font-semibold">{hotel.hotelName}</h3>
              <p className="text-sm text-gray-500">
                {hotel.address.city}, {hotel.address.country}
              </p>

              <p className="text-yellow-500 mt-2">⭐ {hotel.averageRating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelsPage;
