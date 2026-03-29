import { useQuery } from "@tanstack/react-query";
import { authApi } from "./authApi";

export const useAuthQuery = (enabled) => {
    return useQuery({
        queryKey: ["authUser"],
        queryFn: authApi.getMe,
        enabled,
        retry: false,
    });
};