import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

function authConfig() {
  const token = window.localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function addToCart(productID) {
  const response = await api.post("/cart", { productID }, authConfig());
  return response.data;
}

export async function getCart() {
  const response = await api.get("/cart", authConfig());
  return response.data.data || [];
}

export async function updateCartQuantity(productID, updatedQuantity) {
  const response = await api.patch(
    "/cart",
    { productID, updatedQuantity },
    authConfig(),
  );
  return response.data;
}

export async function removeFromCart(productID) {
  const response = await api.delete(`/cart/${productID}`, authConfig());
  return response.data;
}
