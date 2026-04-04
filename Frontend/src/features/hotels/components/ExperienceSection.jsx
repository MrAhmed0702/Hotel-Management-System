import React from "react";
import experienceImg from "../../../assets/HomePage/ExperienceImg.png"

const ExperienceSection = () => {
  return (
    <section
      className="relative h-[100vh] flex items-center justify-center text-center"
      style={{
        backgroundImage: `url(${experienceImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 🔥 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl px-6 text-white">
        
        {/* QUOTE */}
        <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-6">
          “Experience stays, not just rooms”
        </h2>

        {/* SUBTEXT */}
        <p className="text-sm md:text-base opacity-80 italic">
          The LuxeStay editorial collection defines the new era of high-end travel.
        </p>
      </div>
    </section>
  );
};

export default ExperienceSection;