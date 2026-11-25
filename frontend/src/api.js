import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kira_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/accounts/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("kira_refresh_token");

    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post("/api/accounts/token/refresh/", {
            refresh: refreshToken,
          })
          .then(({ data }) => {
            if (!data.access) {
              throw new Error("Token refresh did not return an access token.");
            }

            localStorage.setItem("kira_access_token", data.access);

            if (data.refresh) {
              localStorage.setItem("kira_refresh_token", data.refresh);
            }

            return data.access;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("kira_access_token");
      localStorage.removeItem("kira_refresh_token");
      window.location.reload();

      return Promise.reject(refreshError);
    }
  }
);

export default api;
