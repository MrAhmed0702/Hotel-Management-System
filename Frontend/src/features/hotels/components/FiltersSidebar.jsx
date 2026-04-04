import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const AMENITIES = ["wifi", "pool", "spa"];

const FiltersSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries([...searchParams]);

  // 🔥 LOCAL STATE (SINGLE SOURCE OF UI TRUTH)
  const [localFilters, setLocalFilters] = useState({
    city: "",
    country: "",
    amenities: [],
  });

  // 🔁 SYNC URL → LOCAL (IMPORTANT FOR REFRESH / BACK BUTTON)
  useEffect(() => {
    setLocalFilters({
      city: filters.city || "",
      country: filters.country || "",
      amenities: filters.amenities
        ? filters.amenities.split(",")
        : [],
    });
  }, [searchParams]);

  // 🔥 INPUT CHANGE
  const handleInputChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 🔥 AMENITY CHANGE (LOCAL ONLY)
  const handleAmenityChange = (value, checked) => {
    setLocalFilters((prev) => {
      let updated = [...prev.amenities];

      if (checked) updated.push(value);
      else updated = updated.filter((item) => item !== value);

      return { ...prev, amenities: updated };
    });
  };

  // 🔥 APPLY FILTERS (ONLY HERE URL CHANGES)
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (localFilters.city.trim())
      params.set("city", localFilters.city);

    if (localFilters.country.trim())
      params.set("country", localFilters.country);

    if (localFilters.amenities.length)
      params.set("amenities", localFilters.amenities.join(","));

    params.set("page", 1);

    setSearchParams(params);
  };

  // 🔥 CLEAR FILTERS
  const clearFilters = () => {
    setLocalFilters({
      city: "",
      country: "",
      amenities: [],
    });

    setSearchParams({});
  };

  return (
    <div className="w-72 p-5 border-r bg-white">
      <h2 className="text-lg font-semibold mb-5">Filters</h2>

      {/* CITY */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">City</label>
        <input
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter city"
          value={localFilters.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
        />
      </div>

      {/* COUNTRY */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">Country</label>
        <input
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter country"
          value={localFilters.country}
          onChange={(e) => handleInputChange("country", e.target.value)}
        />
      </div>

      {/* AMENITIES */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 block mb-2">
          Amenities
        </label>

        <div className="space-y-2">
          {AMENITIES.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localFilters.amenities.includes(item)}
                onChange={(e) =>
                  handleAmenityChange(item, e.target.checked)
                }
              />
              {item.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-2">
        <button
          onClick={applyFilters}
          className="bg-[#04162e] text-white py-2 rounded-md hover:bg-[#0b2545]"
        >
          Apply Filters
        </button>

        <button
          onClick={clearFilters}
          className="border py-2 rounded-md hover:bg-gray-100"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersSidebar;