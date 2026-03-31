import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../features/auth/authSlice";
import { useAuthQuery } from "../features/auth/api/useAuthQuery";

export const useAuthRehydrate = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const { data, isSuccess, isError, isLoading } = useAuthQuery(!!token);

  useEffect(() => {
    if (!token) return;
    if (isSuccess) dispatch(loginSuccess({ user: data.data, token }));
    if (isError) dispatch(logout());
  }, [token, isSuccess, isError, data, dispatch]);

  return { isLoading };
};