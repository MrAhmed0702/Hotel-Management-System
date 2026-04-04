import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Search } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { authApi } from "../../features/auth/api/authApi";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // Auto focus when search opens
  useEffect(() => {
    if (showSearch) {
      inputRef.current?.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (isAuthenticated) {
      authApi
        .getMe()
        .then((res) => {
          setUserData(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
        });
    }
  }, [isAuthenticated]);

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
            {/* USER TEXT */}
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">
                {userData?.firstName} {userData?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {userData?.role?.toUpperCase()}
              </p>
            </div>

            {/* DROPDOWN WRAPPER */}
            <div className="relative" ref={dropdownRef}>
              {/* AVATAR (TRIGGER) */}
              <img
                src={userData?.profilePicture }
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover cursor-pointer border"
                onClick={toggleDropdown}
              />

              {/* DROPDOWN */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-55 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {/* USER HEADER */}
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-medium">
                      {userData?.firstName} {userData?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{userData?.email}</p>
                  </div>

                  {/* OPTIONS */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // navigate("/profile")
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      dispatch(logout());
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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