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

export async function getProducts() {
  const response = await api.get("/product", authConfig());
  return response.data.data || [];
}

export async function createProduct(payload) {
  const response = await api.post("/product", payload, authConfig());
  return response.data.data;
}

export async function updateProduct(productID, payload) {
  const response = await api.put(
    `/product/${productID}`,
    payload,
    authConfig(),
  );
  return response.data.data;
}

export async function updateProductStock(productID, totalStock) {
  const response = await api.patch(
    `/product/${productID}/stock`,
    { totalStock },
    authConfig(),
  );
  return response.data.data;
}

export async function deleteProduct(productID) {
  const response = await api.delete(`/product/${productID}`, authConfig());
  return response.data;
}
