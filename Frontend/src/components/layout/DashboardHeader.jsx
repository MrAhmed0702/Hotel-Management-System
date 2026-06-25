import { Menu, Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSelectors';
import { logout } from '../../features/auth/authSlice';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader({ toggleSidebar }) {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <header className="h-16 bg-white border-b border-[#EEEEEE] flex items-center justify-between px-4 lg:px-8 z-30">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 mr-2 lg:hidden text-[#717378] hover:bg-[#F8F6F2] rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-[#04162E] hidden sm:block font-serif">
          Welcome back, {user?.firstName}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-[#717378] hover:bg-[#F8F6F2] rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none rounded-full ring-2 ring-transparent hover:ring-[#C5A059] transition-all"
          >
            {user?.profilePictureType === 'default' ? (
               <img src={user?.profilePicture} alt="Avatar" className="w-9 h-9 rounded-full bg-gray-100" />
            ) : (
               <img src={user?.profilePicture} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-[#EEEEEE] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#EEEEEE] bg-[#FBF9FB]">
                <p className="text-sm font-semibold text-[#04162E] truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[#717378] truncate mt-0.5">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
