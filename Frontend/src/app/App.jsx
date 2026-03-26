import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../features/auth/authSlice";
import { authApi } from "../features/auth/api/authApi";
import AppRoutes from "./routes";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(logout());
        return;
      }

      try {
        const res = await authApi.getMe();

        dispatch(
          loginSuccess({
            user: res.data,
            token,
          })
        );
      } catch (error) {
        console.error("Auth restore failed:", error);

        // token invalid → remove it
        dispatch(logout());
      }
    };

    initAuth();
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;