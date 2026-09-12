import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

function authConfig() {
  return { headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` } };
}

export async function getCategories() {
  const response = await api.get("/category");
  return response.data.data || [];
}

export async function createCategory(payload) {
  const response = await api.post("/category", payload, authConfig());
  return response.data.data;
}

export async function toggleCategoryVisibility(categoryID) {
  const response = await api.put(`/category/${categoryID}/toggle-visibility`, {}, authConfig());
  return response.data;
}