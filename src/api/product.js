import axios from "axios";
import { api } from "./auth";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

export async function getProducts() {
  const response = await publicApi.get("/product");
  return response.data.data || [];
}

export async function createProduct(payload) {
  const response = await api.post("/product", payload);
  return response.data.data;
}

export async function updateProduct(productID, payload) {
  const response = await api.put(`/product/${productID}`, payload);
  return response.data.data;
}

export async function updateProductStock(productID, totalStock) {
  const response = await api.patch(`/product/${productID}/stock`, {
    totalStock,
  });
  return response.data.data;
}

export async function deleteProduct(productID) {
  const response = await api.delete(`/product/${productID}`);
  return response.data;
}
