import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSelectors';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { 
  LayoutDashboard, 
  UserCircle, 
  CalendarDays, 
  CreditCard,
  Hotel,
  PlusSquare,
  Users,
  CheckSquare
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ isOpen, setIsOpen }) {
  const user = useSelector(selectCurrentUser);
  const role = user?.role || ROLES.USER;

  const links = {
    [ROLES.USER]: [
      { name: 'Profile', path: ROUTES.USER.PROFILE, icon: UserCircle },
      { name: 'My Bookings', path: ROUTES.USER.BOOKINGS, icon: CalendarDays },
      { name: 'Payment History', path: ROUTES.USER.PAYMENT_HISTORY, icon: CreditCard },
    ],
    [ROLES.OWNER]: [
      { name: 'Overview', path: ROUTES.OWNER.OVERVIEW, icon: LayoutDashboard },
      { name: 'My Hotels', path: ROUTES.OWNER.MY_HOTELS, icon: Hotel },
      { name: 'Add Hotel', path: ROUTES.OWNER.ADD_HOTEL, icon: PlusSquare },
      { name: 'Bookings', path: ROUTES.OWNER.BOOKINGS, icon: CalendarDays },
      { name: 'Profile', path: ROUTES.OWNER.PROFILE, icon: UserCircle },
    ],
    [ROLES.ADMIN]: [
      { name: 'Analytics', path: ROUTES.ADMIN.ANALYTICS, icon: LayoutDashboard },
      { name: 'Users', path: ROUTES.ADMIN.USERS, icon: Users },
      { name: 'Hotels', path: ROUTES.ADMIN.HOTELS, icon: Hotel },
      { name: 'Pending Approvals', path: ROUTES.ADMIN.PENDING_APPROVALS, icon: CheckSquare },
      { name: 'Bookings', path: ROUTES.ADMIN.BOOKINGS, icon: CalendarDays },
      { name: 'Profile', path: ROUTES.ADMIN.PROFILE, icon: UserCircle },
    ]
  };

  const navLinks = links[role] || links[ROLES.USER];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EEEEEE] transform transition-transform duration-200 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-center h-16 border-b border-[#EEEEEE] px-4">
          <NavLink to={ROUTES.HOME} className="text-2xl font-bold text-[#04162E] font-serif">LuxeStay</NavLink>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => clsx(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-[#04162E] text-white" 
                        : "text-[#717378] hover:bg-[#F8F6F2] hover:text-[#04162E]"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {link.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
