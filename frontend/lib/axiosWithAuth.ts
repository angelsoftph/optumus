import axios from "axios";
import { refreshAccessToken } from "./helpers/refreshAccessToken";

const axiosWithAuth = axios.create();

axiosWithAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("optlib_auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosWithAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh")
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (!newToken) {
        localStorage.removeItem("optlib_auth_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosWithAuth(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default axiosWithAuth;
