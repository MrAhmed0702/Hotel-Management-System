import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,

    (error) => {
        if(error.response) {
            const { status } = error.response;
            const requestUrl = error.config?.url || "";
            const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

            if (status === 401 && !isAuthRequest) {
                console.error("Unauthorized - redirect to login");
                localStorage.removeItem("token");
                window.location.href = "/login";
            }

            if (status === 500) {
                console.error("Server error");
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient