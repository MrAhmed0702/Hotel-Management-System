import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Search } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // Auto focus when search opens
  useEffect(() => {
    if (showSearch) {
      inputRef.current?.focus();
    }
  }, [showSearch]);

  return (
    <div className="w-full h-16 flex items-center justify-between px-8 bg-[#FBF9FB] text-[#1A2B44] border-b border-gray-200">
      {/* LEFT */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="logo" className="h-10" />
        <h2 className="text-xl font-semibold tracking-wide">LuxeStay</h2>
      </div>

      {/* CENTER */}
      <div className="flex items-center gap-8 text-sm tracking-widest">
        {["HOME"].map((item) => (
          <NavLink
            key={item}
            to="/"
            className={({ isActive }) =>
              `relative pb-1 ${
                isActive
                  ? "after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] after:bg-[#C5A059]"
                  : "hover:after:absolute hover:after:left-0 hover:after:bottom-0 hover:after:w-full hover:after:h-[1px] hover:after:bg-[#C5A059]"
              }`
            }
          >
            {item}
          </NavLink>
        ))}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative flex items-center">
          <Search
            size={18}
            onClick={() => setShowSearch((prev) => !prev)}
            className="cursor-pointer text-gray-500 hover:text-[#C5A059]"
          />

          {showSearch && (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="ml-3 px-3 py-1 border-b border-gray-400 focus:outline-none bg-transparent"
            />
          )}
        </div>

        {/* User */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">Ahmed Mochi</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <NavLink
              to="/login"
              className="text-sm font-medium hover:text-[#C5A059]"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="text-sm font-medium hover:text-[#C5A059]"
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
