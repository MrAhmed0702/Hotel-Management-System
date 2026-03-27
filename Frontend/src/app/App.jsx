import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../features/auth/authSlice";
import { Outlet } from "react-router-dom";
import { useAuthQuery } from "../features/auth/api/useAuthQuery";

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const { data, isSuccess, isLoading, isError } = useAuthQuery(!!token);

  if (isLoading) return <p>Loading...</p>;

  useEffect(() => {
    if(!token){
      dispatch(logout());
      return;
    }

    if(isSuccess){
      dispatch(loginSuccess({
        user: data.data,
        token,
      }))
    }

    if(isError){
      dispatch(logout())
    }
  }, [token, isSuccess, isError, data, dispatch]);

  return <Outlet />;
}

export default App;