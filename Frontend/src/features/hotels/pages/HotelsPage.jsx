import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hotelApi } from "../api/hotelApi";
import FullScreenLoader from "../../../components/ui/FullScreenLoader";
import FiltersSidebar from "../components/FiltersSidebar";

const HotelsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries([...searchParams]);
  const page = Number(filters.page) || 1;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hotels", JSON.stringify(filters)],
    queryFn: () => hotelApi.getAllHotels({ ...filters, page, limit: 6 }),
    keepPreviousData: true,
  });

  const hotels = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;

  const updatePage = (newPage) => {
    const updated = {
      ...filters,
      page: newPage,
    };

    setSearchParams(updated);
  };

  const getPages = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      }
    }

    return pages;
  };

  console.log("FULL DATA:", data);

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
    <div className="flex">
      {/* LEFT: FILTERS */}
      <FiltersSidebar />

      {/* RIGHT: RESULTS */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">Search Results</h1>

        <p className="text-sm text-gray-500 mb-4">
          Showing {hotels.length} results
        </p>

        <div className="grid grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white shadow rounded-xl">
              <img
                src={hotel.images?.[0]}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3>{hotel.hotelName}</h3>
                <p>{hotel.address.city}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {/* PREV */}
          <button
            disabled={page === 1}
            onClick={() => updatePage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {/* PAGE NUMBERS */}
          {getPages().map((p) => (
            <button
              key={p}
              onClick={() => updatePage(p)}
              className={`px-3 py-1 border rounded ${
                p === page ? "bg-black text-white" : ""
              }`}
            >
              {p}
            </button>
          ))}

          {/* NEXT */}
          <button
            disabled={page === totalPages}
            onClick={() => updatePage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
