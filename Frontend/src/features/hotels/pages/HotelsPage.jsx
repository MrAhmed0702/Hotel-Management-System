import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hotelApi } from "../api/hotelApi";
import FullScreenLoader from "../../../components/ui/FullScreenLoader";
import FiltersSidebar from "../components/FiltersSidebar";
import { keepPreviousData } from "@tanstack/react-query";

const HotelsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = Object.fromEntries([...searchParams]);
  const page = Number(filters.page) || 1;

  // ✅ CLEAN MERGE
  const { category, search, ...rest } = filters;

  const finalFilters = {
    ...rest,
    search,
    category,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hotels", finalFilters],
    queryFn: () =>
      hotelApi.getAllHotels({
        ...finalFilters,
        page,
        limit: 6,
      }),
    placeholderData: keepPreviousData,
  });

  const hotels = data?.data || [];
  const totalPages = data?.totalPages || 1;

  console.log(hotels);

  const updatePage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage);
    setSearchParams(params);
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
      <FiltersSidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">Search Results</h1>

        <p className="text-sm text-gray-500 mb-4">
          Showing {data?.total} results
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="bg-white shadow rounded-xl">
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

        {/* PAGINATION */}
        <div className="flex justify-center mt-8 gap-2">
          <button
            disabled={page === 1}
            onClick={() => updatePage(page - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

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

          <button
            disabled={page === totalPages}
            onClick={() => updatePage(page + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
