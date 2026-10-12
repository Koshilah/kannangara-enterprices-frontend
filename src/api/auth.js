import axios from "axios";
import { jwtDecode } from "jwt-decode";

const apiBase = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    throw new Error("The server returned an invalid authentication token.");
  }
}

function getTokenFromResponse(response) {
  const token = response.headers["x-auth-token"] || response.data;

  if (typeof token !== "string" || token.split(".").length !== 3) {
    throw new Error("The server returned an invalid authentication token.");
  }

  return token;
}

export function getAccessToken() {
  return window.localStorage.getItem("token");
}

export function setAccessToken(token) {
  if (token) {
    window.localStorage.setItem("token", token);
    window.localStorage.setItem("loggedIn", "true");
  }
}

export function clearAuthState() {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("loggedIn");
  window.localStorage.removeItem("user");
}

async function refreshAccessToken() {
  try {
    const response = await apiBase.post("/auth/refresh");
    const token = getTokenFromResponse(response);
    setAccessToken(token);
    return token;
  } catch (error) {
    clearAuthState();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw error;
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const isTokenExpiredError =
      status === 401 ||
      (status === 400 && /Access token expired|Invalid token/i.test(message));

    const shouldRefresh =
      isTokenExpiredError &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh") &&
      !originalRequest?.url?.includes("/auth");

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject, originalRequest });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((refreshError) => Promise.reject(refreshError));
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      console.log("new refresh token");
      refreshQueue.forEach(({ resolve }) => resolve(newToken));
      refreshQueue = [];

      originalRequest._retry = true;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return await api(originalRequest);
    } catch (refreshError) {
      refreshQueue.forEach(({ reject }) => reject(refreshError));
      refreshQueue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function login(credentials) {
  const response = await apiBase.post("/auth", credentials);
  const token = getTokenFromResponse(response);

  return { token, user: decodeToken(token) };
}

export async function register(userDetails) {
  const response = await apiBase.post("/user", userDetails);
  const token = getTokenFromResponse(response);

  return { token, user: decodeToken(token) };
}

export async function deleteAccount(password) {
  const response = await api.delete("/user", { data: password });
  return response;
}

export function saveToLocalStorage(token, user) {
  setAccessToken(token);
  window.localStorage.setItem("user", JSON.stringify(user));
}

export async function logout() {
  try {
    await apiBase.post("/auth/logout");
  } catch (error) {
    console.error("Unable to revoke the refresh session", error);
  } finally {
    // Always clear the local session, even when the server is unavailable.
    clearAuthState();
  }
}

export async function verifyEmail(email) {
  const response = await apiBase.post("/auth/verify-email", { email });
  return response.data;
}

export async function resetPassword({ email, password }) {
  const response = await apiBase.post("/auth/reset-password", {
    email,
    password,
  });
  return response.data;
}
