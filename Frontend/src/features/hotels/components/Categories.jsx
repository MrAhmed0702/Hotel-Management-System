import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get("category");

  const categories = [
    { label: "Luxury", value: "luxury" },
    { label: "Budget", value: "budget" },
    { label: "Villas", value: "villas" },
    { label: "Business", value: "business" },
    { label: "Family", value: "family" },
  ];

  const handleCategoryClick = (value) => {
    navigate(`hotels?category=${value}&page=1`);
  };

  return (
    <div className="w-full py-6 bg-[#f8f6f2] flex items-center justify-center gap-3 px-4">
      {categories.map((category) => (
        <button
          key={category.value}
          className={`px-5 py-1.5 rounded-full uppercase tracking-wide text-xs font-normal transition duration-200 ease-out cursor-pointer border focus:outline-none focus:ring-2 focus:ring-[#C5A059] active:scale-95 ${
            selected === category.value
              ? "bg-[#04162e] text-white border-[#04162e] shadow-[0_4px_12px_rgba(4,22,46,0.25)]"
              : "bg-white text-[#717378] border-[#e5e5e5] hover:bg-[#f0ede7] hover:text-[#04162e] hover:shadow-sm"
          }`}
          onClick={() => handleCategoryClick(category.value)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default Categories;
