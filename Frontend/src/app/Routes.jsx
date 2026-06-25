import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import AppInitializer from "./AppInitializer";

import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";

import ProtectedRoute from "../components/common/ProtectedRoute";
import NotFound from "../components/common/NotFound";

import DashboardLayout from "../layouts/DashboardLayout";
import ProfilePage from "../features/auth/pages/ProfilePage";
import { ROUTES } from "../constants/routes";
import { Navigate } from "react-router-dom";

// ... existing imports ...
const HomePage = lazy(() => import("../features/hotels/pages/HomePage"));
const HotelsPage = lazy(() => import("../features/hotels/pages/HotelsPage"));
const HotelDetailsPage = lazy(() => import("../features/hotels/pages/HotelDetailsPage"));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegistrationPage = lazy(() => import("../features/auth/pages/RegistrationPage"));
const UserBookingsPage = lazy(() => import("../features/bookings/pages/UserBookingsPage"));
const UserBookingDetailsPage = lazy(() => import("../features/bookings/pages/UserBookingDetailsPage"));
const OwnerHotelsPage = lazy(() => import("../features/hotels/pages/OwnerHotelsPage"));
const OwnerHotelFormPage = lazy(() => import("../features/hotels/pages/OwnerHotelFormPage"));
const OwnerRoomsPage = lazy(() => import("../features/hotels/pages/OwnerRoomsPage"));
const OwnerBookingsPage = lazy(() => import("../features/bookings/pages/OwnerBookingsPage"));

const AdminAnalyticsPage = lazy(() => import("../features/admin/pages/AdminAnalyticsPage"));
const AdminUsersPage = lazy(() => import("../features/admin/pages/AdminUsersPage"));
const AdminHotelsPage = lazy(() => import("../features/admin/pages/AdminHotelsPage"));
const AdminBookingsPage = lazy(() => import("../features/admin/pages/AdminBookingsPage"));

export const router = createBrowserRouter([
  {
    element: <AppInitializer />,
    errorElement: <NotFound />,
    children: [
      // 🌐 Public routes
      {
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: ROUTES.HOTELS,
            element: <HotelsPage />,
          },
          {
            path: ROUTES.HOTEL_DETAILS(),
            element: <HotelDetailsPage />,
          },
        ],
      },

      // 🔐 Auth routes
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTES.REGISTER,
            element: <RegistrationPage />,
          },
        ],
      },

      // 🔒 Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              // User Routes
              {
                path: ROUTES.USER.DASHBOARD,
                element: <Navigate to={ROUTES.USER.PROFILE} replace />,
              },
              {
                path: ROUTES.USER.PROFILE,
                element: <ProfilePage />,
              },
              {
                path: ROUTES.USER.BOOKINGS,
                element: <UserBookingsPage />,
              },
              {
                path: `${ROUTES.USER.BOOKINGS}/:bookingId`,
                element: <UserBookingDetailsPage />,
              },
              {
                path: ROUTES.USER.PAYMENT_HISTORY,
                element: <div>Payment History</div>, // Placeholder
              },

              // Owner Routes
              {
                path: ROUTES.OWNER.DASHBOARD,
                element: <Navigate to={ROUTES.OWNER.MY_HOTELS} replace />,
              },
              {
                path: ROUTES.OWNER.OVERVIEW,
                element: <Navigate to={ROUTES.OWNER.MY_HOTELS} replace />, // Simple redirect to hotels for now
              },
              {
                path: ROUTES.OWNER.MY_HOTELS,
                element: <OwnerHotelsPage />,
              },
              {
                path: `${ROUTES.OWNER.MY_HOTELS}/new`,
                element: <OwnerHotelFormPage />,
              },
              {
                path: `${ROUTES.OWNER.MY_HOTELS}/:hotelId/edit`,
                element: <OwnerHotelFormPage />,
              },
              {
                path: `${ROUTES.OWNER.MY_HOTELS}/:hotelId/rooms`,
                element: <OwnerRoomsPage />,
              },
              {
                path: ROUTES.OWNER.BOOKINGS,
                element: <OwnerBookingsPage />,
              },
              {
                path: ROUTES.OWNER.PROFILE,
                element: <ProfilePage />,
              },
              
              // Admin Routes
              {
                path: ROUTES.ADMIN.DASHBOARD,
                element: <Navigate to={ROUTES.ADMIN.ANALYTICS} replace />,
              },
              {
                path: ROUTES.ADMIN.ANALYTICS,
                element: <AdminAnalyticsPage />,
              },
              {
                path: ROUTES.ADMIN.USERS,
                element: <AdminUsersPage />,
              },
              {
                path: ROUTES.ADMIN.HOTELS,
                element: <AdminHotelsPage />,
              },
              {
                path: ROUTES.ADMIN.PENDING_APPROVALS,
                element: <Navigate to={ROUTES.ADMIN.HOTELS} replace />,
              },
              {
                path: ROUTES.ADMIN.BOOKINGS,
                element: <AdminBookingsPage />,
              },
              {
                path: ROUTES.ADMIN.PROFILE,
                element: <ProfilePage />,
              },
            ],
          },
        ],
      },

      // ❌ Fallback
      {
        path: "*",
        element: <NotFound />,
      },
    ]
  }
]);