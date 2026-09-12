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

export async function getOrders() {
  const response = await api.get("/order", authConfig());
  return response.data.data || [];
}

export async function getOrder(orderID) {
  const response = await api.get(`/order/${orderID}`, authConfig());
  return response.data.data;
}

export async function cancelOrder(orderID) {
  const response = await api.patch(
    `/order/${orderID}/cancel`,
    {},
    authConfig(),
  );
  return response.data.data;
}

export async function updatePaymentStatus(orderID, paymentStatus) {
  const response = await api.patch(
    `/order/${orderID}/payment`,
    { paymentStatus },
    authConfig(),
  );
  return response.data.data;
}
