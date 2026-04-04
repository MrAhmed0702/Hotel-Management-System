import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      text: "The attention to detail in their curation is unmatched. Every stay feels like a lived-in masterpiece of design.",
      name: "Julianne V.",
      role: "Architect",
    },
    {
      text: "The 24/7 concierge handled our private boat transfer effortlessly. LuxeStay is the only platform we trust.",
      name: "Marcus T.",
      role: "Tech Founder",
    },
    {
      text: "Searching for a villa that fits a whole family can be stressful, but LuxeStay’s verification made it simple.",
      name: "Sarah G.",
      role: "Editor",
    },
  ];

  return (
    <section className="py-20 bg-[#f8f6f2]">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h2 className="text-center text-3xl md:text-4xl font-serif text-[#04162e] mb-16">
          Voices of the Collection
        </h2>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="relative bg-white p-8 rounded-lg border border-[#eee] hover:shadow-md transition duration-300"
            >
              {/* STARS */}
              <div className="text-[#C5A059] mb-4 text-sm">
                {"★★★★★"}
              </div>

              {/* QUOTE ICON */}
              <div className="absolute top-6 right-6 text-[#e5e5e5] text-4xl">
                “
              </div>

              {/* TEXT */}
              <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">
                "{item.text}"
              </p>

              {/* AUTHOR */}
              <p className="text-xs tracking-wide text-[#04162e] uppercase">
                {item.name} — {item.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;