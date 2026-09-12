import { api } from "./auth";

export async function addToCart(productID) {
  const response = await api.post("/cart", { productID });
  return response.data;
}

export async function getCart() {
  const response = await api.get("/cart");
  return response.data.data || [];
}

export async function updateCartQuantity(productID, updatedQuantity) {
  const response = await api.patch("/cart", { productID, updatedQuantity });
  return response.data;
}

export async function removeFromCart(productID) {
  const response = await api.delete(`/cart/${productID}`);
  return response.data;
}
