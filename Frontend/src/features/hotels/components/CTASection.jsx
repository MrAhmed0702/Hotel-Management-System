import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png"

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#04162e] text-white py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* HEADLINE */}
        <h2 className="text-3xl md:text-4xl font-serif mb-8">
          Start your journey today
        </h2>

        {/* CTA BUTTON */}
        <button
          onClick={() => navigate("/hotels")}
          className="bg-[#C5A059] text-[#04162e] px-8 py-3 text-sm tracking-widest font-medium hover:bg-[#b8954d] transition shadow-md"
        >
          SEARCH HOTELS
        </button>

        {/* FOOTER LINKS */}
        <div className="mt-16 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-6">
          
          {/* LOGO */}
          <div className="flex items-center">
            <img 
              src={logo}
              alt="LuxeStay logo"
              className="w-40 h-40 "
            />
            <p className="text-white font-serif text-2xl">LuxeStay</p>
          </div>

          {/* LINKS */}
          <div className="flex gap-6">
            <a href="#" className="hover:text-white cursor-pointer">Privacy Policy</a>
            <a href="#" className="hover:text-white cursor-pointer">Terms of Service</a>
            <a href="#" className="hover:text-white cursor-pointer">Sustainability</a>
            <a href="#" className="hover:text-white cursor-pointer">Press Kit</a>
          </div>

          {/* COPYRIGHT */}
          <p className="text-xs">
            © 2026 LuxeStay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CTASection;