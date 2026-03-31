import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import ProtectedRoute from "../components/common/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import RegistrationPage from "../features/auth/pages/RegistrationPage";
const HomePage = lazy(() => import("../features/hotels/pages/HomePage"));
const HotelsPage = lazy(() => import("../features/hotels/pages/HotelsPage"));
import NotFound from "../components/common/NotFound";
import App from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 🌐 PUBLIC ROUTES
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "hotels",
        element: <HotelsPage />,
      },

      // 🔐 AUTH ROUTES (NO NAVBAR)
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegistrationPage />,
      },

      // 🔒 PROTECTED ROUTES
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "bookings",
            element: <div>My Bookings</div>,
          },
        ],
      },

      // ❌ 404
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
