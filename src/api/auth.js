import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    throw new Error("The server returned an invalid authentication token.");
  }
}

function getToken(response) {
  const token = response.headers["x-auth-token"] || response.data;

  if (typeof token !== "string" || token.split(".").length !== 3) {
    throw new Error("The server returned an invalid authentication token.");
  }

  return token;
}

export async function login(credentials) {
  const response = await api.post("/auth", credentials);
  const token = getToken(response);

  return { token, user: decodeToken(token) };
}

export async function register(userDetails) {
  const response = await api.post("/user", userDetails);
  const token = getToken(response);

  return { token, user: decodeToken(token) };
}

export async function deleteAccount(password) {
  const token = window.localStorage.getItem("token");
  const response = await api.delete("/user", {
    data: password,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}


export function saveToLocalStorage(token, user){
    window.localStorage.setItem("loggedIn","true");
    window.localStorage.setItem("token", token)
    window.localStorage.setItem("user", JSON.stringify(user))
}

export function logout(){
    window.localStorage.clear();
}