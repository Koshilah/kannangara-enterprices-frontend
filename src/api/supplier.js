import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

function authConfig() {
  return {
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
  };
}

export async function getSuppliers() {
  const response = await api.get("/supplier", authConfig());
  return response.data.data || [];
}

export async function createSupplier(supplier) {
  const response = await api.post("/supplier", supplier, authConfig());
  return response.data.data;
}

export async function updateSupplier(supplierID, supplier) {
  const response = await api.put(`/supplier/${supplierID}`, supplier, authConfig());
  return response.data.data;
}

export async function deleteSupplier(supplierID) {
  const response = await api.delete(`/supplier/${supplierID}`, authConfig());
  return response.data;
}