import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, Outlet } from "react-router-dom";
import { loginSuccess, logout } from "../features/auth/authSlice";
import { useAuthQuery } from "../features/auth/api/useAuthQuery";
import Navbar from "../components/layout/Navbar";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const { data, isSuccess, isLoading, isError } = useAuthQuery(!!token);

  useEffect(() => {
    if (!token) return;

    if (isSuccess) {
      dispatch(
        loginSuccess({
          user: data.data,
          token,
        }),
      );
    }

    if (isError) {
      dispatch(logout());
    }
  }, [token, isSuccess, isError, data, dispatch]);

  const hideNavbarRoutes = ["/login", "/register"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      {isLoading ? <p>Loading...</p> : <Outlet />}
    </>
  );
}

export default App;